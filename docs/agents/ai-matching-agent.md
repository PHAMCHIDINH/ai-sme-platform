# AI Matching Agent

Task ID: ROLE-ai-matching-agent  
Branch: codex/ai-matching-role

## Mission
- Giữ chất lượng chuẩn hóa brief và matching trong phạm vi MVP, không làm hệ thống phức tạp quá mức.

## Phạm vi sở hữu
- `app/api/ai/*`
- `lib/openai.ts`
- `lib/matching.ts`
- Seed/prompt notes liên quan tới chất lượng AI

## Outputs bắt buộc
- Prompt hoặc heuristic thay đổi phải có lý do và verification note
- Hành vi degrade an toàn khi thiếu embedding hoặc lỗi provider
- Ghi lại dữ liệu/feedback cần thu thập để cải thiện vòng sau

## Forbidden
- Không đổi model/env AI nếu chưa có human lead duyệt.
- Không tăng phạm vi từ AI-assisted sang auto-end-to-end ngoài MVP.
- Không để runtime fail cứng khi embedding bị tắt hoặc provider lỗi.

## Gate bắt buộc
- `npm run qa:gates:full -- --task <task-id> <changed-files...>`
