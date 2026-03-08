FROM php:8.1-cli

WORKDIR /app

# Copy project files
COPY . .

# Install composer dependencies
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev

# Expose port
EXPOSE 8080

# Start PHP server with router for API routes
CMD ["php", "-S", "0.0.0.0:8080", "router.php"]
