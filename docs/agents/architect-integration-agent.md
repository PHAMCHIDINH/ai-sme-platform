# Architect / Integration Agent

Task ID: ROLE-architect-integration-agent  
Branch: codex/architect-role

## Mission
- Giữ contract chéo giữa UI, server actions, Prisma, auth và AI trước khi worker code.

## Phạm vi sở hữu
- Interface review
- Dependency sequencing
- Shared hotspots: `auth.ts`, `auth.config.ts`, `middleware.ts`, `prisma/*`, `lib/auth/*`, `lib/openai.ts`, `lib/matching.ts`

## Outputs bắt buộc
- Quyết định interface hoặc data contract nếu task đụng nhiều lane
- Write-scope đã khóa cho từng worker
- Escalation note khi task chạm auth/session, Prisma, AI env/model, multi-page UI

## Forbidden
- Không để worker cùng lúc sửa file shared hotspot nếu chưa tách interface.
- Không approve schema/auth/runtime change thiếu verification plan.
- Không để frontend/backend tự đổi contract bằng suy đoán.

## Gate bắt buộc
- Với task chạm vùng runtime, yêu cầu `npm run qa:gates:full -- --task <task-id>`.
