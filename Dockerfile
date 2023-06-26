#Acá estoy usando la imagen oficial de node como base
FROM node:18

# elijo el directorio para que trabaje el container
WORKDIR /app

#copio los archivos de la aplicacion al directorio
COPY . /app

#instalo las dependencias
RUN npm install

#expongo el puerto a ver si funciona
EXPOSE 3001

#defino los puntos de entrada para el container
CMD ["npm", "start"]