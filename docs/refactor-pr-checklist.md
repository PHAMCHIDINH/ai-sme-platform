# Refactor Checklist (PR1-PR6)

Mục tiêu: tối ưu cấu trúc thư mục và tổ chức code theo từng PR nhỏ, giảm rủi ro regression.

## PR1 - Tách `chat-brief` thành module service

### Scope
- Tách logic trong `app/api/ai/chat-brief/route.ts` thành:
  - `lib/services/chat-brief/prompt-builder.ts`
  - `lib/services/chat-brief/message-parser.ts`
  - `lib/services/chat-brief/profile-inference.ts`
  - `lib/services/chat-brief/response-normalizer.ts`
  - `lib/services/chat-brief/index.ts`
- Giữ `route.ts` chỉ còn: auth, parse request, gọi service, trả response.

### Done when
- Không đổi contract API hiện tại.
- `route.ts` còn dưới 180 dòng.
- Unit test bao phủ normalize + infer + next-field suggestion.

### Verify
- `npm run test`
- `npm run lint`
- `npm run build`

---

## PR2 - Chia nhỏ `progress-lifecycle` theo trách nhiệm

### Scope
- Tách `lib/services/progress-lifecycle.ts` thành:
  - `lib/services/progress/parser.ts`
  - `lib/services/progress/use-cases.ts`
  - `lib/services/progress/presenter.ts`
  - `lib/services/progress/index.ts`
- Cập nhật import tại:
  - `app/(dashboard)/student/my-projects/page.tsx`
  - `app/(dashboard)/sme/projects/[id]/page.tsx`

### Done when
- Không còn trộn parser + DB mutation + UI mapping trong 1 file.
- Không có logic duplicate giữa service và page.
- Mỗi module có test riêng.

### Verify
- `npm run test`
- `npm run typecheck`
- `npm run build`

---

## PR3 - Chuẩn hóa mapping trạng thái dùng chung

### Scope
- Tạo `lib/presenters/progress-status.ts` (hoặc đặt trong `lib/services/progress/presenter.ts` nếu giữ chung).
- Di chuyển toàn bộ label/class/status-bar mapping về 1 nơi.
- Xóa mapping local tại các page.

### Done when
- `student/my-projects` và `sme/projects/[id]` dùng cùng nguồn mapping.
- Không còn hàm mapping trùng tên/trùng ý nghĩa ở nhiều file.

### Verify
- Snapshot test hoặc unit test cho mapping.
- Manual check 2 màn hình hiển thị trạng thái đúng.

---

## PR4 - Chuẩn hóa tầng truy cập dữ liệu (Repository layer)

### Scope
- Tạo repo theo domain:
  - `lib/repos/application-repo.ts`
  - `lib/repos/progress-repo.ts`
  - `lib/repos/project-repo.ts`
- Service không gọi `prisma` trực tiếp, gọi qua repo.

### Done when
- Service layer chỉ xử lý nghiệp vụ, không chứa query chi tiết.
- Transaction boundaries vẫn giữ nguyên hành vi.

### Verify
- Integration tests cho accept/reject/respond/submit/complete vẫn pass.
- Không đổi API contract hiện hữu.

---

## PR5 - Chuẩn hóa response envelope nội bộ

### Scope
- Tạo type dùng chung:
  - `lib/types/result.ts` với dạng `Ok<T>` và `Err`.
- Refactor actions/services dùng chung envelope thay vì trả object rời rạc.
- Chuẩn hóa code/message lỗi nghiệp vụ (conflict, forbidden, invalid state).

### Done when
- `app/actions/application.ts`, `app/actions/auth.ts`, các service chính dùng một chuẩn.
- Không còn return shape bất nhất trong cùng module.

### Verify
- Unit test cho mapping error code -> user message.
- Typecheck không còn ép kiểu thủ công rải rác.

---

## PR6 - Architecture guard + hygiene

### Scope
- Cập nhật `.gitignore` để chặn artifact/log không cần version control:
  - `build.log`, `docker_build.log`, `errors.txt`, `next-build/`, `output/`
- Thêm rule kiểm soát cấu trúc:
  - script kiểm tra file-size budget (cảnh báo >300 dòng, fail >500 dòng)
  - rule import boundary (app -> lib allowed; lib -> app disallowed)
- Nối vào `ci:verify`.

### Done when
- CI fail khi vi phạm boundary/size budget.
- Repository sạch hơn, giảm nhiễu review.

### Verify
- `npm run ci:verify` pass.
- Thử tạo file vi phạm để xác nhận guard hoạt động.

---

## Quy tắc rollout

1. Mỗi PR phải độc lập và merge được ngay.
2. Không đổi API contract nếu chưa có yêu cầu explicit.
3. Mỗi PR phải có test tương ứng với phần thay đổi.
4. Chỉ chuyển PR kế tiếp khi PR trước đã pass `ci:verify`.

---

## Kết quả mong đợi sau PR6

- Không còn file "god file" ở route/service trọng yếu.
- Domain logic rõ ràng hơn, dễ kiểm thử và mở rộng.
- Boundary kiến trúc được enforce tự động qua CI.
- Review/maintain hằng ngày nhanh hơn và ít regression hơn.
