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
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "120m" });

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
        role,
        name
    });

    user.save().then(user => {
        res.send({
            success: true,
            message: "User created successfully.",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
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


const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Ruta al archivo JSON de credenciales
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
  const token = req.headers.authorization.split(' ')[1];
  const serviceName = `node-red-service-${userId}`;
  const imageName = 'gcr.io/multiuser-node-red/node-red-image';
  const projectId = 'multiuser-node-red';
  const region = 'europe-west1';

  try {
    // Se define la autenticación del servicio creado en la configuración
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS), 
      scopes: ['https://www.googleapis.com/auth/cloud-platform'], 
    });

    const authClient = await auth.getClient(); // Obtiene el cliente de autenticación utilizando las credenciales proporcionadas.

    // Comprueba si el servicio ya está desplegado
    let serviceUrl;
    try {
      const describeRequest = {
        name: `projects/${projectId}/locations/${region}/services/${serviceName}`, // Define el nombre del servicio que se quiere comprobar.
        auth: authClient,
      };
      
      const describeResponse = await run.projects.locations.services.get(describeRequest); // Realiza una solicitud para obtener detalles del servicio.
      serviceUrl = describeResponse.data.status.url; // Obtiene la URL del servicio si ya está desplegado.
      
      // En el caso de que el servicio ya esté desplegado
      if (serviceUrl) {
        console.log('Service already exists:', serviceUrl);

        // Actualizar la variable de entorno JWT_TOKEN
        describeResponse.data.spec.template.spec.containers[0].env = [{
          name: 'JWT_TOKEN',
          value: token,
        }];

        const updateRequest = {
          name: `projects/${projectId}/locations/${region}/services/${serviceName}`, // Define el nombre del servicio a actualizar.
          requestBody: describeResponse.data, // Proporciona el cuerpo de la solicitud con los datos actualizados.
          auth: authClient, // Proporciona el cliente de autenticación para la solicitud.
        };

        const updateResponse = await run.projects.locations.services.replaceService(updateRequest); // Realiza la solicitud para actualizar el servicio.
        serviceUrl = updateResponse.data.status.url; // Obtiene la URL actualizada del servicio.

        return res.status(200).send({
          success: true,
          message: 'Node-RED container updated successfully',
          url: serviceUrl, // Devuelve la URL del servicio actualizado.
        });
      }
    } catch (error) {
      if (error.code === 404) { // Si el servicio no existe (error 404), se procede a crear uno nuevo.
        console.log('Service does not exist, will create a new one.');
      } else {
        throw error; // Si ocurre otro error, lo lanza.
      }
    }

    // Si el servicio no existe, crearlo
    const createRequest = {
      parent: `projects/${projectId}/locations/${region}`, // Define el proyecto y la región donde se creará el servicio.
      requestBody: {
        apiVersion: 'serving.knative.dev/v1', // Especifica la versión de la API para Cloud Run.
        kind: 'Service', // Indica que se está creando un servicio.
        metadata: {
          name: serviceName, // Establece el nombre del servicio.
          namespace: projectId, // Asigna el servicio al espacio de nombres del proyecto.
        },
        spec: {
          template: {
            spec: {
              containers: [
                {
                  image: imageName, // Establece la imagen del contenedor que se utilizará para el servicio.
                  env: [
                    {
                      name: 'JWT_TOKEN',
                      value: token, // Configura la variable de entorno JWT_TOKEN con el token actual.
                    },
                  ],
                },
              ],
            },
          },
        },
      },
      auth: authClient, // Proporciona el cliente de autenticación para la solicitud.
    };

    const createResponse = await run.projects.locations.services.create(createRequest); // Crea el nuevo servicio en Cloud Run.
    console.log('Service deployed:', createResponse.data);

    // Verificar si el servicio está listo y tiene una URL asignada
    const maxRetries = 20; // Máximo número de intentos para verificar si el servicio está listo.
    const delayBetweenRetries = 5000; // 5 segundos de espera entre intentos.
    let retries = 0;

    while (!serviceUrl && retries < maxRetries) {
      const describeRequest = {
        name: `projects/${projectId}/locations/${region}/services/${serviceName}`, // Define el nombre del servicio que se quiere verificar.
        auth: authClient, // Proporciona el cliente de autenticación para la solicitud.
      };

      const describeResponse = await run.projects.locations.services.get(describeRequest); // Realiza una solicitud para obtener detalles del servicio.
      serviceUrl = describeResponse.data.status.url; // Obtiene la URL del servicio si ya está lista.

      // Si no se ha creado el servicio todavía, se hace otro intento
      if (!serviceUrl) {
        console.log(`Esperando a que el servicio esté listo... (Intento ${retries + 1})`);
        retries++;
        await new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
      }
    }

    if (!serviceUrl) {
      throw new Error('El servicio no se ha desplegado correctamente después de varios intentos.');
    }

    // Configurar el acceso público al servicio
    const policyRequest = {
      resource: `projects/${projectId}/locations/${region}/services/${serviceName}`, // Especifica el recurso (servicio) para el cual se establecerá la política.
      auth: authClient, // Proporciona el cliente de autenticación para la solicitud.
    };

    const policyResponse = await run.projects.locations.services.getIamPolicy(policyRequest); // Obtiene la política de IAM actual del servicio.
    const policy = policyResponse.data;

    policy.bindings = policy.bindings || [];
    policy.bindings.push({
      role: 'roles/run.invoker', // Añade la política para permitir invocaciones públicas al servicio.
      members: ['allUsers'], // Todos los usuarios podrán acceder al servicio.
    });

    const setPolicyRequest = {
      resource: `projects/${projectId}/locations/${region}/services/${serviceName}`, // Especifica el recurso para el cual se establecerá la política.
      requestBody: {
        policy: policy, // Proporciona la nueva política para ser aplicada.
      },
      auth: authClient, // Proporciona el cliente de autenticación para la solicitud.
    };

    await run.projects.locations.services.setIamPolicy(setPolicyRequest); // Aplica la política de IAM al servicio.

    return res.status(200).send({
      success: true,
      message: 'Node-RED container started successfully', // Devuelve un mensaje de éxito.
      url: serviceUrl, // Devuelve la URL del servicio desplegado.
    });
  } catch (error) {
    console.error(`Error launching Node-RED container: ${error}`); // Manejo de errores y logging.
    return res.status(500).send({
      success: false,
      message: 'Error launching Node-RED container', // Devuelve un mensaje de error en caso de fallo.
      error: error.message,
    });
  }
});

// Endpoint para detener Node-RED
app.post('/stop-nodered', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const userId = req.user._id;
  const serviceName = `node-red-service-${userId}`;
  const projectId = 'multiuser-node-red'; 
  const region = 'europe-west1';

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, 'multiuser-node-red-a7bc8e2d8abd.json'),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const authClient = await auth.getClient();

    // Obtener el servicio
    const serviceRequest = {
      name: `projects/${projectId}/locations/${region}/services/${serviceName}`,
      auth: authClient,
    };

    // Eliminar el servicio
    const deleteRequest = {
      name: `projects/${projectId}/locations/${region}/services/${serviceName}`,
      auth: authClient,
    };

    await run.projects.locations.services.delete(deleteRequest);
    console.log('Service deleted:', serviceName);

    return res.status(200).send({
      success: true,
      message: 'Node-RED service stopped and removed successfully',
    });
  } catch (error) {
    console.error(`Error stopping Node-RED service: ${error}`);
    return res.status(500).send({
      success: false,
      message: 'Error stopping Node-RED service',
      error: error.message,
    });
  }
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
