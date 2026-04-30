FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tzdata wget
ENV TZ=America/Sao_Paulo

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1