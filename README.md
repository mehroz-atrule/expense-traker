# Expense Tracker – Fullstack Setup (Without Docker)

This project is a **fullstack Expense Tracker** app built with:

* **Frontend:** React (Vite)
* **Backend:** NestJS
* **Database:** MongoDB
* **Cloud Storage:** Cloudinary (for image uploads)

---

## 📋 Prerequisites

Before running the project locally, make sure you have:

* [Node.js](https://nodejs.org/en/download/) (v22 or higher)
* [npm](https://www.npmjs.com/)
* A **MongoDB Atlas account** → [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
* A **Cloudinary account** → [https://cloudinary.com/](https://cloudinary.com/)

You’ll need your:

* **MongoDB connection URI**
* **Cloudinary cloud name, API key, and API secret**

---

## 🗂️ Project Structure

```
expense-tracker/
├── backend/             # NestJS API (Node.js)
├── Expense Tracker/     # React Frontend (Vite)
```

---

## 🚀 Setup & Run Locally

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd expense-tracker
```

---

### 2. Setup Backend (NestJS)

```bash
cd backend
npm install
```

#### Create a `.env` file inside `backend/`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/eet
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME  = YOUR_CLOUD_NAME
CLOUDINARY_API_KEY =  YOUR_API_KEY
CLOUDINARY_API_SECRET =  YOUR_API_SECRET
```

#### Run backend server:

```bash
npm run start:dev
```

Backend runs on: **[http://localhost:5000](http://localhost:5000)**

---
#### Create a `.env` file inside `Expense Tracker/`:
```
VITE_API_BASE_URL = https://expense-traker-nod8.vercel.app/api
```

### 3. Setup Frontend (React + Vite)

```bash
cd "../Expense Tracker"
npm install
```

#### Run frontend:

```bash
npm run dev
```

Frontend runs on: **[http://localhost:5173](http://localhost:5173)**

---

## 🧠 Development Notes

* **Live reload** is enabled by default via Vite and NestJS dev mode.
* Update the `.env` values if you change backend ports or keys.
* API base URL for frontend is controlled via `VITE_API_URL`.

---

## 🧩 Scripts

**Frontend:**

* `npm run dev` → Run in dev mode
* `npm run build` → Build for production

**Backend:**

* `npm run start:dev` → Run with hot reload
* `npm run build` → Build for production

---

## 🧮 Troubleshooting

* If MongoDB fails to connect:

  * Verify your `MONGO_URI` in `.env`
  * Make sure your IP is whitelisted in MongoDB Atlas

* If Cloudinary uploads fail:

  * Double-check your Cloudinary credentials in `.env`

---

## 📂 Folder Details

* `backend/` → NestJS backend API
* `Expense Tracker/` → React frontend (Vite)
