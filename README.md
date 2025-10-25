# GPTutor

An AI-powered educational platform with support for VK Mini Apps and Telegram Mini Apps, featuring chat-based tutoring, coding challenges, image generation, and RAG (Retrieval-Augmented Generation) for VK API documentation.

**Version**: 1.0.0
**License**: [Unlicense](LICENSE) (public domain)
**Platforms**: VK Mini Apps, Telegram Mini Apps

---

## 🚀 Features

- **AI Chat Modes**: Free chat, tutorial mode, mock interviews, code trainer, LeetCode integration
- **Image Generation**: Multiple Stable Diffusion models with advanced controls
- **VK API Assistant**: RAG-powered answers based on official VK documentation
- **Subscriptions**: Tiered plans with usage limits
- **Code Editor**: Monaco editor with syntax highlighting
- **Multi-Platform**: VK and Telegram Mini Apps support

---

## 📦 Project Structure

```
GPTutor/
├── GPTutor-Backend/         # Java/Spring Boot backend (default)
├── GPTutor-Backend-Bun/     # Bun/TypeScript backend (alternative)
├── GPTutor-Frontend/        # React/TypeScript frontend
├── GPTutor-Models/          # Python ML models service
├── GPTutor-Rag/             # Node.js RAG service
├── docker-compose-*.yaml    # Docker Compose configurations
└── deploy-*.sh              # Deployment scripts
```

---

## ⚙️ Backend Options

GPTutor now offers **two backend implementations** with identical functionality:

### 1. Java Backend (Default) - `GPTutor-Backend/`

- **Technology**: Java 17, Spring Boot 3.0.5
- **Advantages**:
  - Battle-tested and stable
  - Rich ecosystem with Spring features
  - Original implementation
- **Use when**: You prefer Java, need Spring-specific features, or want the original implementation

### 2. Bun Backend (Alternative) - `GPTutor-Backend-Bun/`

- **Technology**: Bun runtime, TypeScript, Hono framework
- **Advantages**:
  - ⚡ **3-10x faster startup** (~50-200ms vs 3-5s)
  - 💾 **3-5x less memory** (~100-150MB vs ~512MB)
  - 📦 **Smaller Docker image** (~150MB vs ~500MB)
  - 🚀 **Lower latency** (~2-5ms vs ~5-10ms)
- **Use when**: You want maximum performance, minimal resource usage, or prefer TypeScript/JavaScript

**Both backends**:
- ✅ Share the same PostgreSQL database
- ✅ Have 100% API compatibility
- ✅ Support all features (WebSocket, auth, rate limiting, etc.)
- ✅ Work with the existing frontend without changes

---

## 🔄 Switching Between Backends

### Using Docker Compose

Edit your `docker-compose-*.yaml` file:

**To use Java backend (default)**:
```yaml
# Java Backend (default - comment out to use Bun backend)
backend-prod:
  env_file:
    - .env
    - .env-prod
  build: ./GPTutor-Backend
  # ... rest of config

# Bun Backend (alternative - uncomment to use instead of Java backend)
# backend-bun-prod:
#   env_file:
#     - .env
#     - .env-prod
#   build: ./GPTutor-Backend-Bun
#   # ... rest of config
```

**To use Bun backend**:
```yaml
# Java Backend (default - comment out to use Bun backend)
# backend-prod:
#   env_file:
#     - .env
#     - .env-prod
#   build: ./GPTutor-Backend
#   # ... rest of config

# Bun Backend (alternative - uncomment to use instead of Java backend)
backend-bun-prod:
  env_file:
    - .env
    - .env-prod
  build: ./GPTutor-Backend-Bun
  # ... rest of config
```

Then redeploy:
```bash
docker-compose -f docker-compose-prod.yaml down
docker-compose -f docker-compose-prod.yaml up -d
```

### Local Development

**Java Backend**:
```bash
cd GPTutor-Backend
mvn spring-boot:run
```

**Bun Backend**:
```bash
cd GPTutor-Backend-Bun
bun install
bun run dev
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **For Java backend**: Java 17+, Maven 3.8+
- **For Bun backend**: Bun 1.0+ ([install](https://bun.sh))
- **PostgreSQL** 13+ (or use Docker)

### Using Docker Compose (Recommended)

1. **Clone the repository**:
```bash
git clone https://github.com/deep-assistant/GPTutor.git
cd GPTutor
```

2. **Configure environment**:
```bash
cp .env.example .env
cp .env-prod.example .env-prod
# Edit .env and .env-prod with your settings
```

3. **Deploy all services**:
```bash
# Production (Java backend by default)
./deploy-all.sh

# Or for staging
./deploy-stage.sh

# Or for local development
./local-run.sh
```

4. **Access the application**:
- Frontend: `https://gptutor.prod.{HOST}`
- Backend API: `https://prod.{HOST}`

### Manual Setup

See individual README files:
- [Java Backend README](GPTutor-Backend/README.md)
- [Bun Backend README](GPTutor-Backend-Bun/README.md)
- [Frontend README](GPTutor-Frontend/README.md)

---

## 🐳 Docker Compose Configurations

- `docker-compose-prod.yaml` - Production deployment
- `docker-compose-stage.yaml` - Staging deployment
- `docker-compose-dev.yaml` - Local development

Each configuration includes backend options for both Java and Bun implementations.

---

## 📊 Performance Comparison

| Metric | Java Backend | Bun Backend |
|--------|-------------|-------------|
| Startup Time | ~3-5s | ~50-200ms |
| Memory Usage | ~512MB | ~100-150MB |
| Docker Image | ~500MB | ~150MB |
| Request Latency | ~5-10ms | ~2-5ms |
| Cold Start | ~10-15s | ~1-2s |

---

## 🌐 API Documentation

Both backends expose identical REST APIs:

### Core Endpoints

**Messages**
- `POST /messages` - Create message
- `GET /messages/:historyId` - Get messages
- `GET /messages/json/:historyId` - Export as JSON
- `GET /messages/txt/:historyId` - Export as TXT

**History**
- `POST /history` - Create history
- `GET /history` - List histories (pagination & search)
- `DELETE /history/:id` - Delete history
- `PUT /history` - Update history

**Conversation**
- `POST /conversation` - Chat completion
- `POST /vk-doc/conversation` - VK docs RAG query

**Images**
- `POST /image` - Generate image
- `GET /image` - List user images
- `GET /publishing` - List published images

**WebSocket**
- `ws://host/online` - Online users tracking

See full API documentation in [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🛠️ Development

### Adding New Features

Both backends follow similar patterns:

**Java Backend**:
1. Create entity in `entity/`
2. Create repository in `repository/`
3. Create service in `service/`
4. Create controller in `controllers/`
5. Add Flyway migration in `resources/db/migration/`

**Bun Backend**:
1. Define types in `services/` or `entities/`
2. Create service in `services/`
3. Create controller in `controllers/`
4. Register controller in `src/index.ts`
5. Database uses same schema as Java backend

### Running Tests

**Java Backend**:
```bash
cd GPTutor-Backend
mvn test
```

**Bun Backend**:
```bash
cd GPTutor-Backend-Bun
bun test
```

---

## 🔒 Security

- **Authentication**: VK Mini Apps signature verification, Telegram initData validation
- **Rate Limiting**: Per-user request throttling with token bucket algorithm
- **CORS**: Configured allowed origins
- **Database**: Prepared statements prevent SQL injection
- **S3**: Private buckets with signed URLs

---

## 📝 Environment Variables

Key environment variables (see `.env.example`):

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# External Services
MODELS_URL=http://localhost:1337
RAG_URL=http://localhost:5000

# Auth
MASTER_TOKEN=your_vk_secret
TG_TOKEN=your_tg_bot_token
SKIP_AUTH=false

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
```

---

## 📚 Documentation

- [Architecture Documentation](ARCHITECTURE.md) - Detailed system architecture
- [Java Backend README](GPTutor-Backend/README.md)
- [Bun Backend README](GPTutor-Backend-Bun/README.md)
- [Frontend README](GPTutor-Frontend/README.md)

---

## 🤝 Contributing

Contributions are welcome! When contributing:

1. **For bug fixes**: Submit PR to both backends if applicable
2. **For new features**: Implement in both backends to maintain feature parity
3. **For backend-specific improvements**: Clearly document in PR description
4. Follow existing code style and conventions

---

## 📜 License

This software is released into the **public domain** under the [Unlicense](https://unlicense.org).

**Important**: The Unlicense is NOT the same as having no license. It's a specific public domain dedication that explicitly grants everyone the freedom to use, modify, and distribute this software without restrictions.

See [LICENSE](LICENSE) for full details.

---

## 👥 Contributors

Deep.Assistant Team

---

## 🙏 Acknowledgments

- **Spring Boot** - Java backend framework
- **Bun** - Fast JavaScript runtime
- **Hono** - Lightweight web framework
- **PostgreSQL** - Database
- **React** - Frontend framework
- **OpenAI** - AI models
- **VK** - Platform integration
- **Telegram** - Platform integration

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/deep-assistant/GPTutor/issues)
- **Telegram**: [@menzorg](https://t.me/menzorg)

---

**Made with ❤️ by Deep.Assistant Team**
