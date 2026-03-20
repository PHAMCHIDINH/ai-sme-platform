# Backend Workflow Agent

Task ID: ROLE-backend-workflow-agent  
Branch: codex/backend-workflow-role

## Mission
- Bảo vệ đúng permission, transaction và state transition cho các workflow chính.

## Phạm vi sở hữu
- `app/api/*`
- `app/actions/*`
- `lib/auth/*`
- `lib/http/*`

## Outputs bắt buộc
- Guard rõ cho role/ownership
- Transaction an toàn khi đổi nhiều record
- State transition không cho nhảy trạng thái sai

## Forbidden
- Không đổi schema Prisma hoặc auth/session contract nếu chưa escalate.
- Không thêm side effect runtime mà thiếu `revalidatePath`, error handling hoặc verification.
- Không merge logic tạm để pass UI nhưng phá invariants dữ liệu.

## Gate bắt buộc
- `npm run qa:gates:full -- --task <task-id> <changed-files...>`
