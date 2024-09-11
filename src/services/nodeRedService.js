const { google } = require('googleapis');
const path = require('path');
const run = google.run('v1');

const startNodeRed = async (userId, token) => {
    const serviceName = `node-red-service-${userId}`;
    const imageName = 'gcr.io/multiuser-node-red/node-red-image';
    const projectId = 'multiuser-node-red';
    const region = 'europe-west1';

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();

        let serviceUrl;
        try {
            const describeRequest = {
                name: `projects/${projectId}/locations/${region}/services/${serviceName}`,
                auth: authClient,
            };

            const describeResponse = await run.projects.locations.services.get(describeRequest);
            serviceUrl = describeResponse.data.status.url;

            if (serviceUrl) {
                console.log('Service already exists:', serviceUrl);

                describeResponse.data.spec.template.spec.containers[0].env = [{
                    name: 'JWT_TOKEN',
                    value: token,
                }];

                const updateRequest = {
                    name: `projects/${projectId}/locations/${region}/services/${serviceName}`,
                    requestBody: describeResponse.data,
                    auth: authClient,
                };

                const updateResponse = await run.projects.locations.services.replaceService(updateRequest);
                serviceUrl = updateResponse.data.status.url;

                return {
                    success: true,
                    message: 'Node-RED container updated successfully',
                    url: serviceUrl,
                };
            }
        } catch (error) {
            if (error.code === 404) {
                console.log('Service does not exist, will create a new one.');
            } else {
                throw error;
            }
        }

        const createRequest = {
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

        const createResponse = await run.projects.locations.services.create(createRequest);
        console.log('Service deployed:', createResponse.data);

        const maxRetries = 20;
        const delayBetweenRetries = 5000; // 5 segundos de espera entre intentos.
        let retries = 0;

        while (!serviceUrl && retries < maxRetries) {
            const describeRequest = {
                name: `projects/${projectId}/locations/${region}/services/${serviceName}`,
                auth: authClient,
            };

            const describeResponse = await run.projects.locations.services.get(describeRequest);
            serviceUrl = describeResponse.data.status.url;

            if (!serviceUrl) {
                console.log(`Esperando a que el servicio esté listo... (Intento ${retries + 1})`);
                retries++;
                await new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
            }
        }

        if (!serviceUrl) {
            throw new Error('El servicio no se ha desplegado correctamente después de varios intentos.');
        }

        const policyRequest = {
            resource: `projects/${projectId}/locations/${region}/services/${serviceName}`,
            auth: authClient,
        };

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

        await run.projects.locations.services.setIamPolicy(setPolicyRequest);

        return {
            success: true,
            message: 'Node-RED container started successfully',
            url: serviceUrl,
        };
    } catch (error) {
        throw new Error(`Error launching Node-RED container: ${error.message}`);
    }
};

const stopNodeRed = async (userId) => {
    const serviceName = `node-red-service-${userId}`;
    const projectId = 'multiuser-node-red';
    const region = 'europe-west1';

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();

        const deleteRequest = {
            name: `projects/${projectId}/locations/${region}/services/${serviceName}`,
            auth: authClient,
        };

        await run.projects.locations.services.delete(deleteRequest);
        console.log('Service deleted:', serviceName);

        return {
            success: true,
            message: 'Node-RED service stopped and removed successfully',
        };
    } catch (error) {
        throw new Error(`Error stopping Node-RED service: ${error.message}`);
    }
};

module.exports = {
    startNodeRed,
    stopNodeRed,
};
