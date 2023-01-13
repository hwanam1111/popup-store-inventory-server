#!/bin/sh

DOCKER_IMAGE_NAME=createjump-inventory-backend-server-image
DOCKER_CONTAINER_NAME=createjump-inventory-backend-server-container
docker build -t ${DOCKER_IMAGE_NAME} .
docker run -d -p 3001:3000 --name ${DOCKER_CONTAINER_NAME} ${DOCKER_IMAGE_NAME}