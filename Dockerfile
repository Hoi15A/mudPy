FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install && npm cache clean --force
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./backend ./

EXPOSE 8080
CMD [ "node", "index.js" ]
