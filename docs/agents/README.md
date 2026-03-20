# Multi-Agent Operating Model

## Mục tiêu
- Dùng Codex local-first để điều phối công việc cho `Product + Engineering + QA`.
- Mọi công việc phải có `task doc`, `impl report`, `qa report` trước khi được coi là xong.
- Chỉ một `Orchestrator` nhận yêu cầu trực tiếp từ người vận hành và giao việc xuống các lane.

## Danh sách agent
- `Orchestrator`: điều phối backlog, khóa write-scope, quyết định tác vụ nào được chạy song song.
- `Product Spec Agent`: viết spec quyết định-đủ cho từng task.
- `Architect/Integration Agent`: giữ contract chéo giữa UI, server actions, Prisma, auth và AI.
- `Frontend Flow Agent`: thực thi các thay đổi trên `app/(dashboard)`, `app/(auth)`, `components`, `hooks`.
- `Backend Workflow Agent`: thực thi trên API routes, server actions, permission và state transition.
- `AI Matching Agent`: sở hữu `app/api/ai/*`, `lib/openai.ts`, `lib/matching.ts` và loop đánh giá chất lượng AI.
- `QA/Stabilization Agent`: chạy gate, xác nhận regression, ghi nhận finding và giữ smoke checklist.

## Luồng làm việc chuẩn
1. `Orchestrator` tạo hoặc cập nhật `docs/tasks/<task-id>.md`.
2. `Product Spec Agent` chốt goal, acceptance, risks và verification.
3. `Architect/Integration Agent` khóa interface, dependencies và write-scope.
4. Worker lane phù hợp triển khai trong branch `codex/<lane>-<task-id>`.
5. Worker cập nhật `docs/reports/<task-id>-impl.md`.
6. `QA/Stabilization Agent` chạy gate, cập nhật `docs/reports/<task-id>-qa.md`.
7. Chỉ close task sau khi `npm run qa:task -- <task-id>` pass.

## Quy tắc chung
- Một worker chỉ sửa trong write-scope được ghi trong task doc.
- Không chạy song song các task có file giao nhau, trừ khi `Architect` đã tách interface trước.
- `next build` là gate bắt buộc khi task đụng `app/`, auth, Prisma, AI route hoặc config ảnh hưởng runtime.
- Không thay đổi schema Prisma, auth/session, model/env AI hoặc UI ảnh hưởng nhiều page nếu chưa escalate lên `Architect + human lead`.
- Mỗi worker tối đa 2 task active tại cùng thời điểm.

## Command gate
- `npm run qa:gates -- --task <task-id> <file-a> <file-b>`: chạy `lint`, `typecheck`, và tự bật `build` nếu file chạm vùng runtime quan trọng.
- `npm run qa:gates:full -- --task <task-id>`: luôn chạy `lint`, `typecheck`, `build`.
- `npm run qa:task -- <task-id>`: xác nhận task doc + impl report + qa report đều tồn tại và có metadata tối thiểu.

## Nhịp vận hành
- Hằng ngày: `Orchestrator` giữ scope, mỗi lane tối đa 2 task active, chỉ nhận hotfix nếu ảnh hưởng lane hiện tại.
- Hằng tuần: freeze scope đầu tuần, demo cuối tuần trên dữ liệu seed, đo `lead time/task`, `gate pass rate`, `reopened bug count`.

## Điểm vào nhanh
- Contract role nằm trong `docs/agents/`.
- Task template nằm trong `docs/tasks/TASK-TEMPLATE.md`.
- Report template nằm trong `docs/reports/`.
- Smoke checklist nằm trong `docs/qa/smoke-checklist.md`.
