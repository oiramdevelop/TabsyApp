FROM php:8.4-fpm

# Extensiones PHP necesarias (bcmath: requerida por laravel/cashier)
RUN docker-php-ext-install pdo pdo_mysql bcmath

# Instalar Node.js 20 (para Tailwind CLI)
RUN apt-get update && apt-get install -y curl unzip git && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer