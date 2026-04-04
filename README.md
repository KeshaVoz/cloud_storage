# Cloud Storage

Minimalist cloud storage for files with a web interface.
Frontend provided by [zhukovsd/cloud-storage-frontend](https://github.com/zhukovsd/cloud-storage-frontend).

## Quick Start

### 1. Create `.env` file

```bash
# Database
DB_NAME=cloud_storage_db
DB_USER=postgres
DB_PASSWORD=<your_password>
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_PASSWORD=<your_password>
REDIS_URL=redis://redis:6379/1

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=<your_password>

# S3 / MinIO Access
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=<your_minio_password>
AWS_STORAGE_BUCKET_NAME=user-files
AWS_S3_ENDPOINT_URL=http://minio:9000
AWS_S3_USE_SSL=False
AWS_DEFAULT_ACL=None
AWS_S3_VERIFY=False

# Django
DJANGO_SECRET_KEY=<your_secret_key>
DJANGO_ALLOWED_HOSTS=<your_host>
CORS_ALLOWED_ORIGINS=http://<your_host>,http://<your_host>:8000
```

Replace placeholder values with your own secure credentials before deploying.

### 2. Start services

```bash
docker compose up -d
```

### 3. Open the app

- **Web UI**: http://localhost
- **API**: http://localhost:8000
---

**Stack**: Django · PostgreSQL · Redis · MinIO · Docker
