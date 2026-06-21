FROM nginx:1.25-alpine
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY index.html 404.html app.js styles.css wbs.json /usr/share/nginx/html/
COPY docs/user-guide.md /usr/share/nginx/html/docs/
<<<<<<< HEAD
EXPOSE 80
USER 1000
=======

# Strix security scan recommendation: switch to non-root user
# For nginx to work as non-root, it needs access to run/cache directories
RUN touch /var/run/nginx.pid && \
  chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx

USER nginx
EXPOSE 8080
>>>>>>> origin/develop
CMD ["nginx", "-g", "daemon off;"]
