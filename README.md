# Cloud Storage

Minimalist cloud storage for files with a web interface.
Frontend provided by [zhukovsd/cloud-storage-frontend](https://github.com/zhukovsd/cloud-storage-frontend).

## Quick Start

### 1. Configure environment variables

Copy the example environment file and update the values with your own secure credentials:

```bash
cp .env.example .env
```

### 2. Start services

```bash
docker compose up -d
```

### 3. Open the app

- **Web UI**: http://localhost
- **API**: http://localhost:8000
---

**Stack**: Django · PostgreSQL · Redis · MinIO · Docker
