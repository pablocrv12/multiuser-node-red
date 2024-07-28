# Usa una imagen base de Node.js
FROM node:latest

# Instala git
RUN apt-get update && apt-get install -y git && apt-get clean

RUN git clone --branch Production https://github.com/pablocrv12/multiuser-node-red

WORKDIR /multiuser-node-red

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]

# construir con: docker build --no-cache -t multiuser-node-red:latest .

# ejecutar con: docker run -d --name multiuser-nodered -p 3000:3000 multiuser-node-red:latest