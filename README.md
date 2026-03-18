# AI SME Platform

Nen tang AI ket noi sinh vien voi bai tap thuc chien tu doanh nghiep SME.

## Chay local (khong Docker)

```bash
npm install
npm run dev
```

Ung dung chay tai [http://localhost:3000](http://localhost:3000).

## Trien khai bang Docker

### 1) Chuan bi bien moi truong

Tao file `.env.docker` tu mau:

```bash
cp .env.docker.example .env.docker
```

Cap nhat gia tri:
- `OPENAI_API_KEY`
- `NEXTAUTH_SECRET`

### 2) Build va chay

```bash
docker compose --env-file .env.docker up --build -d
```

Dich vu duoc tao:
- `db`: PostgreSQL 16 (`localhost:5432`)
- `app`: Next.js app (`http://localhost:3000`)

App se tu dong chay `prisma db push` khi start de dong bo schema.

### 3) Xem log

```bash
docker compose logs -f app
docker compose logs -f db
```

### 4) Dung he thong

```bash
docker compose down
```

Neu muon xoa ca volume DB:

```bash
docker compose down -v
```

## Scripts nhanh

```bash
npm run docker:up
npm run docker:logs
npm run docker:down
```
