# Ecommerce Agent API

Backend API built with [NestJS](https://nestjs.com/) to manage e-commerce agents, product recommendations, and AI-powered functionalities.

The project uses **MongoDB Atlas Local** with **Vector Search support**, integrating with **LangChain** and **OpenAI** to provide smart responses and product recommendations. All the functional code is in the development branch.

---

## 🚀 Features

- **NestJS 10** framework
- **MongoDB** with **Mongoose**
- **LangChain** integration (`core`, `openai`, `langgraph`, `mongodb`)
- Configuration validation with **Joi**
- All endpoints prefixed with **`/api/v1`**
- Script to create embeddings index in MongoDB
- Centralized environment configuration

---

## ⚙️ Environment Variables

Reference from `.env` file:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key
MODEL_NAME=gpt-5-mini
DATABASE_NAME=ecommerce
MONGO_URI=mongodb://user:pass@localhost:27019/?directConnection=true
```

---

## 📦 Installation

```bash
# Install dependencies
yarn install
```

---

## ▶️ Running the Application

### 🐳 Docker

This project includes a `docker-compose.yaml` to start a local MongoDB Atlas container:

```bash
docker-compose up -d
```

Available services:

- **mongodb** → exposed on port `27017` (or `27019` depending on local config)

---

### Development

```bash
yarn start:dev
```

### Create Embeddings Index

```bash
yarn create:index
```

---

## 🔗 API Endpoints

All endpoints are prefixed with **`/api/v1`**.  
Examples below are based on the **Postman collection**.

---

### 👤 Agent

#### POST `/api/v1/agent/chat`

Handles customer queries like order status, returns, and product recommendations.

**Examples**

- **Ask for order status**

```json
{
  "message": "I want to know the order status for this order: OR-1234"
}
```

- **Request return**

```json
{
  "message": "I want to return one Sport T-Shirt DryFit in my order OR-1234 because I bought twice for error. I want refund for one of them"
}
```

- **Recommendations**

```json
{
  "message": "I want to buy sport shoes, can you recommend for more than 25 USD"
}
```

---

### 📦 Products

#### POST `/api/v1/products/seed`

Seeds the product collection in the database.

```http
POST /api/v1/products/seed
```

#### POST `/api/v1/products/recommend`

Provides product recommendations based on semantic search.

**Example**

```json
{
  "query": "I want to buy sport shoes, can you recommend for more than 25 USD"
}
```
