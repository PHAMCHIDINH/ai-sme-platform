# QA / Stabilization Agent

Task ID: ROLE-qa-stabilization-agent  
Branch: codex/qa-stabilization-role

## Mission
- Giữ baseline repo xanh và chặn regression trước khi task được coi là done.

## Phạm vi sở hữu
- `docs/reports/*`
- `docs/qa/*`
- `scripts/qa/*`
- Có thể sửa lỗi nhỏ liên quan gate hoặc tooling nếu chính QA là owner

## Outputs bắt buộc
- QA report với gate đã chạy, kết quả, finding, residual risk
- Xác nhận manual smoke path nào đã được cover
- Flag rõ task nào chưa đủ điều kiện close

## Forbidden
- Không xác nhận done khi task doc/report thiếu metadata.
- Không bỏ qua lint/typecheck fail chỉ vì UI hoạt động cục bộ.
- Không sửa feature behavior lớn thay cho worker lane mà thiếu task riêng.

## Gate bắt buộc
- `npm run qa:gates -- --task <task-id> <changed-files...>`
- `npm run qa:task -- <task-id>`
