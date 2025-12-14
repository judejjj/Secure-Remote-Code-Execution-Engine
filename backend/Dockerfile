FROM alpine:latest

# Install execution environments
RUN apk add --no-cache python3 build-base openjdk11 nodejs

# Set working directory
WORKDIR /usr/src/app

# We don't COPY . . because we mount the code file dynamically or pass it via some other method.
# But for this simple implementation, the container is just the runtime environment.
# The server will spin up a NEW container for each request, likely mounting the temp file 
# or passing code via stdin if strictly ephemeral. 
# However, the user asked for `child_process.exec` to run a docker container.
# So this image serves as the 'runner'.

CMD ["sh"]
