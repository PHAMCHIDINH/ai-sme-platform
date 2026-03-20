# Sprint 1B - Frontend Flow Audit

Task ID: S1-B-001-frontend-flow-audit  
Branch: codex/frontend-flow-s1-b-001-frontend-flow-audit  
Lane: frontend-flow  
Owner: Frontend Flow Agent  
Status: Planned

## Context
- Các màn hình dashboard/auth đã có phần lớn flow thật nhưng còn cần audit loading, error, empty state và consistency.

## Goal
- Audit và hoàn thiện các page SME/Student trực tiếp phục vụ core flow MVP.

## Non-Goals
- Không đổi schema dữ liệu.
- Không redesign landing/onboarding ngoài phạm vi core flow.

## Affected Surfaces
- `app/(dashboard)/**`
- `app/(auth)/**`
- `components/**`

## Allowed Files
- `app/(dashboard)/**`
- `app/(auth)/**`
- `components/**`
- `hooks/**`

## Acceptance
- Mỗi page core flow có loading/error/empty state phù hợp.
- Không còn CTA dead-end hoặc status sai với dữ liệu backend thật.

## Verification
- `npm run qa:gates -- --task S1-B-001-frontend-flow-audit <changed-files...>`
- Manual smoke theo `docs/qa/smoke-checklist.md`

## Risks
- Dễ đụng contract backend nếu acceptance chưa khóa trước.

## Owner Notes
- Mọi thay đổi chạm shared layout phải báo `Architect`.
