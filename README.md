# 🏛️ AI-Enhanced PDL Information Management System
**Technological University of the Philippines - BSIT Capstone Project**

An integrated management system for Persons Deprived of Liberty (PDL) featuring RFID integration, automated GCTA calculations, and secure inmate profiling.

---

## 🚀 Getting Started (For Groupmates)

To ensure the project runs correctly on your local machine, follow these steps exactly.

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **PostgreSQL** (Ensure it is running locally)
* **VS Code**

### 2. Environment Setup
Create a `.env` file inside the `backend` folder and add your local credentials:
```env
PORT=5000
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_NAME=bjmp_pdl
DB_PORT=5432
JWT_SECRET=your_secret_key_here
