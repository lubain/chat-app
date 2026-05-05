# ── Étape 1 : Build ───────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# npm install au lieu de npm ci — plus flexible sur les versions
RUN npm install
COPY . .
RUN npm run build

# ── Étape 2 : Production allégée ──────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
