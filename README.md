<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# NestJS Microservices Example: API Gateway & Todo Service with NATS, Prisma, PostgreSQL

This project demonstrates a practical implementation of a microservices architecture using the NestJS framework within a monorepo structure. It includes an API Gateway and a dedicated Todo microservice that communicate asynchronously via NATS messaging. Prisma is used as the ORM to interact with a PostgreSQL database.

## Overview

The goal of this example is to showcase best practices for building scalable and maintainable applications with NestJS, including:

* **Monorepo:** Using NestJS Workspaces for managing multiple applications and libraries in a single repository.
* **Microservices:** Separating concerns into distinct services (API Gateway, Todo Service).
* **API Gateway Pattern:** A single entry point (`api-gateway`) that routes client requests to the appropriate internal microservice (`todo-service`).
* **Asynchronous Communication:** Using NATS as a lightweight, high-performance message broker for inter-service communication (Request-Response pattern).
* **Database Interaction:** Using Prisma ORM for type-safe database access to PostgreSQL.
* **Shared Libraries:** Utilizing the `libs` folder for reusable code (e.g., the `DatabaseModule`).
* **Configuration Management:** Using `@nestjs/config` to handle environment variables.
* **Development Tooling:** Incorporating TypeScript, ESLint (linting), Prettier (formatting), and Husky (Git hooks).
* **Basic Security:** Using Helmet in the API Gateway for essential security headers.
* **Containerization:** Using Docker Compose to easily set up external services (PostgreSQL, NATS).

## Features

* **NestJS Monorepo Structure** (`apps/`, `libs/`)
* **API Gateway** (`apps/api-gateway`) exposing a RESTful API for Todos.
* **Todo Microservice** (`apps/todo-service`) handling business logic for Todos.
* **NATS Integration** (`@nestjs/microservices`) for communication.
* **Prisma ORM** (`@prisma/client`) connected to PostgreSQL.
* **PostgreSQL Database** managed via Docker.
* **Shared Database Module** (`libs/database`) for Prisma setup.
* **DTOs and Validation** (`class-validator`, `class-transformer`).
* **Environment Variable Management** (`@nestjs/config`).
* **Basic Security Headers** (`helmet`).
* **Linting & Formatting** (ESLint, Prettier).
* **Git Hooks** (`husky`) for pre-commit linting.
* **Docker Compose Setup** for easy development environment initialization.

## Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (LTS version recommended, e.g., v18, v20)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [NestJS CLI](https://docs.nestjs.com/cli/overview) (`npm install -g @nestjs/cli`)
* [Docker](https://www.docker.com/products/docker-desktop/)
* [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)
* [Git](https://git-scm.com/)

## Setup and Installation

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url> nest-nats-workspaces
    cd nest-nats-workspaces
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set Up Environment Variables:**
    Create `.env` files within each application directory (`apps/api-gateway` and `apps/todo-service`).

    * **`apps/api-gateway/.env`:**
        ```dotenv
        # Port for the API Gateway HTTP server
        API_GATEWAY_PORT=3000

        # URL for the NATS server
        NATS_URL=nats://localhost:4222
        ```

    * **`apps/todo-service/.env`:**
        ```dotenv
        # Connection string for the PostgreSQL database (matches docker-compose.yml)
        DATABASE_URL="postgresql://user:password@localhost:5432/todos_db?schema=public"

        # URL for the NATS server
        NATS_URL=nats://localhost:4222
        ```
    *(Note: Ensure the `DATABASE_URL` credentials match those in `docker-compose.yml`)*

4.  **Start External Services (PostgreSQL & NATS):**
    Use Docker Compose to start the required database and message broker services in the background.
    ```bash
    docker-compose up -d
    ```
    You can check the status with `docker ps`.

5.  **Run Database Migrations:**
    Apply the Prisma schema to your PostgreSQL database. This will create the `Todo` table.
    ```bash
    npm run prisma:migrate:dev
    ```
    *(This command references the schema located at `./apps/todo-service/prisma/schema.prisma`)*

6.  **(Optional but recommended) Generate Prisma Client:**
    Ensure the Prisma Client is up-to-date with your schema.
    ```bash
    npm run prisma:generate
    ```

## Running the Application

You need to run both the `api-gateway` and the `todo-service` applications simultaneously.

**Development Mode (with Hot Reloading):**

Open two separate terminals in the project root directory:

* **Terminal 1 (API Gateway):**
    ```bash
    npm run start:gateway:dev
    ```

* **Terminal 2 (Todo Service):**
    ```bash
    npm run start:todo:dev
    ```

* **Alternatively (using concurrently):**
    If you have `concurrently` installed (`npm install concurrently --save-dev`), you can use the combined script (make sure it's defined in `package.json`):
    ```bash
    npm run start:all:dev
    ```

Wait for both services to log that they are running and connected to NATS.

**Production Mode:**

1.  Build the applications:
    ```bash
    npm run build
    ```
2.  Start the built applications (usually in separate processes managed by PM2 or similar):
    ```bash
    npm run start:gateway:prod
    # node dist/apps/api-gateway/main
    ```
    ```bash
    npm run start:todo:prod
    # node dist/apps/todo-service/main
    ```

## Testing the API with Swagger

Once the API Gateway and Todo Service are running, you can interact with the API Gateway's REST endpoint (default: `http://localhost:3000/api`).

Swagger in default: `http://localhost:3000/api/v1/docs`

## Key Concepts Explained

* **Monorepo:** Centralizes code management, simplifies dependency handling, and facilitates code sharing (`libs`).
* **API Gateway:** Acts as a facade, decoupling clients from the internal microservice structure. Handles HTTP requests and forwards them as NATS messages.
* **Microservices (`todo-service`):** Independent units focused on specific business capabilities. Listens for NATS messages and interacts with the database.
* **NATS Communication:** Lightweight messaging used for asynchronous request-response communication between the gateway and the todo service.
* **Prisma:** Type-safe ORM simplifying database interactions and providing robust migration tools.
* **Shared Library (`libs/database`):** Promotes DRY principles by centralizing the Prisma setup code. Check `tsconfig.json` for the path alias used (e.g., `@app/database`).
* **Configuration (`@nestjs/config`):** Loads environment-specific settings from `.env` files located within each application's directory.

## Available Scripts

Here are some of the key scripts defined in the root `package.json`:

* `npm run build`: Builds all applications and libraries for production.
* `npm run format`: Formats code using Prettier.
* `npm run lint`: Lints code using ESLint and attempts to fix issues.
* `npm run start:gateway:dev`: Starts the API Gateway in watch mode.
* `npm run start:todo:dev`: Starts the Todo Service in watch mode.
* `npm run start:all:dev`: Starts both services concurrently (requires `concurrently`).
* `npm run start:gateway:prod`: Starts the built API Gateway.
* `npm run start:todo:prod`: Starts the built Todo Service.
* `npm test`: Runs unit tests.
* `npm run prisma:migrate:dev`: Creates/applies database migrations based on the schema.
* `npm run prisma:generate`: Generates/updates the Prisma Client.
* `npm run prisma:studio`: Opens the Prisma Studio GUI to view/edit database data.

## License

This project can be considered under the MIT License (or specify your chosen license).