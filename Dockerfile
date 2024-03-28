# Usa una imagen base de Node.js 18
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos necesarios
COPY package*.json ./
COPY . .

# Instala las dependencias
RUN npm install

# Expone el puerto 3000
EXPOSE 3000

# Comando de inicio
CMD [ "npm", "run", "start" ]