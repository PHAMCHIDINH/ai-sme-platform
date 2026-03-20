# Sprint 1A - Core Flow Acceptance

Task ID: S1-A-001-core-flow-acceptance  
Branch: codex/product-spec-s1-a-001-core-flow-acceptance  
Lane: product-spec  
Owner: Product Spec Agent  
Status: Planned

## Context
- Core flow SME -> Student đã có nhiều bề mặt thật trong repo nhưng acceptance còn rải rác ở tài liệu cũ.

## Goal
- Chuẩn hóa acceptance và guard case cho chuỗi `SME tạo project -> matching -> apply/invite -> accept -> progress -> submit -> complete -> đánh giá 2 chiều`.

## Non-Goals
- Không code tính năng.
- Không tối ưu UI polish ngoài mức cần để mô tả acceptance.

## Affected Surfaces
- `docs/tasks/*`
- `docs/qa/smoke-checklist.md`
- Route core flow trong `app/(dashboard)`

## Allowed Files
- `docs/tasks/**`
- `docs/qa/smoke-checklist.md`

## Acceptance
- Có một spec thống nhất cho toàn bộ chuỗi core flow.
- Mỗi bước có happy path, guard case và điều kiện hoàn tất rõ.

## Verification
- Review tay với `Architect` và `QA`.

## Risks
- Acceptance bị mơ hồ sẽ gây rework cho cả frontend và backend lane.

## Owner Notes
- Ưu tiên khóa invariant trước khi backend/frontend tiếp tục mở thêm task.
