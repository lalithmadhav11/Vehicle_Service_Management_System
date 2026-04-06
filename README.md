# Vehicle Service Management Platform (Backend)

This is the backend server for the **Vehicle Service Management Platform**, built entirely using the Node.js / Express.js MERN stack. It handles RESTful APIs, secure authentication, database modeling using Mongoose, and multipart file uploads for vehicles and documents.

---

##  Tech Stack

- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Uploads:** Multer
- **Cross-Origin Requests:** CORS
- **Environment Handling:** dotenv

---

##  Architecture & Folder Structure

This backend enforces a strict **Model-View-Controller (MVC)** framework architecture for high maintainability.

```
server/
├── config/             # DB connection options (db.js)
├── controllers/        # Business logic for all main features
├── middleware/         # Custom Middlewares (Auth, Error handler, Multer)
├── models/             # Mongoose schemas (User, Vehicle, ServiceRecord, etc.)
├── routes/             # REST API endpoint definitions
├── uploads/            # Dynamically generated static folder for user uploads
├── utils/              # Helper functional logics (JWT sign, Invoice # generator)
├── .env                # Env variables (auto-ignored for security)
├── .env.example        # Reference environment file for developers 
├── app.js              # Express app configuration & middleware mounts
└── server.js           # Server driver script linking DB and Express app
```

---

##  Key Features Include:

1. **Role-Based JWT Authentication:** Includes strict access control across routes separating permissions for `customers`, `technicians`, and `admins`.
2. **Dynamic Cost Evaluation & Invoice Generation:** Generates unique string identifiers with time-stamping for all financial record tracking.
3. **Advanced Multer Image Configuration:** Intercepts incoming requests sorting file buffers automatically into independent folders inside `/uploads/`.
4. **Error Handling Architecture:** Every single route forces unexpected exceptions to bubble over down to a globally managed error middleware responding uniformly with valid JSON stacks.
5. **Admin Metrics Check:** Dashboard endpoints computing live user data tracking traffic and generated revenue directly using active mongoose aggregations.
6. **Detailed Pagination Support:** Integrated backend pagination logic avoiding memory exhaustion on scalable lists securely returning subset JSON arrays.

---

##  Instructions To Run The Backend

### 1. Prerequisites
Ensure you have **Node.js** locally installed and a **MongoDB** string available (local `localhost:27017` or cloud MongoDB Atlas).

### 2. Environment Variables Configuration
Navigate into the `server` folder, copy `.env.example` to `.env` and adjust the variables to your own context:
```bash
cd server
cp .env.example .env
```
*(Make sure to specify your MongoDB string context accurately).*

### 3. Install Dependencies
```bash
# Verify you are still inside the /server directory!
npm install
```

### 4. Run Development Server
Using the local `nodemon` installation, start the development environment:
```bash
npm run dev
```

The server should successfully log database success, yielding:
**`Server running on port 5000`** and **`MongoDB Connected`**.
