# Huong Dan Deploy (Production va Demo)

Tai lieu nay tach ro 2 muc tieu:
- Production: khong seed du lieu demo, khong xoa du lieu that.
- Demo/Portfolio: co the seed du lieu mau, nhung phai opt-in ro rang.

Huong dan chi tiet ve seed safety:
- `docs/seed-safety.md`

## 1) Deploy Production tren Vercel

### Build command
Su dung:

```bash
npm run vercel-build
```

Script nay se:
- chay `npm run db:migrate:deploy` (uu tien migrate deploy; co fallback co kiem soat cho database chua baseline migration)
- `prisma generate`
- `lint` + `typecheck`
- `next build`

Khong co buoc seed du lieu demo.

### Environment variables bat buoc
- `DATABASE_URL`
- `AUTH_SECRET` (hoac `NEXTAUTH_SECRET`)
- `NEXTAUTH_URL`
- `OPENAI_API_KEY` (neu dung AI)
- `OPENAI_BASE_URL` (tuy provider)
- `OPENAI_CHAT_MODEL`
- `OPENAI_EMBEDDING_MODEL`

### Kiem tra truoc khi deploy
```bash
npm run lint
npm run typecheck
npm run build
```

## 2) Deploy Production bang Docker (VPS)

### Build va chay app
```bash
docker compose --env-file .env.docker up --build -d
```

Container app chi chay `npm run start`, khong tu dong mutate schema khi boot.

### Chay migration co kiem soat
Sau khi app container da len, chay migration mot lan:

```bash
docker exec -it ai-sme-app npm run db:migrate:deploy
```

Neu can che do strict (khong fallback), dung:

```bash
docker exec -it ai-sme-app npm run db:migrate:deploy:strict
```

Neu migration fail, dung rollout va fix migration truoc khi tiep tuc.

## 3) Seed du lieu Demo/Portfolio (khong dung cho production)

Seed script co thao tac `deleteMany()`, vi vay mac dinh bi chan.
Chi duoc chay khi bat `ALLOW_DESTRUCTIVE_SEED=true`.

Neu can cach dung theo tung shell (`bash`, `PowerShell`, `cmd`) va giai thich chi tiet:
- `docs/seed-safety.md`

### Cach chay nhanh
```bash
npm run db:seed:demo
```

### Tuy chon dat mat khau seed
Neu muon mat khau co dinh cho demo:
```bash
ALLOW_DESTRUCTIVE_SEED=true SEED_DEFAULT_PASSWORD='YourStrongDemoPass123' npm run db:seed
```

Neu khong dat `SEED_DEFAULT_PASSWORD`, script se tao mat khau ngau nhien va in ra log.

## 4) Canh bao quan trong
- Khong chay seed tren database production.
- Khong dung `prisma db push` trong startup production.
- Moi thay doi schema production phai di qua migration (`prisma migrate deploy`).
