# Seed Safety Guide

Tai lieu nay giai thich ro `ALLOW_DESTRUCTIVE_SEED` va cach dung seed dung cach.
Muc tieu: de hieu, de chay, va khong xoa nham du lieu production.

## 1) Seed script nay co gi nguy hiem?

Script `prisma/seed.ts` co `deleteMany()` tren cac bang chinh.
Dieu nay co nghia:
- Chay seed co the xoa du lieu hien co.
- Neu chay tren production DB, du lieu that co the bi mat.

Vi ly do do, script da duoc harden:
- Mac dinh chan seed destructive.
- Chi cho chay khi co `ALLOW_DESTRUCTIVE_SEED=true`.

## 2) `ALLOW_DESTRUCTIVE_SEED` la gi?

Day la cong tac an toan.

- `ALLOW_DESTRUCTIVE_SEED=true`: cho phep seed destructive.
- Khong dat hoac dat khac `true`: script tu choi chay.

Thong diep khi bi chan:
- `Seed bi chan vi co thao tac xoa du lieu. Chi chay khi set ALLOW_DESTRUCTIVE_SEED=true.`

## 3) Khong dat lenh shell vao file `.env`

Sai:

```env
ALLOW_DESTRUCTIVE_SEED=true npm run db:seed
```

Dung:
- `.env` chi chua cap `KEY=VALUE`.
- Lenh chay dat o terminal.

Vi du dung trong `.env` (chi danh cho demo/local):

```env
ALLOW_DESTRUCTIVE_SEED=true
SEED_DEFAULT_PASSWORD=YourStrongDemoPass123
```

Sau do moi chay:

```bash
npm run db:seed
```

## 4) Cach chay seed dung cho tung moi truong

### A) Production

Khong chay seed.
Dung migration:

```bash
npm run db:migrate:deploy
```

Vercel production dung:

```bash
npm run vercel-build
```

`vercel-build` khong seed.

### B) Demo/Portfolio

Cach nhanh:

```bash
npm run db:seed:demo
```

Script nay tu set `ALLOW_DESTRUCTIVE_SEED=true`.

Neu muon tu truyen password demo:

```bash
ALLOW_DESTRUCTIVE_SEED=true SEED_DEFAULT_PASSWORD='YourStrongDemoPass123' npm run db:seed
```

### C) Local dev

Neu can reset du lieu de test e2e nhanh, dung flow demo ben tren.
Neu khong can reset du lieu, khong seed.

## 5) Lenh theo he dieu hanh

### Bash / Zsh (macOS, Linux, Git Bash)

```bash
ALLOW_DESTRUCTIVE_SEED=true npm run db:seed
```

### PowerShell (Windows)

```powershell
$env:ALLOW_DESTRUCTIVE_SEED="true"
npm run db:seed
```

Dat password:

```powershell
$env:ALLOW_DESTRUCTIVE_SEED="true"
$env:SEED_DEFAULT_PASSWORD="YourStrongDemoPass123"
npm run db:seed
```

### CMD (Windows Command Prompt)

```cmd
set ALLOW_DESTRUCTIVE_SEED=true && npm run db:seed
```

## 6) Password sau khi seed

- Neu co `SEED_DEFAULT_PASSWORD`: script dung password do.
- Neu khong co: script tao password random va in ra log.

Khuyen nghi:
- Demo co the dat password ro rang de de login.
- Production tuyet doi khong dung seed flow nay.

## 7) Checklist truoc khi bam Enter

1. Ban dang dung dung DB URL? (`DATABASE_URL`)
2. Day co phai production DB khong?
3. Neu la production: dung ngay, khong chay seed.
4. Neu la demo/local: da backup (neu can)?
5. Da dat ro `ALLOW_DESTRUCTIVE_SEED=true` chua?

## 8) Troubleshooting nhanh

### Loi: script bi chan do thieu ALLOW_DESTRUCTIVE_SEED
- Nguyen nhan: chua set env hoac set sai.
- Cach sua: dung `npm run db:seed:demo` hoac set env dung syntax theo shell.

### Da set trong `.env` nhung van khong chay
- Kiem tra app shell co nap `.env` cho lenh seed hay khong.
- Thu chay one-shot ngay tren terminal:

```bash
ALLOW_DESTRUCTIVE_SEED=true npm run db:seed
```

### So run nham production
- Bo sung guard o ha tang:
- Khong expose `db:seed:demo` trong CI production.
- Khoa quyen credential production DB.
- Tach ro project production va project demo.
