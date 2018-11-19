#!/bin/sh

docker rm -v najs-eloquent-mongodb
docker run -p "27017:27017" --name najs-eloquent-mongodb -d mongo
