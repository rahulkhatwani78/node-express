# Week 3: Revision & Practical Tasks

This document serves as a comprehensive recap of Week 3, summarizing core Node.js and Express backend concepts. It is designed to reinforce the theoretical concepts through practical exercises.

---

## 📚 General Revision

### 1. Node.js Event Loop Phases

Node.js processes asynchronous operations through a multi-stage event loop. The execution order is strictly defined:

1. **Microtasks (`nextTick` > `Promise`)**: If the callstack is empty, the microtask queue is checked. `process.nextTick` tasks execute first, followed by `Promise` callbacks.
2. **Timer Phase**: Expired timer callbacks (`setTimeout`, `setInterval`) are picked up.
3. _Microtask Check_
4. **I/O Phase**: Pending I/O callbacks (e.g., `fs`, `crypto`) are picked up.
5. _Microtask Check_
6. **Check Phase**: `setImmediate` callbacks are picked up.
7. _Microtask Check_
8. **Close Callback Phase**: Callbacks for `'close'` events (e.g., socket closure) are picked up.
9. _Microtask Check_
10. **Loop**: If queues are not empty, the loop repeats.

---

### 2. Libuv & Thread Pool

APIs like `fs` and `crypto` are typically **not** handled entirely by the single-threaded Event Loop. Instead, computationally heavy tasks wait on a thread pool managed by **Libuv**.

**Thread Pool Size Override:**
You can modify the default pool size (4) via environment variables.

_Windows PowerShell:_

```powershell
$env:UV_THREADPOOL_SIZE=2; node index.js
```

**Thread Pool Batching Example:**

```javascript
const crypto = require("crypto");
// Warning: May not work internally if set inside script
process.env.UV_THREADPOOL_SIZE = 2;

const fs = require("fs");
const start = Date.now();

fs.readFile("sample.txt", () => {
  console.log("IO Polling Finish - Start");

  for (let i = 1; i <= 6; i++) {
    crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
      console.log(`${Date.now() - start}ms`, `Crypto Finish ${i}`);
    });
  }
});
```

_Output (Notice the batching of 2s):_

```text
1100ms Crypto Finish 2
1114ms Crypto Finish 1
2461ms Crypto Finish 3
2538ms Crypto Finish 4
3829ms Crypto Finish 5
3905ms Crypto Finish 6
```

---

### 3. Streams & Buffers

- **Streams**: Abstract interfaces for working with streaming data. Data is processed in small pieces called **chunks** to avoid loading huge assets into memory.
- **Buffers**: A global object used to handle raw, binary data directly outside the V8 heap in "Raw Memory".
- **Types of Streams:**
  - **Readable**: `fs.createReadStream`
  - **Writable**: `fs.createWriteStream`
  - **Duplex**: Can read/write (e.g., Web Sockets)
  - **Transform**: Modifies data as it streams (e.g., `zlib` compression)

> [!TIP]
> **Pipeline API**: Use the `pipeline()` API instead of chaining multiple `.pipe()` calls. It seamlessly handles stream cleanup and errors.

---

### 4. Concurrency: Worker Threads vs. Cluster

| Feature      | Worker Threads                                        | Cluster Module                                                |
| :----------- | :---------------------------------------------------- | :------------------------------------------------------------ |
| **Concept**  | Multiple threads within the same process.             | Multiple, distinct Node instances (processes).                |
| **Best For** | Heavy CPU tasks without blocking the main event loop. | Scaling the entire application to handle more API requests.   |
| **Benefit**  | Memory sharing capability.                            | Zero downtime restarts, port sharing, multi-core utilization. |

---

### 5. URL, NPM, and Server Management

- **Modern URL Parsing:**
  ```javascript
  const fullUrl = new URL(req.url, `http://${req.headers.host}`);
  console.log(fullUrl.searchParams.get("id"));
  ```
- **Semantic Versioning (SemVer) - `MAJOR.MINOR.PATCH`:**
  - **MAJOR**: Breaking changes.
  - **MINOR**: Backward-compatible new features.
  - **PATCH**: Backward-compatible bug fixes.
- **Dependencies:**
  - `dependencies`: Needed in production (`express`, `mongoose`).
  - `devDependencies`: Needed only in dev environment (`jest`, `nodemon`).
- **The Lock File `package-lock.json`**: Ensures deterministic builds. It maps exact versions installed to ensure Dev A and Dev B are running the same software despite loose `^` constraints in `package.json`.

---

### 6. Express, REST, Middleware & HTTP

- **Express**: A minimal, unopinionated Node web framework.
- **REST API**: A **stateless** client-server architecture relying on standard HTTP Methods (`GET`, `POST`, `PUT/PATCH`, `DELETE`) for CRUD actions.
- **Middleware**: Functions sitting between the request and the final handler. Can parse data, log inputs, handle authorization, etc. Must always call `next()`.
- **HTTP Headers**: Metadata sent alongside requests/responses. Custom ones often use the `X-` prefix (`X-Powered-By`).
- **HTTP Status Codes:**
  - `1xx`: Informational
  - `2xx`: Success (`200 OK`, `201 Created`)
  - `3xx`: Redirection
  - `4xx`: Client Error (`400 Bad Request`, `404 Not Found`)
  - `5xx`: Server Error (`500 Int. Server Error`)

---

## 🛠️ Practical Tasks

### Task 1: Building a File Streaming Server

This server streams chunks of a requested file back to the client directly from disk, preventing memory bloat.

```javascript
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.get("/file/:fileName", (req, res) => {
  const filePath = path.join(__dirname, req.params.fileName);
  const readableStream = fs.createReadStream(filePath, "utf-8");

  readableStream.on("open", () => {
    console.log(`Streaming file: ${filePath}`);
  });

  readableStream.on("error", (err) => {
    res.status(404).json({ msg: "File not found!" });
  });

  readableStream.on("close", () => {
    console.log(`File streaming closed!`);
  });

  readableStream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

---

### Task 2: Multi-Core Cluster Application

Leveraging the `cluster` module to spawn worker processes according to the available CPU cores.

```javascript
const cluster = require("cluster");
const os = require("os");
const express = require("express");

const totalCpus = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running 👑`);

  for (let i = 0; i < totalCpus; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died ☠️. Respawning...`);
    cluster.fork(); // Auto-restart on crash
  });
} else {
  // Child Workers run the actual server
  const app = express();
  const PORT = 3000;

  app.get("/", (req, res) => {
    console.log(`Handled securely by worker process ${process.pid}`);
    res.json({ message: `Hello from Worker ${process.pid}!` });
  });

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });
}
```

---

### Task 3: Full Custom REST API (User Management)

A robust application showcasing nested middleware, route chaining, dynamic validation, and standard REST practices.

```javascript
const express = require("express");
let users = [{ id: 1, name: "Rahul", age: 26 }];

const app = express();
const PORT = 3000;

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- CUSTOM MIDDLEWARES ---
const checkAllMandatoryFieldsAvailable = (req, res, next) => {
  const { name, age } = req.body;
  if (!name || !age) {
    return res.status(400).json({ message: "Name and age are mandatory!" });
  }
  next();
};

const checkAnyMandatoryFieldAvailable = (req, res, next) => {
  const { name, age } = req.body;
  if (!name && !age) {
    return res
      .status(400)
      .json({ message: "Provide at least a name or age for update!" });
  }
  next();
};

const checkIfUserExists = (req, res, next) => {
  const userId = Number(req.params.id);
  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex < 0) {
    return res.status(404).json({ message: "User not found!" });
  }

  req.userId = userId;
  req.userIndex = userIndex;
  next();
};

// Global Middleware Demo
app.use((req, res, next) => {
  if (users.length === 0 && req.method === "GET") {
    return res
      .status(404)
      .json({ message: "No users currently available database is empty." });
  }
  next();
});

// --- ROUTES ---

// Create User
app.post("/users", checkAllMandatoryFieldsAvailable, (req, res) => {
  const { name, age } = req.body;
  const currentUserId = users.length ? users[users.length - 1].id + 1 : 1;

  users.push({ id: currentUserId, name, age });
  return res
    .status(201)
    .json({ message: `User added with ID ${currentUserId}` });
});

// Get All Users
app.get("/users", (req, res) => {
  return res.status(200).json({ users });
});

// Chain Routes for Specific User (id)
app
  .route("/users/:id")
  .get(checkIfUserExists, (req, res) => {
    return res.status(200).json({ user: users[req.userIndex] });
  })

  .patch(checkIfUserExists, checkAnyMandatoryFieldAvailable, (req, res) => {
    const { userId, userIndex } = req;
    const { name, age } = req.body;

    users[userIndex] = {
      id: userId,
      name: name ?? users[userIndex].name,
      age: age ?? users[userIndex].age,
    };

    return res.status(200).json({ message: `User updated with ID ${userId}` });
  })

  .delete(checkIfUserExists, (req, res) => {
    const { userId, userIndex } = req;
    users.splice(userIndex, 1);
    return res.status(200).json({ message: `User deleted with ID ${userId}` });
  });

// --- BOOTSTRAP ---
app.listen(PORT, () => console.log(`🚀 API Server running on port ${PORT}`));
```
