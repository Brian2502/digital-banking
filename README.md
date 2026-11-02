# Digital Banking

A banking web application built with Spring Boot and React.

I built this project to practice developing a backend application with Java and Spring Boot, especially authentication, account management, and handling financial transactions.

Users can log in, view their bank account, deposit and withdraw money, transfer funds to another account, and check their transaction history.

## Tech Stack

**Backend**
- Java 21
- Spring Boot 4.1.1
- Spring Security
- Spring Data JPA / Hibernate
- PostgreSQL
- JWT (JJWT)

**Frontend**
- React 19
- Vite
- Axios
- Recharts
- Lucide React

## Features

- User registration and login
- JWT authentication
- View bank account information and balance
- Deposit and withdraw money
- Transfer money between accounts
- View transaction history with pagination and date filters
- Validate transaction amounts and account status

## A Closer Look at Transfers

One of the parts I spent more time on was handling money transfers correctly.

A transfer updates two accounts: money is deducted from the sender and added to the receiver. Both balance updates and the related transaction records need to succeed together.

I used Spring's `@Transactional` so that a failure during the operation rolls back the database changes.

I also used JPA pessimistic write locking to prevent concurrent operations from incorrectly updating the same account balance. When locking two accounts for a transfer, they are retrieved in a consistent order to help reduce deadlock risk.

I added integration tests to check:
- Whether account balances are restored when a transfer fails.
- Whether two concurrent transfers from the same account produce the expected result.
- Whether the transaction records remain consistent with the account balances.

## Project Structure

```text
digital-banking/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   └── java/com/brian/digitalbanking/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── entity/
│   │   │       ├── exception/
│   │   │       ├── repository/
│   │   │       ├── security/
│   │   │       └── service/
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

## Getting Started

### Requirements

- Java 21
- PostgreSQL
- Node.js compatible with Vite 8
- npm

### 1. Clone the project

```bash
git clone https://github.com/Brian2502/digital-banking.git
cd digital-banking
```

### 2. Create the database

Create a PostgreSQL database:

```sql
CREATE DATABASE digital_banking;
```

### 3. Configure the backend

Set the following environment variables before starting the backend:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/digital_banking"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD=""
$env:JWT_SECRET=""
```

Do not commit real database credentials or JWT secrets.

### 4. Start the backend

Open a terminal in the `backend` directory:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs at:

```text
http://localhost:8082
```

To run tests:

```powershell
.\mvnw.cmd test
```

### 5. Start the frontend

Open another terminal in the `frontend` directory:

```bash
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Tests

The backend includes unit and integration tests for the main transaction flows.

Current test classes:

- `DigitalBankingApplicationTests`
- `TransactionServiceTest`
- `TransactionRollbackIntegrationTest`
- `TransactionConcurrencyIntegrationTest`

The integration tests use PostgreSQL and check transaction rollback and concurrent transfer behavior.

## What I Learned

While building this project, I got more practical experience with:

- Structuring a Spring Boot application using controllers, services, and repositories.
- Implementing JWT authentication with Spring Security.
- Working with JPA, Hibernate, and PostgreSQL.
- Managing database transactions with `@Transactional`.
- Using pessimistic locking when multiple requests may update the same account.
- Writing unit tests and integration tests for backend business logic.

## Future Improvements

- Add refresh token support.
- Use Flyway for database migrations.
- Improve frontend loading performance.
- Add Docker support and deploy the application.
