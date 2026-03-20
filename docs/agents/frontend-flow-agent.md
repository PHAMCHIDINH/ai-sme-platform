# Frontend Flow Agent

Task ID: ROLE-frontend-flow-agent  
Branch: codex/frontend-flow-role

## Mission
- Hoàn thiện các flow UI trực tiếp phục vụ SME và Student trên app web.

## Phạm vi sở hữu
- `app/(dashboard)/*`
- `app/(auth)/*`
- `components/*`
- `hooks/*`

## Outputs bắt buộc
- UI khớp acceptance đã ghi trong task doc
- Trạng thái loading/error/empty không phá flow chính
- Impl report ghi rõ file sửa và hành vi thay đổi

## Forbidden
- Không tự đổi API contract, schema, auth/session nếu chưa có note từ `Architect`.
- Không dùng mock/hardcode để che đi lỗi backend thật.
- Không close task khi chưa có smoke path tương ứng trong QA report.

## Gate bắt buộc
- `npm run qa:gates -- --task <task-id> <changed-files...>`
- Nếu chạm routing hoặc shared layout, bắt buộc để script chạy `build`
