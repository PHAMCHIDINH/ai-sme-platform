# Team Runbook 1 Page (Onboarding Nhanh)

Muc tieu: clone repo -> chay app local -> verify chat luong co ban.

## 6 lenh chuan

1. Cai dependencies
```bash
npm install
```

2. Bat PostgreSQL container local
```bash
npm run db:up
```

3. Dong bo schema vao DB local
```bash
npm run db:push
```

4. Chay app local
```bash
npm run dev
```

5. Chay gate ky thuat truoc khi push code
```bash
npm run qa:gates:full -- --task onboarding-local
```

6. (Tuy chon, chi demo/local) Reset + seed du lieu mau
```bash
npm run db:seed:demo
```

## Ghi nho nhanh
- Khong dung lenh seed cho production.
- Production deploy dung `npm run vercel-build`.
- Neu can huong dan seed chi tiet: `docs/seed-safety.md`.
