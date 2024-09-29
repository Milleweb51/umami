#!/bin/bash

git pull

docker compose down --rmi local

docker compose up --build -d

docker ps -a
