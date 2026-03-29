# Week 5 Revision Notes

This document consolidates key concepts from Week 5, covering various API architectural styles, file handling, real-time communication protocols, and a deep dive into GraphQL with Prisma.

---

## 1. Web Technologies & Middleware

### EJS (Embedded JavaScript)

- **Concept:** A templating engine to generate HTML markup using plain JavaScript.
- **Usage:** Allows embedding dynamic server-side data directly into HTML pages (e.g., `<%= user.name %>`).

### Multer

- **Concept:** A Node.js middleware for handling `multipart/form-data`, primarily used for file uploads.
- **Usage:** Configures storage (disk or memory), filenames, and file filtering efficiently inside Express routes (`upload.single('profilePic')`).

### WebSockets (Socket.io)

- **Concept:** Provides full-duplex, persistent, real-time communication channels over a single TCP connection.
- **Comparison to HTTP:** Unlike request-response over HTTP, WebSockets allow servers to push data to clients instantly (Event-driven).
- **Use cases:** Live chats, real-time dashboards, multiplayer games.

---

## 2. API Architectural Styles

### REST (Representational State Transfer) APIs

- **Core Principles:** Client-Server separation, Statelessness, Cacheability, and a Uniform Interface.
- **Characteristics:** Uses standard HTTP methods (GET, POST, PUT, DELETE) and noun-based resource endpoints (e.g., `/users/:id`).

### HTTP APIs

- **Concept:** Any API utilizing the HTTP protocol.
- **REST vs HTTP API:** All REST APIs are HTTP APIs, but non-RESTful HTTP APIs exist (e.g., action-based endpoints like `/api/createUser` using POST).

### RPC (Remote Procedure Call) & gRPC

- **RPC Concept:** An inter-process communication protocol where a client executes a function on a remote server as if it were local. Focuses on actions rather than resources.
- **gRPC:** Google's modern, high-performance RPC framework.
  - **Key Features:** Uses **HTTP/2** for multiplexed/streaming transport and **Protocol Buffers (Protobufs)** for blazing fast, binary data serialization instead of JSON.

---

## 3. GraphQL Fundamentals

GraphQL is a query language for your API and a server-side runtime for executing queries.

### Advantages over REST

- **Exact Data Extraction:** Prevents **over-fetching** (getting unused data) and **under-fetching** (requiring multiple trips).
- **Single Endpoint:** Usually operates over a single HTTP endpoint `/graphql`.
- **Strongly Typed:** Defines allowed queries and mutations via a strict Schema.

### Core Concepts

- **Type Definitions (`typeDefs`):** The schema that shapes the data (e.g., `type User { id: ID! name: String! }`).
- **Queries:** Read operations (fetching data).
- **Mutations:** Write operations (Create, Update, Delete).
- **Resolvers:** The actual backend functions that fetch or manipulate the data requested by the schema.

---

## 4. GraphQL Implementation & Architecture

### Setup with Apollo Server & Express

- The Apollo Server requires `typeDefs` and `resolvers` to instantiate.
- Connected to Express using middleware (`expressMiddleware(server)`).

### Integrating with Prisma (ORM)

- **Prisma** pairs perfectly with GraphQL due to its strongly-typed auto-generated client.
- **Schema:** Defined in `schema.prisma`.
- **Usage:** Resolvers utilize `PrismaClient` to fetch/mutate data directly from the PostgreSQL database (e.g., `await prisma.user.findMany()`).

### Modular Backend Architecture

As the application grows, a monolithic `index.js` becomes unmaintainable.

- **Refactoring Strategy:** Group GraphQL logic by domain/feature (e.g., Users, Posts).
- **Domain Structure:** Create separate files for `typeDefs.js`, `queries.js`, `mutations.js`, and `resolvers.js` for each entity.
- **Master Schema Builder:** Combine all individual domain modules into a master `typeDefs` and `resolvers` object to initialize the Apollo Server.
- **Benefits:** Clean code, highly scalable, and reduces team merge conflicts.
