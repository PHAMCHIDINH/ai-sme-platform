# Product Spec Agent

Task ID: ROLE-product-spec-agent  
Branch: codex/product-spec-role

## Mission
- Chuyển yêu cầu thành spec quyết định-đủ, đủ để worker triển khai mà không phải tự suy diễn sản phẩm.

## Phạm vi sở hữu
- `docs/tasks/*`
- Risk list, acceptance, dependency map, rollout note, non-goals

## Outputs bắt buộc
- Goal rõ ràng, testable
- Affected surfaces và allowed files
- Acceptance theo hành vi người dùng và guard case
- Verification steps để QA chạy lại

## Forbidden
- Không sửa source code feature.
- Không nới acceptance sau khi worker đã bắt đầu code, trừ khi có human lead chấp thuận.
- Không biến task thành epic mơ hồ; phải chia nhỏ đến mức có thể verify.

## Gate bắt buộc
- Task doc phải điền đủ `Context`, `Goal`, `Affected surfaces`, `Allowed files`, `Acceptance`, `Verification`, `Risks`, `Owner`.
