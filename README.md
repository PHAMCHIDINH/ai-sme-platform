# AI SME Platform

Nen tang AI ket noi sinh vien voi bai tap thuc chien tu doanh nghiep SME.

## Chay local (khong Docker)

```bash
npm install
npm run db:up
npm run db:push
npm run dev
```

Ung dung chay tai [http://localhost:3000](http://localhost:3000).

Luu y:
- Local dev van can PostgreSQL o `localhost:5432` (duoc chay boi `db` service).
- Neu gap loi `Can't reach database server at localhost:5432`, chay lai `npm run db:up`.
- Neu dang chay `next dev`, su dung `npm run db:push` (da `--skip-generate`) de tranh loi khoa file Prisma engine tren Windows.

## Trien khai bang Docker

### 1) Chuan bi bien moi truong

Tao file `.env.docker` tu mau:

```bash
cp .env.docker.example .env.docker
```

Cap nhat gia tri:
- `OPENAI_API_KEY`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET` (nen dung cung gia tri voi `AUTH_SECRET` de tranh loi giai ma session JWT)

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
npm run db:up
npm run db:down
npm run docker:up
npm run docker:logs
npm run docker:down
```
