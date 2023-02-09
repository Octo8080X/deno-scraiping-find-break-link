FROM denoland/deno:1.30.2

RUN apt-get update && apt-get install
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
