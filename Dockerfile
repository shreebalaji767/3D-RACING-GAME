FROM nginx:alpine

# Serve the static game with explicit MIME types and fresh HTML/JS after deploys.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

EXPOSE 80
