#!/bin/sh
sed -i -e 's/HTTP_PORT/'"${PORT}"'/g' /etc/nginx/conf.d/default.conf
sed -i -e 's/APP_HOST/'"${APP_HOST}"'/g' /etc/nginx/conf.d/default.conf
sed -i -e 's/WS_HOST/'"${WS_HOST}"'/g' /etc/nginx/conf.d/default.conf

npm start &
exec nginx -g 'daemon off;'