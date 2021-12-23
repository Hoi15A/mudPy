FROM node:16

LABEL org.opencontainers.image.authors="albreaus@students.zhaw.ch, holzest3@students.zhaw.ch"


# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install && npm cache clean --force
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./backend ./

EXPOSE 8080
CMD [ "node", "index.js" ]
