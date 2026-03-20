# Sprint 1D - AI And QA Readiness

Task ID: S1-D-001-ai-qa-readiness  
Branch: codex/ai-matching-s1-d-001-ai-qa-readiness  
Lane: ai-matching  
Owner: AI Matching Agent  
Status: Planned

## Context
- MVP đã có chuẩn hóa brief và matching, nhưng chưa có vòng đánh giá chất lượng AI và smoke checklist ổn định cho demo.

## Goal
- Kiểm tra chất lượng brief/matching, seed demo data cần thiết và khóa smoke checklist cho QA.

## Non-Goals
- Không mở rộng sang auto-delivery bằng AI.
- Không thay model/provider nếu chưa có human lead duyệt.

## Affected Surfaces
- `app/api/ai/**`
- `lib/openai.ts`
- `lib/matching.ts`
- `prisma/seed.ts`
- `docs/qa/smoke-checklist.md`

## Allowed Files
- `app/api/ai/**`
- `lib/openai.ts`
- `lib/matching.ts`
- `prisma/seed.ts`
- `docs/qa/smoke-checklist.md`

## Acceptance
- Matching degrade an toàn khi thiếu embedding hoặc provider lỗi.
- Có checklist dữ liệu demo và kỳ vọng chất lượng cho brief/matching.
- QA có thể chạy smoke cho lane AI mà không cần đoán.

## Verification
- `npm run qa:gates:full -- --task S1-D-001-ai-qa-readiness <changed-files...>`
- Manual smoke AI theo `docs/qa/smoke-checklist.md`

## Risks
- Chất lượng AI dễ dao động theo env/model và dữ liệu seed.

## Owner Notes
- Mọi thay đổi env/model phải escalate.
