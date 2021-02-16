FROM node:14

# Create app directory
WORKDIR /usr/src/qoa-app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build app
RUN npm run build

EXPOSE 8081

CMD [ "npm", "start" ]
