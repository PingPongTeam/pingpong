#!/bin/sh

set -x

# Do database migrations
sequelize db:migrate:status
sequelize db:migrate

# run the node server 
exec $START_CMD
