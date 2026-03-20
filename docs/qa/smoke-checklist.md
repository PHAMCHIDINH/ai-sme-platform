# Smoke Checklist

## Khi nào phải chạy
- Bắt buộc cho task đụng `app/`, auth/session, Prisma, API route hoặc AI route.
- Với task chỉ chỉnh docs/tooling, QA có thể ghi rõ vì sao manual smoke không áp dụng.

## Happy Path Bắt Buộc
1. SME đăng nhập và tạo project mới thành công.
2. SME dùng AI để chuẩn hóa brief và lưu project ở trạng thái đúng.
3. Student nhìn thấy project phù hợp hoặc lời mời phù hợp.
4. Student ứng tuyển hoặc phản hồi lời mời thành công.
5. SME chấp nhận ứng viên và project chuyển đúng sang `IN_PROGRESS`.
6. Student thêm milestone, cập nhật tiến độ và nộp deliverable.
7. SME nghiệm thu, project chuyển `COMPLETED`.
8. SME đánh giá sinh viên và student đánh giá SME, không bị double-submit.

## Guard Cases Bắt Buộc
1. Sai role không truy cập được route/action nhạy cảm.
2. Sai ownership không xem hoặc thay đổi dữ liệu project của người khác.
3. Project không nhảy sai trạng thái khi accept, submit, complete.
4. Không được cập nhật tiến độ sau `SUBMITTED` hoặc `COMPLETED`.
5. Matching degrade an toàn khi student chưa có embedding hoặc provider AI lỗi.
6. Hệ thống không cho đánh giá lặp lại cùng một project và cùng chiều đánh giá.

## Báo cáo QA tối thiểu
- Ghi rõ task id, commit/branch làm việc, command gate đã chạy.
- Nêu flow nào đã chạy lại và flow nào chưa chạy.
- Tách `blocking findings` và `residual risks`.
