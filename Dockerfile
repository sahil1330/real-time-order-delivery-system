# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.9.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Copy package.json so that package manager commands can be used.
COPY package.json .
COPY package-lock.json .

RUN npm install

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN npm run build

# Use production node environment by default.
ENV NODE_ENV=production

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012 3013 3014 3015 3016 3017 3018 3019 3020

# Run the application.
CMD ["npm", "start"]
