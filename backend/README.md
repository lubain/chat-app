# 🔧 Chat App — Backend

API REST et WebSocket temps réel construite avec **NestJS**, **TypeORM** (PostgreSQL), **Redis** et **Socket.IO**, organisée en **Clean Architecture**.

---

## Table des matières

1. [Stack technique](#stack-technique)
2. [Architecture](#architecture)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Prérequis](#prérequis)
5. [Installation](#installation)
6. [Variables d'environnement](#variables-denvironnement)
7. [Lancer le projet](#lancer-le-projet)
8. [Base de données](#base-de-données)
9. [API REST](#api-rest)
10. [WebSocket — Gateway](#websocket--gateway)
11. [Modules NestJS](#modules-nestjs)
12. [Couches de l'architecture](#couches-de-larchitecture)
13. [Redis — Présence](#redis--présence)
14. [Sécurité](#sécurité)
15. [Build & Déploiement](#build--déploiement)

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| NestJS | 11 | Framework Node.js |
| TypeScript | 6 | Typage statique |
| TypeORM | 0.3 | ORM PostgreSQL |
| PostgreSQL | 16 | Base de données principale |
| Redis | 7 | Présence utilisateurs (online/offline) |
| Socket.IO | 4.8 | WebSocket temps réel |
| Passport + JWT | — | Authentification |
| bcrypt | 6 | Hachage des mots de passe |
| class-validator | 0.15 | Validation des DTOs |
| Docker Compose | — | Infra locale (Postgres + Redis) |

---

## Architecture

Le projet suit les principes de la **Clean Architecture**. Les dépendances pointent toujours **vers l'intérieur** : la couche `domain` ne dépend de rien, `application` dépend seulement de `domain`, et `infrastructure` implémente les interfaces définies par `domain`.

```
┌──────────────────────────────────────────────┐
│             Presentation                     │
│  Controllers HTTP · Gateway WebSocket        │
│  Guards · Decorators                         │
├──────────────────────────────────────────────┤
│             Application                      │
│  Use Cases · DTOs · Ports (interfaces)       │
│  ApplicationModule                           │
├──────────────────────────────────────────────┤
│             Infrastructure                   │
│  TypeORM Repositories · Redis Presence       │
│  ORM Entities · Migrations                   │
├──────────────────────────────────────────────┤
│             Domain                           │
│  Entities · Repository Interfaces            │
│  Value Objects (Email)                       │
└──────────────────────────────────────────────┘
```

**Principe d'inversion de dépendances (DIP)** : les use cases ne connaissent jamais TypeORM ni Redis. Ils utilisent des interfaces (`IUserRepository`, `IPresenceService`) injectées par NestJS.

---

## Structure des dossiers

```
src/
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts              # Entité User (pure TS, pas de décorateurs ORM)
│   │   ├── conversation.entity.ts      # Entité Conversation
│   │   └── message.entity.ts          # Entité Message + MessageStatus enum
│   ├── repositories/
│   │   ├── user.repository.interface.ts
│   │   ├── conversation.repository.interface.ts
│   │   └── message.repository.interface.ts
│   └── value-objects/
│       └── email.vo.ts                 # Validation email à l'instantiation
│
├── application/
│   ├── dtos/
│   │   ├── auth.dto.ts                 # RegisterDto, LoginDto, AuthResponseDto
│   │   ├── conversation.dto.ts         # CreateConversationDto, ConversationResponseDto
│   │   └── message.dto.ts             # SendMessageDto, MessageResponseDto, GetMessagesDto
│   ├── ports/
│   │   └── presence.service.interface.ts  # IPresenceService (contrat Redis)
│   ├── use-cases/
│   │   ├── auth/
│   │   │   ├── register-user.use-case.ts
│   │   │   ├── login-user.use-case.ts
│   │   │   └── logout-user.use-case.ts
│   │   ├── chat/
│   │   │   ├── send-message.use-case.ts
│   │   │   ├── get-messages.use-case.ts
│   │   │   ├── get-conversations.use-case.ts
│   │   │   └── create-conversation.use-case.ts
│   │   └── user/
│   │       └── get-users.use-case.ts
│   └── application.module.ts
│
├── infrastructure/
│   ├── database/
│   │   ├── entities/                   # ORM entities TypeORM (décorateurs @Entity)
│   │   │   ├── user.orm-entity.ts
│   │   │   ├── conversation.orm-entity.ts
│   │   │   └── message.orm-entity.ts
│   │   ├── repositories/               # Implémentations TypeORM des interfaces domain
│   │   │   ├── user.repository.ts
│   │   │   ├── conversation.repository.ts
│   │   │   └── message.repository.ts
│   │   └── migrations/
│   │       └── 1700000000000-InitialSchema.ts
│   ├── redis/
│   │   └── redis-presence.service.ts  # Implémentation IPresenceService via ioredis
│   └── infrastructure.module.ts       # Fournit les tokens d'injection
│
├── presentation/
│   ├── controllers/
│   │   ├── auth.controller.ts          # POST /auth/register · /login · GET /auth/me
│   │   ├── conversation.controller.ts  # GET/POST /conversations · GET /messages
│   │   └── users.controller.ts         # GET /users
│   ├── gateways/
│   │   └── chat.gateway.ts            # WebSocket namespace /chat
│   ├── guards/
│   │   └── jwt-auth.guard.ts          # JwtAuthGuard + WsJwtAuthGuard
│   ├── decorators/
│   │   └── current-user.decorator.ts  # @CurrentUser() · @WsCurrentUser()
│   └── presentation.module.ts
│
├── shared/
│   ├── config/
│   │   ├── jwt.strategy.ts            # PassportStrategy JWT
│   │   └── typeorm.config.ts          # DataSource pour CLI migrations
│   ├── filters/
│   │   └── global-exception.filter.ts # Normalise toutes les exceptions en JSON
│   └── interceptors/
│       └── logging.interceptor.ts     # Log METHOD /path STATUS Xms
│
├── app.module.ts                       # Module racine (TypeORM + Config + Présentation)
└── main.ts                            # Bootstrap (CORS, ValidationPipe, filtres, port)
```

---

## Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Docker** + **Docker Compose** (pour PostgreSQL et Redis)

---

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd backend

# Installer les dépendances
npm install

# Copier la configuration d'environnement
cp .env.example .env
```

---

## Variables d'environnement

Fichier `.env` à la racine du backend :

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=chat_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # laisser vide si pas de mot de passe

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

> ⚠️ En production, `JWT_SECRET` doit être une chaîne aléatoire longue (min. 32 caractères). Ne jamais committer le `.env` réel.

---

## Lancer le projet

### 1. Démarrer PostgreSQL et Redis

```bash
docker-compose up -d
```

Vérifie que les services sont sains :

```bash
docker-compose ps
# postgres   Up   (healthy)
# redis      Up   (healthy)
```

### 2. Démarrer le serveur

```bash
# Mode développement (hot reload)
npm run start:dev

# Mode production
npm run build && npm run start:prod
```

Le serveur est accessible sur :
- **REST API** : `http://localhost:3000/api/v1`
- **WebSocket** : `ws://localhost:3000/chat`

### 3. Vérification TypeScript

```bash
npx tsc --noEmit
```

---

## Base de données

### Schéma

Le schéma est créé automatiquement en développement (`synchronize: true` hors production).

En production, utilisez les **migrations** :

```bash
# Générer une migration après modification des entités ORM
npm run migration:generate

# Appliquer les migrations
npm run migration:run

# Annuler la dernière migration
npm run migration:revert
```

### Tables

#### `users`

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID PK | Identifiant unique |
| `name` | VARCHAR(100) | Nom affiché |
| `email` | VARCHAR(255) UNIQUE | Email (identifiant de connexion) |
| `password_hash` | TEXT | Mot de passe haché (bcrypt, salt=12) |
| `avatar_url` | TEXT | URL de l'avatar |
| `status` | VARCHAR(20) | `online` \| `offline` \| `away` |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Dernière modification |

#### `conversations`

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID PK | Identifiant unique |
| `participant_ids` | UUID[] | Tableau des 2 participants |
| `last_message_id` | UUID nullable | Référence au dernier message |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Dernière activité |

> Index GIN sur `participant_ids` pour les recherches par participant.

#### `messages`

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID PK | Identifiant unique |
| `conversation_id` | UUID FK | Conversation parente |
| `sender_id` | UUID FK | Expéditeur |
| `content` | TEXT | Contenu du message |
| `status` | VARCHAR(20) | `sent` \| `delivered` \| `read` |
| `created_at` | TIMESTAMPTZ | Date d'envoi |
| `updated_at` | TIMESTAMPTZ | Dernière modification |

> Index composite sur `(conversation_id, created_at DESC)` pour la pagination.

---

## API REST

Préfixe global : `/api/v1`

Toutes les routes protégées nécessitent le header :
```
Authorization: Bearer <access_token>
```

### Authentification

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Créer un compte |
| `POST` | `/auth/login` | ❌ | Se connecter |
| `GET` | `/auth/me` | ✅ | Profil courant |

#### `POST /auth/register`

```json
// Body
{
  "name": "Alice Dupont",
  "email": "alice@exemple.com",
  "password": "motdepasse123"
}

// Response 201
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "Alice Dupont",
    "email": "alice@exemple.com",
    "avatarUrl": "https://i.pravatar.cc/150?u=...",
    "status": "online"
  }
}
```

#### `POST /auth/login`

```json
// Body
{ "email": "alice@exemple.com", "password": "motdepasse123" }

// Response 200
{ "accessToken": "eyJhbGc...", "user": { ... } }
```

---

### Conversations

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/conversations` | Lister les conversations de l'utilisateur courant |
| `POST` | `/conversations` | Créer ou retrouver une conversation |
| `GET` | `/conversations/:id/messages` | Messages paginés |

#### `GET /conversations`

```json
// Response 200
[
  {
    "id": "conv-uuid",
    "participant": {
      "id": "user-uuid",
      "name": "Bob Martin",
      "avatarUrl": "https://...",
      "status": "online"
    },
    "lastMessage": {
      "content": "À demain !",
      "createdAt": "2025-01-15T14:30:00Z",
      "senderId": "user-uuid"
    },
    "unreadCount": 3,
    "updatedAt": "2025-01-15T14:30:00Z"
  }
]
```

#### `POST /conversations`

```json
// Body
{ "targetUserId": "user-uuid" }

// Response 201 — même structure que GET /conversations[0]
```

#### `GET /conversations/:id/messages?limit=50&before=2025-01-15T14:00:00Z`

```json
// Query params
// limit  : nombre de messages (défaut 50)
// before : curseur ISO date pour pagination (messages plus anciens)

// Response 200 — tableau ordonné chronologiquement (oldest → newest)
[
  {
    "id": "msg-uuid",
    "conversationId": "conv-uuid",
    "senderId": "user-uuid",
    "content": "Bonjour !",
    "status": "read",
    "createdAt": "2025-01-15T14:00:00Z"
  }
]
```

---

### Utilisateurs

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/users` | Lister tous les utilisateurs (hors soi-même) |
| `GET` | `/users?q=alice` | Rechercher par nom |

```json
// Response 200
[
  {
    "id": "user-uuid",
    "name": "Alice Dupont",
    "avatarUrl": "https://...",
    "status": "online"
  }
]
```

---

### Format d'erreur

Toutes les erreurs suivent ce format uniforme :

```json
{
  "statusCode": 400,
  "timestamp": "2025-01-15T14:00:00.000Z",
  "path": "/api/v1/auth/login",
  "message": ["Email already in use"]
}
```

---

## WebSocket — Gateway

Namespace : `/chat`

### Connexion

Le token JWT est passé dans l'objet `auth` du handshake :

```js
const socket = io("http://localhost:3000/chat", {
  auth: { token: "eyJhbGc..." },
  transports: ["websocket"],
});
```

Au moment de la connexion, le serveur :
1. Vérifie le JWT
2. Enregistre le `socketId` dans Redis (`presence:userId`)
3. Inscrit le socket dans les rooms de toutes les conversations de l'utilisateur
4. Émet `user:online` à tous les clients connectés

### Événements client → serveur

| Événement | Payload | Description |
|---|---|---|
| `message:send` | `{ conversationId: string, content: string }` | Envoyer un message |
| `message:read` | `{ conversationId: string }` | Marquer une conversation comme lue |
| `typing:start` | `{ conversationId: string }` | Signaler que l'utilisateur tape |
| `typing:stop` | `{ conversationId: string }` | Signaler que l'utilisateur a arrêté |
| `conversation:join` | `{ conversationId: string }` | Rejoindre une room de conversation |

### Événements serveur → client

| Événement | Payload | Description |
|---|---|---|
| `message:new` | `MessageResponseDto` | Nouveau message dans une conversation |
| `message:status` | `{ messageId: string, status: string }` | Statut mis à jour (delivered/read) |
| `message:read` | `{ conversationId: string, readBy: string }` | Messages lus par un participant |
| `user:online` | `{ userId: string }` | Utilisateur connecté |
| `user:offline` | `{ userId: string }` | Utilisateur déconnecté (plus aucune session active) |
| `typing:start` | `{ userId: string, conversationId: string }` | Un participant est en train de taper |
| `typing:stop` | `{ userId: string, conversationId: string }` | Un participant a arrêté de taper |

### Flux `message:send`

```
Client A                     Gateway                      Client B
   │                            │                             │
   │── message:send ───────────>│                             │
   │                            │── save to DB               │
   │                            │── update conversation       │
   │                            │── check B online (Redis)   │
   │                            │── mark delivered           │
   │<──── message:new ──────────│──── message:new ──────────>│
   │<── message:status(delivered)│                            │
```

---

## Modules NestJS

```
AppModule
└── PresentationModule
    ├── ApplicationModule
    │   └── InfrastructureModule
    │       ├── TypeOrmModule (UserOrmEntity, ConversationOrmEntity, MessageOrmEntity)
    │       ├── UserRepository        → USER_REPOSITORY
    │       ├── ConversationRepository → CONVERSATION_REPOSITORY
    │       ├── MessageRepository      → MESSAGE_REPOSITORY
    │       └── RedisPresenceService   → PRESENCE_SERVICE
    ├── RegisterUserUseCase
    ├── LoginUserUseCase
    ├── LogoutUserUseCase
    ├── SendMessageUseCase
    ├── GetConversationsUseCase
    ├── GetMessagesUseCase
    ├── CreateConversationUseCase
    └── GetUsersUseCase
```

### Tokens d'injection

Les repositories sont injectés via des **symboles** pour garantir le découplage :

```ts
// Définition (domain)
export const USER_REPOSITORY = Symbol('IUserRepository');

// Fourniture (infrastructure.module.ts)
{ provide: USER_REPOSITORY, useClass: UserRepository }

// Consommation (use-case)
@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository
```

---

## Couches de l'architecture

### Domain

Entités pures TypeScript, sans décorateurs NestJS ni TypeORM :

```ts
// domain/entities/user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    // ...
  ) {}

  updateStatus(status: UserStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }
}
```

Value Object `Email` avec validation à l'instantiation :

```ts
const email = new Email("alice@exemple.com"); // Lance si invalide
email.toString(); // "alice@exemple.com"
```

### Application — Use Cases

Chaque use case est un `@Injectable()` avec une seule méthode publique `execute()` :

```ts
// register-user.use-case.ts
async execute(dto: RegisterDto): Promise<AuthResponseDto> {
  const email = new Email(dto.email);              // Validation value object
  const existing = await this.userRepo.findByEmail(email.toString());
  if (existing) throw new ConflictException(...);

  const hash = await bcrypt.hash(dto.password, 12);
  const user = new User(uuidv4(), dto.name, ...); // Entité domain pure
  await this.userRepo.save(user);

  const token = this.jwtService.sign({ sub: user.id });
  return { accessToken: token, user: { ... } };
}
```

### Infrastructure — Repositories

Les repositories implémentent les interfaces domain et gèrent la **transformation bidirectionnelle** entre entités domain et ORM :

```ts
// Entité domain → ORM (pour sauvegarder)
private toOrm(user: User): UserOrmEntity { ... }

// ORM → entité domain (pour retourner)
private toDomain(row: UserOrmEntity): User { ... }
```

---

## Redis — Présence

`RedisPresenceService` implémente `IPresenceService` via **ioredis**.

Chaque utilisateur a une clé Redis contenant un **Set de socketIds** (pour gérer les sessions multiples) :

```
presence:{userId}  →  Set{ "socketId1", "socketId2" }
TTL: 300s (renouvelé à chaque heartbeat)
```

```ts
await presenceService.setOnline(userId, socketId);  // SADD + EXPIRE
await presenceService.setOffline(userId, socketId); // SREM
await presenceService.isOnline(userId);             // SCARD > 0
await presenceService.getOnlineUsers([id1, id2]);   // Pipeline SCARD
```

Un utilisateur passe **offline uniquement quand son Set est vide** (toutes ses sessions sont fermées).

---

## Sécurité

| Mécanisme | Détail |
|---|---|
| **Mots de passe** | Hachés avec bcrypt, salt rounds = 12 |
| **JWT** | HS256, expiration configurable (`JWT_EXPIRES_IN`), secret via env |
| **Validation** | `class-validator` sur tous les DTOs (`whitelist: true`, `forbidNonWhitelisted: true`) |
| **Guards HTTP** | `JwtAuthGuard` sur toutes les routes protégées |
| **Guards WebSocket** | `WsJwtAuthGuard` sur tous les événements `@SubscribeMessage` |
| **Ownership** | Les use cases vérifient que l'utilisateur est bien participant avant tout accès |
| **CORS** | Configuré pour `FRONTEND_URL` uniquement |

---

## Build & Déploiement

```bash
# Compiler TypeScript
npm run build
# → dist/

# Démarrer en production
NODE_ENV=production npm run start:prod
```

### Variables de production importantes

```env
NODE_ENV=production
JWT_SECRET=<chaine-aleatoire-32-chars-minimum>
DB_PASSWORD=<mot-de-passe-fort>
FRONTEND_URL=https://app.mondomaine.com
```

> En production, `synchronize: false` est automatiquement appliqué. Utilisez toujours `npm run migration:run` pour les changements de schéma.

### Healthcheck

```bash
# Vérifier que l'API répond
curl http://localhost:3000/api/v1/auth/me
# → 401 Unauthorized (normal sans token — le serveur répond bien)

# Vérifier PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Vérifier Redis
docker-compose exec redis redis-cli ping
# → PONG
```
