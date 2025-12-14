FROM alpine:latest

# Install execution environments
# Install execution environments AND docker-cli (for DinD)
RUN apk add --no-cache python3 build-base openjdk11 nodejs docker-cli

# Set working directory
WORKDIR /usr/src/app

# Copy the backend code (server.js, etc)
COPY . .

# Run the server
CMD ["node", "server.js"]
