# Usa una imagen base de Node.js
FROM node:latest

# Establece el directorio de trabajo dentro del contenedor. 
WORKDIR /multiuser-node-red

# Copia los archivos package.json y package-lock.json al directorio de trabajo en el contenedor.
COPY package*.json ./

# Instala las dependencias necesarias utilizando npm.
RUN npm install

# Copia todo el código fuente de la aplicación al directorio de trabajo en el contenedor.
COPY . .

# Expone el puerto 3000 en el contenedor.
EXPOSE 3000

# Se ejecuta la aplicación en modo de producción
CMD ["npm", "run", "start"]
