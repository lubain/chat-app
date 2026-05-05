# ── Étape 1 : Build ───────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Installer toutes les dépendances (dev incluses pour TypeScript)
COPY package*.json ./
RUN npm ci

# Copier les sources et compiler
COPY . .
RUN npm run build

# ── Étape 2 : Production allégée ──────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copier le build compilé
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
