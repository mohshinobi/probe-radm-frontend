# Use official PHP 8.2 with Apache
FROM php:8.2-apache

# Install system dependencies, build tools & PHP extensions
RUN apt-get update && apt-get install -y \
    apache2-dev \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libicu-dev \
    libfreetype6-dev \
    libonig-dev \
    libzip-dev \
    libxml2-dev \
    libxslt-dev \
    unzip \
    nano \
    jq \
    git \
    curl \
    mariadb-client \
    openssl \
    libmaxminddb0 \
    libmaxminddb-dev \
    mmdb-bin \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) \
      pdo \
      pdo_mysql \
      mbstring \
      zip \
      gd \
      opcache \
      intl \
      xml \
      dom \
      simplexml \
      xsl \
      sockets \
  && a2enmod rewrite ssl proxy proxy_http

# Build and install mod_maxminddb (since no apt package available)
RUN git clone --depth 1 https://github.com/maxmind/mod_maxminddb.git /tmp/mod_maxminddb \
  && cd /tmp/mod_maxminddb \
  && ./bootstrap \
  && ./configure \
  && make \
  && make install \
  && a2enmod maxminddb \
  && rm -rf /tmp/mod_maxminddb

#Activater le ssh https
RUN a2enmod ssl

# Générer les certificats
RUN   echo "Generating self-signed certificate..."
RUN   openssl req -x509 -newkey rsa:4096 -nodes \
        -out "/etc/ssl/certs/radm-frontent.crt" \
        -keyout "/etc/ssl/certs/radm-frontent.key" \
        -subj "/CN=172.25.0.6"

# update certificates
RUN update-ca-certificates

COPY apache2/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY apache2/ports.conf /etc/apache2/ports.conf

#Activer le module rewrite d'Apache
RUN a2enmod rewrite
RUN a2enmod proxy
RUN a2enmod proxy_http

# Create frontend directory
RUN mkdir -p /var/www/html/frontend

# copy only the compiled project
COPY ./dist/radm-frontend/browser /var/www/html/frontend
COPY ./maxmind/* /usr/share/GeoIP/*

#Donner les droits à apache 2
RUN chown -R www-data:www-data /var/www/html/
RUN chgrp -R www-data /var/www/html/

#Configurer Apache pour Symfony
ENV APACHE_DOCUMENT_ROOT /var/www/html/frontend

#Exposer le port 8000 and 443
EXPOSE 8000
EXPOSE 443
