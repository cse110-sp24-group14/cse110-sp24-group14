#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Error: add container name as command line argument"
    exit 1
fi

docker stop $1
docker rm $1