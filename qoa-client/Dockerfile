FROM node:14 AS build

# Create app directory
WORKDIR /usr/src/qoa-app


# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build app
RUN npm run build


FROM nginx:1.17.1-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/qoa-app/dist/qoa-client usr/share/nginx/html

