# 📘 Design Document: for-hobom-backend

## 🧭 Overview

`for-hobom-backend` is the backend system powering the HoBom ecosystem. It is developed with NestJS and adopts Hexagonal Architecture to ensure modularity, scalability, and separation of concerns. The system handles user management, daily todo operations, and category classification.

---

## 🏛️ Architecture

- **Pattern**: Hexagonal Architecture (Ports & Adapters)
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Testing**: Jest
- **API Documentation**: Swagger
- **CI/CD**: GitHub Actions

---

## 📦 Modules

### 1. User Module

- **Responsibilities**:
    - User registration and login
    - User profile management

### 2. Auth Module
- **Responsibilities**:
    - Managing JWT Tokens 

### 3. DailyTodo Module

- **Responsibilities**:
    - Daily task (todo) management for users

### 4. Category Module

- **Responsibilities**:
    - Managing user-defined categories

---

## 🧱 Hexagonal Architecture

- **Domain Layer**:
    - Contains business logic, entities, and value objects
- **Application Layer**:
    - Defines use cases and service interfaces (ports)
- **Infrastructure Layer**:
    - Implements repositories and external dependencies
- **Adapters**:
    - Bridges between core application and the outside world ( DB/API )

---

## 🧪 Testing

- **Unit Tests**: Focus on domain logic validation
- **Integration Tests**: Ensure collaboration between modules
- **Tool**: Jest

---

## 🚀 Deployment & CI/CD

- CI pipeline via GitHub Actions
- Test and lint checks on pull requests
- Future deployment support via Docker or similar

---

## 📚 API Documentation

- Swagger UI available at `/api-docs`
- Auto-generated from decorators in controller classes

---

## 🔐 Security & Validation

- Uses NestJS `ValidationPipe` and `class-validator` for DTO validation
- JWT-based authentication

---

## 🛣️ Future Plans

- Redis caching and performance optimization
- Multi-tenancy or user-group-based expansion
