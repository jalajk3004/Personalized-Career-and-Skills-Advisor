# 🚀 Prosperia – AI Career Path Finder

Prosperia is an **AI-powered career counselor** that helps individuals discover their ideal career paths.  
It analyzes personal information, skills, and preferences to generate tailored recommendations about career options, salary insights, growth opportunities, and required skillsets.

---

## 📂 Project Structure
- **Backend** – Handles API requests, AI-powered career recommendations, and database operations.
- **Frontend** – Provides an interactive interface where users can explore their personalized career paths.

---

## ⚙️ Getting Started (Local Setup)

Follow the steps below to run Prosperia on your local machine:

### 1. Clone the Repository
```bash
git clone <repo-link>
cd Personalized-Career-and-Skills-Advisor
```

### 2. Start the Backend
First, compile the TypeScript code:
```bash
tsc -b
```
Then, start the backend server:
```bash
node dist/index.js
```

### 3. Start the Frontend
In a separate terminal, run:
```bash
npm run dev
```

### 4. Build for Production
To build the frontend for production:
```bash
npm run build
```

### 5. For starting Database
Build a postgres docker image:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5431:5432 -d postgres
```
To migrate the schema:
```bash

```
If you dont have the docker, install from [here](https://docs.docker.com/get-docker/)

---

## 💡 Features
- AI-generated career recommendations
- Salary insights & career growth trends
- Skill-based career matching
- User-friendly interface

---

## 🛠️ Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + TypeScript
- **Database:** (add your DB here, e.g., PostgreSQL/MySQL)
- **AI Integration:** Gemini/LLM API (or whichever you’re using)

---

## 📜 License
This project is licensed under the MIT License – feel free to use and modify.

---
