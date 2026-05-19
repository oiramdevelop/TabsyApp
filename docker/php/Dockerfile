FROM php:8.4-fpm

# Extensiones PHP necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Instalar Node.js 20 (para Tailwind CLI)
RUN apt-get update && apt-get install -y curl unzip git && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer