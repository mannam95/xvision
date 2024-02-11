# Get Alpine Linux
FROM node:16.10.0-alpine AS node

# Install bash, sudo, and git
RUN apk add bash \
    sudo \
    git

# change working directory
WORKDIR /backend

# copy package.json
COPY package.json ./

# install dependencies
RUN npm install --force

# Bundle app source
COPY . ./

# Export port 3000
EXPOSE 3000

# start app
CMD ["node", "server.js"]

# CMD ["tail", "-f", "/dev/null"]
