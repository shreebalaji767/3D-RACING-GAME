FROM nginx:alpine

# Serve the static game from Nginx with explicit cache and policy headers.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

EXPOSE 80
