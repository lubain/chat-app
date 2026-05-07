# 💬 Chat App — Frontend

Application de messagerie temps réel construite avec **React 19**, **TypeScript**, **Zustand** et **Socket.IO**, organisée en **Clean Architecture**.

---

## Table des matières

1. [Stack technique](#stack-technique)
2. [Architecture](#architecture)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Prérequis](#prérequis)
5. [Installation](#installation)
6. [Variables d'environnement](#variables-denvironnement)
7. [Lancer le projet](#lancer-le-projet)
8. [Couches de l'architecture](#couches-de-larchitecture)
9. [Stores Zustand](#stores-zustand)
10. [Hooks personnalisés](#hooks-personnalisés)
11. [Infrastructure API](#infrastructure-api)
12. [WebSocket](#websocket)
13. [Gestion des erreurs](#gestion-des-erreurs)
14. [Build & Déploiement](#build--déploiement)

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.8 | Typage statique |
| Vite (rolldown) | 7 | Bundler / Dev server |
| Zustand | 5 | État global |
| Socket.IO Client | 4.8 | WebSocket temps réel |
| Axios | 1.15 | Client HTTP |
| Tailwind CSS | 4 | Styles utilitaires |
| Lucide React | 0.544 | Icônes |

---

## Architecture

Le projet suit les principes de la **Clean Architecture** avec une séparation stricte en 4 couches. Les dépendances ne pointent **jamais vers l'extérieur** — la couche `domain` ne connaît pas `application`, qui ne connaît pas `infrastructure`, etc.

```
┌─────────────────────────────────────┐
│         Presentation                │  Composants React (UI pure)
│   App.tsx · LoginPage · ChatLayout  │
├─────────────────────────────────────┤
│         Application                 │  Logique métier, orchestration
│   hooks · stores · use-cases        │
├─────────────────────────────────────┤
│         Infrastructure              │  Accès externe (API, WebSocket)
│   http-client · auth.api · socket   │
├─────────────────────────────────────┤
│         Domain                      │  Entités & interfaces pures
│   entities · repositories           │
└─────────────────────────────────────┘
```

**Règle d'or** : les composants ne touchent **jamais** directement les stores. Ils passent exclusivement par les hooks personnalisés.

---

## Structure des dossiers

```
src/
├── domain/
│   ├── entities/
│   │   ├── AppView.ts          # Type de navigation ("login" | "register" | "chat")
│   │   ├── Contact.ts          # Entité Contact
│   │   ├── Message.ts          # Entité Message + MessageStatus
│   │   └── User.ts             # Entité User
│   └── repositories/
│       └── index.ts            # Interfaces IAuthRepository, IContactRepository…
│
├── application/
│   ├── stores/
│   │   ├── useAuthStore.ts     # Auth (user, token, login, register, logout)
│   │   ├── useChatStore.ts     # Chat (conversations, messages, présence)
│   │   └── useNavigationStore.ts # Vue courante + dark mode
│   ├── hooks/
│   │   ├── useAuth.ts          # Pont composant → useAuthStore
│   │   ├── useChat.ts          # Pont composant → useChatStore + useSocket
│   │   ├── useNavigation.ts    # Pont composant → useNavigationStore + useAuthStore
│   │   └── useSocket.ts        # Abonnement aux événements WebSocket
│   └── usecases/
│       ├── ChatUseCases.ts     # buildNewMessage, isOwnMessage, formatStatus
│       └── NavigationUseCases.ts # getPostLoginView, getPostLogoutView…
│
├── infrastructure/
│   ├── api/
│   │   ├── http-client.ts      # Axios singleton + intercepteurs + HttpError
│   │   ├── auth.api.ts         # login, register, me, updateProfile, logout
│   │   └── conversation.api.ts # list, create, getMessages, markAsRead + usersApi
│   └── socket/
│       └── socket-client.ts    # Socket.IO singleton (connectSocket / disconnectSocket)
│
└── presentation/
    ├── App.tsx                 # Routeur principal (login | register | chat)
    ├── styles/
    │   └── index.css           # Tailwind + dark mode overrides + scrollbar
    └── components/
        ├── auth/
        │   ├── LoginPage.tsx
        │   └── RegisterPage.tsx
        └── chat/
            ├── ChatLayout.tsx  # Assemblage sidebar + zone chat
            ├── ChatHeader.tsx  # En-tête conversation (menu, dark mode, déco)
            ├── ContactList.tsx # Liste des conversations
            ├── MessageList.tsx # Fil de messages avec auto-scroll
            └── MessageInput.tsx # Zone de saisie (Enter = envoi)
```

---

## Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10
- Le [backend](../backend/README.md) doit être démarré

---

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd frontend

# Installer les dépendances
npm install

# Copier la configuration d'environnement
cp .env.example .env
```

---

## Variables d'environnement

Fichier `.env` à créer à la racine du frontend :

```env
# URL de base de l'API REST (sans slash final)
VITE_API_URL=http://localhost:3000/api/v1

# URL du serveur WebSocket (sans path)
VITE_WS_URL=http://localhost:3000
```

---

## Lancer le projet

```bash
# Mode développement (hot reload)
npm run dev
# → http://localhost:5173

# Vérification TypeScript
npx tsc --noEmit

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

---

## Couches de l'architecture

### Domain

Les entités et interfaces pures, **sans aucune dépendance** vers React, Axios ou tout autre framework.

```ts
// domain/entities/Message.ts
export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: number;
  senderId: number;
  text: string;
  time: string;
  status: MessageStatus;
}
```

Les interfaces de repository définissent les **contrats** que l'infrastructure doit respecter :

```ts
// domain/repositories/index.ts
export interface IMessageRepository {
  getMessagesByContactId(contactId: number): Message[];
  sendMessage(contactId: number, text: string): Message;
}
```

---

### Application

#### Use Cases

Classes statiques contenant la **logique métier pure**, sans effets de bord :

```ts
// application/usecases/ChatUseCases.ts
ChatUseCases.buildNewMessage(text, senderId, existingMessages) // → Message | null
ChatUseCases.isOwnMessage(senderId, currentUserId)            // → boolean
ChatUseCases.formatContactStatus(online)                      // → "En ligne" | "Hors ligne"
```

#### Stores (Zustand)

Les stores **ne sont jamais importés directement dans les composants**. Seuls les hooks personnalisés y accèdent.

| Store | État géré |
|---|---|
| `useAuthStore` | `user`, `token`, `isLoading`, `error` · `login()`, `register()`, `logout()`, `hydrateFromStorage()` |
| `useChatStore` | `contacts`, `messages`, `activeConversationId` · `loadConversations()`, `selectConversation()`, `sendMessage()`, `receiveMessage()` |
| `useNavigationStore` | `currentView`, `isDarkMode` · `navigateTo()`, `toggleDarkMode()` |

---

### Infrastructure

#### Client HTTP (`http-client.ts`)

Singleton Axios avec :

- Injection automatique du JWT sur chaque requête
- Normalisation des erreurs en `HttpError` (avec `.isUnauthorized`, `.isNotFound`, etc.)
- Dispatch de l'événement `auth:expired` sur 401 (pas de `window.reload` brutal)
- Timeout à 15 secondes
- Helpers typés `get<T>`, `post<T>`, `patch<T>`, `del<T>`
- `withAbortController()` pour les requêtes annulables

```ts
import { get, post, HttpError } from "./http-client";

try {
  const data = await get<User[]>("/users");
} catch (err) {
  if (err instanceof HttpError && err.isNotFound) {
    // ...
  }
}
```

#### Socket Client (`socket-client.ts`)

Singleton Socket.IO avec connexion/déconnexion explicites :

```ts
import { connectSocket, getSocket, disconnectSocket } from "./socket/socket-client";

// À la connexion (après login)
connectSocket(token);

// Dans les hooks (pour émettre)
getSocket().emit("message:send", payload);

// À la déconnexion (logout)
disconnectSocket();
```

---

## Stores Zustand

### `useAuthStore`

```ts
const { user, token, isLoading, error } = useAuthStore();

await login("email@ex.com", "password");
await register("Nom", "email@ex.com", "password");
logout();
hydrateFromStorage(); // Restaure la session depuis localStorage au démarrage
```

### `useChatStore`

```ts
const { contacts, messages, activeConversationId } = useChatStore();

await loadConversations();          // Charge la liste depuis l'API
selectConversation(conversationId); // Charge les messages + marque comme lu
sendMessage(content, userId);       // Envoi optimiste via WebSocket
receiveMessage(message);            // Réception (appelé par useSocket)
setUserOnline(userId);
setUserOffline(userId);
```

**Envoi optimiste** : le message apparaît immédiatement dans l'UI avec un `id` préfixé `opt-`, puis est remplacé par la version serveur à réception de l'événement `message:new`.

---

## Hooks personnalisés

Les hooks sont le **seul point de contact** entre les composants et les stores.

### `useAuth()`

```ts
const {
  user, token, isLoading, error, isAuthenticated,
  login, register, logout, clearError, hydrateFromStorage,
} = useAuth();
```

### `useNavigation()`

```ts
const {
  currentView, isDarkMode, isLoading, error,
  toggleDarkMode,
  handleLogin,    // login() + navigateTo("chat")
  handleLogout,   // logout() + navigateTo("login")
  handleRegister, // register() + navigateTo("chat")
  goToRegister, goToLogin,
} = useNavigation();
```

### `useChat(currentUserId)`

```ts
const {
  contacts, messages, activeContact,
  isMobileListVisible, isMenuOpen,
  isLoadingContacts, isLoadingMessages,
  loadConversations, selectConversation,
  sendMessage, isOwnMessage, getContactStatus,
  setIsMobileListVisible, setIsMenuOpen,
} = useChat(currentUserId);
```

Monte automatiquement `useSocket()` pour s'abonner aux événements temps réel.

### `useSocket()`

Abonnements WebSocket montés une seule fois au niveau de `ChatLayout` :

| Événement reçu | Action |
|---|---|
| `message:new` | `receiveMessage(message)` |
| `user:online` | `setUserOnline(userId)` |
| `user:offline` | `setUserOffline(userId)` |

---

## Infrastructure API

### `authApi`

```ts
authApi.register(name, email, password) // → AuthResponse (stocke le token)
authApi.login(email, password)          // → AuthResponse (stocke le token)
authApi.me()                            // → AuthUser
authApi.updateProfile({ name?, avatarUrl? }) // → AuthUser
authApi.logout()                        // → void (best-effort + clear token)
```

### `conversationApi`

```ts
conversationApi.list()                          // → ConversationResponse[]
conversationApi.create(targetUserId)            // → ConversationResponse
conversationApi.getMessages(id, limit?, before?) // → PaginatedMessages
conversationApi.getMessagesCancellable(id)       // → { promise, cancel }
conversationApi.markAsRead(conversationId)       // → void
```

### `usersApi`

```ts
usersApi.list()                  // → UserSearchResult[]
usersApi.search(query)           // → UserSearchResult[]
usersApi.searchCancellable(query) // → { promise, cancel }
```

**Pagination curseur** (`getMessages`) :

```ts
const { data, hasMore, nextCursor } = await conversationApi.getMessages(id, 50);

// Charger la page précédente (messages plus anciens)
if (hasMore && nextCursor) {
  const older = await conversationApi.getMessages(id, 50, nextCursor);
}
```

**Requête annulable** (pour live search) :

```ts
let pending: { promise: Promise<any>; cancel: () => void } | null = null;

const handleSearch = (query: string) => {
  pending?.cancel(); // Annule la précédente
  pending = usersApi.searchCancellable(query);
  const results = await pending.promise;
};
```

---

## WebSocket

Le frontend se connecte au namespace `/chat` du serveur Socket.IO.

### Connexion

```ts
// Connexion après login (token JWT dans l'auth handshake)
connectSocket(accessToken);
```

### Événements émis (client → serveur)

| Événement | Payload | Description |
|---|---|---|
| `message:send` | `{ conversationId, content }` | Envoyer un message |
| `message:read` | `{ conversationId }` | Marquer comme lu |
| `typing:start` | `{ conversationId }` | Début de frappe |
| `typing:stop` | `{ conversationId }` | Fin de frappe |
| `conversation:join` | `{ conversationId }` | Rejoindre une room |

### Événements reçus (serveur → client)

| Événement | Payload | Description |
|---|---|---|
| `message:new` | `MessageResponse` | Nouveau message reçu |
| `message:status` | `{ messageId, status }` | Statut mis à jour |
| `message:read` | `{ conversationId, readBy }` | Messages lus |
| `user:online` | `{ userId }` | Utilisateur connecté |
| `user:offline` | `{ userId }` | Utilisateur déconnecté |
| `typing:start` | `{ userId, conversationId }` | L'autre tape |
| `typing:stop` | `{ userId, conversationId }` | L'autre a arrêté |

---

## Gestion des erreurs

Toutes les erreurs HTTP sont normalisées en `HttpError` :

```ts
import { HttpError } from "@/infrastructure/api/http-client";

try {
  await authApi.login(email, password);
} catch (err) {
  if (err instanceof HttpError) {
    console.log(err.statusCode); // 401
    console.log(err.messages);  // ["Invalid credentials"]
    console.log(err.isUnauthorized); // true
  }
}
```

L'expiration du token déclenche l'événement global `auth:expired` :

```ts
window.addEventListener("auth:expired", () => {
  // Rediriger vers login, afficher une notification…
});
```

---

## Build & Déploiement

```bash
# Build optimisé
npm run build
# → dist/

# Servir en production (ex: avec nginx ou serve)
npx serve dist
```

Variables d'environnement en production :

```env
VITE_API_URL=https://api.mondomaine.com/api/v1
VITE_WS_URL=https://api.mondomaine.com
```

> **Note** : Toutes les variables `VITE_*` sont intégrées au bundle au moment du build. Ne jamais y mettre de secrets.
