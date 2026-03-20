# Sprint 1C - Backend Workflow Hardening

Task ID: S1-C-001-backend-workflow-hardening  
Branch: codex/backend-workflow-s1-c-001-backend-workflow-hardening  
Lane: backend-workflow  
Owner: Backend Workflow Agent  
Status: Planned

## Context
- Core workflow đã có API routes và server actions, nhưng cần siết permission, transaction và state transition theo acceptance thống nhất.

## Goal
- Hardening dữ liệu cho apply/invite/accept/progress/submit/complete/evaluate.

## Non-Goals
- Không thêm flow business mới ngoài core MVP.
- Không thay đổi schema Prisma nếu chưa có task riêng và escalation.

## Affected Surfaces
- `app/api/**`
- `app/actions/**`
- `lib/auth/**`
- `lib/http/**`

## Allowed Files
- `app/api/**`
- `app/actions/**`
- `lib/auth/**`
- `lib/http/**`

## Acceptance
- Sai role hoặc sai ownership bị chặn ở mọi entry point.
- Transaction không để project/application/progress rơi vào trạng thái nửa chừng.
- Không thể double-submit, double-accept hoặc double-evaluate trái invariant.

## Verification
- `npm run qa:gates:full -- --task S1-C-001-backend-workflow-hardening <changed-files...>`
- Manual guard case theo `docs/qa/smoke-checklist.md`

## Risks
- Regression cao vì thay đổi đụng nhiều route và state transition.

## Owner Notes
- Phải phối hợp chặt với `Architect` trước khi sửa interface dùng chung.
