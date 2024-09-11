const { exec } = require('child_process');

let portCounter = 1880; // Puerto inicial
const userPortMap = {}; // Mapeo de userId a puertos

const assignPortToUser = (userId) => {
    if (!userPortMap[userId]) {
        userPortMap[userId] = portCounter++;
    }
    return userPortMap[userId];
};

// Servicio para iniciar el contenedor de Node-RED
const startNoderedContainer = (userId, token) => {
    return new Promise((resolve, reject) => {
        const userPort = assignPortToUser(userId); // Asignar un puerto único a cada usuario
        const command = `docker run -d -e JWT_TOKEN="${token}" --name nodered-${userId} -p ${userPort}:1880 node-red-modified:latest`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(new Error(`Error launching Node-RED container: ${stderr}`));
            }

            // Esperar 10 segundos antes de devolver la respuesta
            setTimeout(() => {
                resolve({
                    containerId: stdout.trim(),
                    port: userPort
                });
            }, 10000); // 10 segundos de espera
        });
    });
};

// Servicio para detener el contenedor de Node-RED
const stopNoderedContainer = (userId) => {
    return new Promise((resolve, reject) => {
        const command = `docker stop nodered-${userId} && docker rm nodered-${userId}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(new Error(`Error stopping Node-RED container: ${stderr}`));
            }
            resolve();
        });
    });
};

module.exports = {
    startNoderedContainer,
    stopNoderedContainer
};
