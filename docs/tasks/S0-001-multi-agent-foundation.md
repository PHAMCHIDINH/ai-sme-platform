# Sprint 0 - Multi-Agent Foundation

Task ID: S0-001-multi-agent-foundation  
Branch: codex/orchestrator-s0-001-multi-agent-foundation  
Lane: orchestrator  
Owner: Codex  
Status: Done

## Context
- Repo đã có core flow MVP nhưng baseline gate đang đỏ ở lint và typecheck.
- Workspace chưa có contract cho multi-agent, template task/report hay gate command dùng chung.

## Goal
- Đưa baseline hiện tại về trạng thái ổn định hơn.
- Thêm bộ khung local-first để team có thể vận hành `Product + Engineering + QA` ngay trong repo.

## Non-Goals
- Không triển khai tính năng agent cho người dùng cuối.
- Không mở rộng sang GitHub/Linear-first hoặc CI orchestration trong sprint này.
- Không thay đổi schema Prisma hoặc UI flow lớn ngoài các sửa lỗi cần thiết để pass gate.

## Affected Surfaces
- `lib/auth/session.ts`
- `app/api/projects/route.ts`
- `package.json`
- `scripts/qa/*`
- `docs/agents/*`
- `docs/tasks/*`
- `docs/reports/*`
- `docs/qa/*`

## Allowed Files
- `lib/auth/session.ts`
- `app/api/projects/route.ts`
- `package.json`
- `scripts/qa/**`
- `docs/agents/**`
- `docs/tasks/**`
- `docs/reports/**`
- `docs/qa/**`

## Acceptance
- `npm run lint` không còn fail vì lỗi unused import hiện tại.
- `npm run typecheck` không còn fail vì lỗi nullability hiện tại ở `app/api/projects/route.ts`.
- Repo có command gate dùng chung cho lint, typecheck, build và handoff validation.
- Repo có contract cho từng agent chính, task template, report template và smoke checklist.
- Repo có ít nhất một task doc và cặp impl/qa report thật để dogfood quy trình mới.

## Verification
- `npm run qa:gates -- --task S0-001-multi-agent-foundation app/api/projects/route.ts lib/auth/session.ts package.json scripts/qa/run-gates.mjs scripts/qa/check-task-handoff.mjs`
- `npm run qa:task -- S0-001-multi-agent-foundation`

## Risks
- `next build` có thể tiếp tục lộ thêm lỗi ngoài hai lỗi baseline ban đầu.
- Repo đang có các thay đổi chưa commit ở nhiều file không thuộc task này; tuyệt đối không chỉnh ngoài write-scope.

## Owner Notes
- Nếu gate còn lộ lỗi runtime khác, mở task Sprint 0 tiếp theo thay vì mở rộng task này vô hạn.
