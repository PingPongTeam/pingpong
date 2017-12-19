# only use latest in dev environment, if you move this to production pin down the specific verision
FROM node:9.3

RUN mkdir -p /opt/app

# set the environment type of the node server. This can be either dev or prod.
# dockerfile will default it to prod, the composer file will later override this
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 3000.
EXPOSE 3000

# creating a healthcheck that will ensure that this server will return HTTP 200 every 30 sec
# HEALTHCHECK CMD curl -fs http://localhost:3000/healthz || exit 1

# install dependencies first, in a different location for easier app bind mounting for local development
WORKDIR /opt
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
ENV PATH /opt/node_modules/.bin:$PATH

# copy in our source code last, as it changes the most
WORKDIR /opt/app
COPY . /opt/app

# run server
CMD [ "npm", "start" ]