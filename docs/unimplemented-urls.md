# Danh sách chức năng/URL chưa triển khai

Tài liệu này lưu trữ danh sách các chức năng hiện đã có giao diện (menu, nút bấm, liên kết) nhưng chưa được ánh xạ (map) với `routes.tsx` hoặc chưa có tính năng xử lý thực tế trong Frontend.

## 1. Các trang tĩnh / Hỗ trợ

| Tên chức năng | Vị trí hiện tại | URL mong muốn | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Giới thiệu** | Header Marketplace (`marketplace-header.tsx`) | `/gioi-thieu` | ✅ Đã triển khai | Trang giới thiệu về nền tảng |
| **Trung tâm trợ giúp** | Footer Marketplace (`marketplace-footer.tsx`) | `/help` | ✅ Đã triển khai | FAQ + kênh liên hệ |
| **Điều khoản dịch vụ** | Footer Marketplace, Trang Đăng ký (`register.tsx`) | `/terms` | ✅ Đã triển khai | Trang thông tin tĩnh |
| **Chính sách bảo mật** | Footer Marketplace, Trang Đăng ký (`register.tsx`) | `/privacy` | ✅ Đã triển khai | Trang thông tin tĩnh |

## 2. Nút chức năng ở UI Footer

| Tên chức năng | Vị trí | Hiện trạng | Hành động cần bổ sung |
| :--- | :--- | :--- | :--- |
| **Quét QR Code** | Footer Marketplace | ✅ Đã triển khai | Modal hiển thị QR Code tĩnh (link website) |
| **Đổi ngôn ngữ** | Footer Marketplace | ✅ Đã triển khai | Dropdown chọn ngôn ngữ (Tiếng Việt active, English coming soon) |

## 3. Các TODO đã phát hiện khác
- **Xử lý sau khi Chọn khu trọ**:
  - File: `select-tenant.tsx`
  - Hiện trạng: ✅ Đã sửa — khai báo state `selectedTenantId`, navigate đến `/tong-quan`.
  - Ghi chú: Logic `selectTenant()` trong auth-provider đã đủ (validate ACTIVE, clear cache, lưu store). Bug trước đó là biến `selectedTenant` undefined.

---
*Cập nhật lần cuối: 12/08/2026*
