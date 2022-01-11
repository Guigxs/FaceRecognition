FROM httpd:2.4

COPY ./app/web/dist/ /usr/local/apache2/htdocs/