const express = require("express");
const cors = require('cors');
const passport = require('passport');
const v1FlowRouter = require("./v1/routes/flowRoutes");
const v1ClassRouter = require("./v1/routes/classRoutes");
const v1UserRouter = require("./v1/routes/userRoutes");
const v1noderedRouter = require("./v1/routes/noderedRoutes");
const initDb = require("./config/db");
const path = require('path');
const UserModel = require('./models/User');
const { hashSync, compareSync } = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
require('dotenv').config();
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

let portCounter = 1880; // Puerto inicial
const userPortMap = {}; // Mapeo de userId a puertos

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

require('./config/passport');

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
    UserModel.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "Could not find the user."
            });
        }

        if (!compareSync(req.body.password, user.password)) {
            return res.status(401).send({
                success: false,
                message: "Incorrect password"
            });
        }

        const payload = { email: user.email, id: user._id };
        const token = jwt.sign(payload, "Random string", { expiresIn: "60m" });

        return res.status(200).send({
            success: true,
            message: "Logged in successfully!",
            token: "Bearer " + token,
            userId: user._id
        });
    });
});

// Ruta de registro
app.post('/register', (req, res) => {
    const { email, password, role, name } = req.body;
    const user = new UserModel({
        email,
        password: hashSync(password, 10),
        role, // Guardar el rol como cadena
        name // Guardar el nombre
    });

    user.save().then(user => {
        res.send({
            success: true,
            message: "User created successfully.",
            user: {
                id: user._id,
                email: user.email,
                role: user.role, // Devolver el rol del usuario
                name: user.name // Devolver el nombre del usuario
            }
        });
    }).catch(err => {
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error: err.message
        });
    });
});


// Ruta protegida
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.status(200).send({
        success: true,
        user: {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Iniciar Node-REd

const assignPortToUser = (userId) => {
    if (!userPortMap[userId]) {
        userPortMap[userId] = portCounter++;
    }
    return userPortMap[userId];
};

const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth({
    keyFile: 'multiuser-node-red-a7bc8e2d8abd.json', // Ruta al archivo JSON de credenciales
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

// Ruta al archivo de la cuenta de servicio
const keyFilePath = path.join(__dirname, 'multiuser-node-red-a7bc8e2d8abd.json');

// Función para ejecutar comandos
function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}


const run = google.run('v1');
const iam = google.iam('v1');
app.post('/start-nodered', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const userId = req.user._id;
  const token = req.headers.authorization.split(' ')[1]; // Obtener el token sin "Bearer"
  const serviceName = `node-red-service-${userId}`;
  const imageName = 'gcr.io/multiuser-node-red/node-red-image';
  const projectId = 'multiuser-node-red';
  const region = 'europe-west1';

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, 'multiuser-node-red-a7bc8e2d8abd.json'),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const authClient = await auth.getClient();

    // Desplegar el servicio en Cloud Run
    const request = {
      parent: `projects/${projectId}/locations/${region}`,
      requestBody: {
        apiVersion: 'serving.knative.dev/v1',
        kind: 'Service',
        metadata: {
          name: serviceName,
          namespace: projectId,
        },
        spec: {
          template: {
            spec: {
              containers: [
                {
                  image: imageName,
                  env: [
                    {
                      name: 'JWT_TOKEN',
                      value: token,
                    },
                  ],
                },
              ],
            },
          },
        },
      },
      auth: authClient,
    };

    const response = await run.projects.locations.services.create(request);
    console.log('Service deployed:', response.data);

    // Verificar si el servicio está listo y tiene una URL asignada
    let serviceUrl;
    const maxRetries = 20; // Máximo número de intentos
    const delayBetweenRetries = 5000; // 5 segundos entre intentos
    let retries = 0;

    while (!serviceUrl && retries < maxRetries) {
      // Obtener la URL del servicio
      const describeRequest = {
        name: `projects/${projectId}/locations/${region}/services/${serviceName}`,
        auth: authClient,
      };

      const describeResponse = await run.projects.locations.services.get(describeRequest);
      serviceUrl = describeResponse.data.status.url;

      if (serviceUrl) {
        break; // Salir del bucle si se ha asignado la URL
      }

      console.log(`Esperando a que el servicio esté listo... (Intento ${retries + 1})`);
      retries++;
      await new Promise(resolve => setTimeout(resolve, delayBetweenRetries)); // Esperar antes de intentar de nuevo
    }

    if (!serviceUrl) {
      throw new Error('El servicio no se ha desplegado correctamente después de varios intentos.');
    }

    // Configurar el acceso público al servicio
    const policyRequest = {
      resource: `projects/${projectId}/locations/${region}/services/${serviceName}`,
      auth: authClient,
    };

    // Añadir la política de invocación pública
    const policyResponse = await run.projects.locations.services.getIamPolicy(policyRequest);
    const policy = policyResponse.data;

    policy.bindings = policy.bindings || [];
    policy.bindings.push({
      role: 'roles/run.invoker',
      members: ['allUsers'],
    });

    const setPolicyRequest = {
      resource: `projects/${projectId}/locations/${region}/services/${serviceName}`,
      requestBody: {
        policy: policy,
      },
      auth: authClient,
    };

    // Actualizar la política de IAM para el servicio
    await run.projects.locations.services.setIamPolicy(setPolicyRequest);

    return res.status(200).send({
      success: true,
      message: 'Node-RED container started successfully',
      url: serviceUrl,
    });
  } catch (error) {
    console.error(`Error launching Node-RED container: ${error}`);
    return res.status(500).send({
      success: false,
      message: 'Error launching Node-RED container',
      error: error.message,
    });
  }
});

// Endpoint para detener Node-RED
app.post('/stop-nodered', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userId = req.user._id;

    const command = `docker stop nodered-${userId} && docker rm nodered-${userId}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error stopping Node-RED container: ${error}`);
            return res.status(500).send({
                success: false,
                message: 'Error stopping Node-RED container',
                error: error.message
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Node-RED container stopped and removed successfully'
        });
    });
});

// Rutas adicionales
app.use("/api/v1/flow", v1FlowRouter);
app.use("/api/v1/user", v1UserRouter);
app.use("/api/v1/class", v1ClassRouter);
app.use("/api/v1/node", v1noderedRouter);

// Iniciar servidor
app.listen(PORT, () => {
    console.log("Server listening on port: " + PORT);
});

initDb();
