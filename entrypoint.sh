#!/bin/sh
sed -i -e 's/HTTP_PORT/'"${PORT}"'/g' /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'