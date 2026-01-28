FROM node:18-slim

# Instalar dependencias necesarias para Chromium
RUN apt-get update && apt-get install -y \
  git \
  chromium \
  ca-certificates \
  fonts-liberation \
  libnss3 \
  libatk1.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Variables para Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Directorio de trabajo
WORKDIR /service

# Variables de entorno
ENV NODE_ENV=production

# Copiar dependencias primero
COPY package*.json ./
RUN npm install --production

# Copiar el resto del código
COPY . .

# Puerto interno
EXPOSE 3000

CMD ["node", "index.js"]
