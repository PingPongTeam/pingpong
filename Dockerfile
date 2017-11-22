FROM debian:stable

ENV NVM_VERSION v0.33.0
ENV NODE_VERSION 9.2.0
ENV NVM_DIR /root/.nvm

# Install pre-reqs
RUN apt-get update
RUN apt-get -y install curl build-essential postgresql postgresql-client

# Start postgres
RUN /etc/init.d/postgresql start

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | bash


# Install NODE
#RUN bash -l -c "source ~/.bashrc"
RUN . ~/.bashrc; \
    nvm install v$NODE_VERSION; \
    nvm use v$NODE_VERSION;


# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Create app directory
WORKDIR /usr/src/app

#Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8080
EXPOSE 3000
CMD [ "npm", "start"]

