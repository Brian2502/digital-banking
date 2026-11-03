# Digital Banking

A full-stack digital banking application built with **Java Spring Boot, Spring Security, React, and PostgreSQL**. The project simulates essential banking operations with a focus on secure API development, transaction consistency, and automated testing.

## Live Demo

- **Frontend:** https://digital-banking-amber.vercel.app
- **Backend API:** https://digital-banking-api-4neg.onrender.com
- **Health Check:** https://digital-banking-api-4neg.onrender.com/api/health

> This is an educational portfolio project. It does not process real money or connect to real banking systems.

## Features

### Authentication & Authorization
- User registration and login.
- JWT-based authentication.
- Role-based authorization with Spring Security.
- Stateless authentication using JWT filters.

### Banking Operations
- Create and manage bank accounts.
- View account information and balances.
- Deposit and withdraw funds.
- Transfer funds between accounts.
- View transaction history with pagination and date filters.

### Transaction Integrity
- Transactional processing with `@Transactional`.
- Rollback handling when a transaction fails.
- Basic concurrency testing for transaction operations.
- Balance consistency checks during banking operations.

### Frontend
- Responsive banking dashboard.
- Account overview and balance display.
- Deposit, withdrawal, and transfer forms.
- Transaction history and filtering.
- Banking-themed user interface.

## Technology Stack

| Layer | Technologies |
|---|---|
| Backend | Java 21, Spring Boot |
| Security | Spring Security, JWT |
| Data Access | Spring Data JPA, Hibernate |
| Database | PostgreSQL |
| Frontend | React, JavaScript, CSS |
| Build Tool | Maven |
| Deployment | Render, Vercel |
| Testing | JUnit, Spring Boot Test |

## Architecture

```text
React Frontend
      |
      | REST API / JSON
      v
Spring Boot Backend
      |
      +-- Controller Layer
      |
      +-- Service Layer
      |
      +-- Repository Layer
      |
      +-- Spring Security / JWT
      |
      v
PostgreSQL Database
```

The backend follows a layered architecture to separate API handling, business logic, data access, and security responsibilities.

## Project Structure

```text
digital-banking/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   └── java/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
└── frontend/
    ├── public/
    ├── src/
    ├── package.json
    └── index.html
```

## Getting Started

### Prerequisites

- Java 21
- PostgreSQL
- Node.js and npm

### 1. Clone the repository

```bash
git clone https://github.com/Brian2502/digital-banking.git
cd digital-banking
```

### 2. Configure the database

Create a PostgreSQL database named:

```sql
CREATE DATABASE digital_banking;
```

Configure the database connection and application secrets using the backend configuration or environment variables.

Do not commit real database passwords or JWT secrets to Git.

### 3. Run the backend

Open a terminal:

```bash
cd backend
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs at:

```text
http://localhost:8082
```

### 4. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create or configure the frontend environment variable:

```env
VITE_API_BASE_URL=http://localhost:8082/api
```

Start the development server:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Running Tests

From the backend directory:

**Windows PowerShell**

```powershell
.\mvnw.cmd test
```

The test suite includes unit and integration tests for core application flows, transaction rollback, and basic concurrency scenarios.

## Key Engineering Concepts

This project demonstrates practical experience with:

- RESTful API design.
- Layered architecture and dependency injection.
- DTO validation and exception handling.
- JWT authentication and role-based authorization.
- Spring Data JPA and Hibernate.
- Database transaction management.
- Rollback behavior and concurrency testing.
- Unit and integration testing.

## Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | PostgreSQL |

The application is deployed as separate frontend and backend services.

## Author

**Hà Hoàng Uy Vũ**

Java Backend Developer | Spring Boot

- GitHub: https://github.com/Brian2502

