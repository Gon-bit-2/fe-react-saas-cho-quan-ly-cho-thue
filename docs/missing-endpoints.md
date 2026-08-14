# Trạng thái các endpoint từng được ghi nhận là còn thiếu

Tài liệu này được cập nhật theo OpenAPI hiện hành. Các mục đã có endpoint hoặc response cần thiết được đánh dấu đã giải quyết; không tiếp tục dùng ghi chú cũ làm lý do để gắn dữ liệu mẫu ở frontend.

## 1. Module Xem phòng — đã giải quyết
*Màn hình ảnh hưởng:* **Chi tiết lịch xem phòng** (`frontend/src/features/tenant-app/pages/viewing-schedules/schedule-detail.tsx`)

| API | Method | Trạng thái |
| :--- | :--- | :--- |
| `/room-viewing-appointments/:id` | `GET` | Đã có và frontend list/detail/status đã nối API thật. |

## 2. Module Lời mời (Invitations)
*Màn hình ảnh hưởng:* **Chi tiết lời mời thuê phòng** (`frontend/src/features/tenant-app/pages/renters/invite-detail.tsx`)

| API Còn Thiếu | Method | Mô tả |
| :--- | :--- | :--- |
| `/renters/invitations/:id` hoặc `/tenants/invitations/:id` | `GET` | API để lấy chi tiết thông tin của một lời mời thuê phòng (chủ trọ là ai, tòa nhà nào, giá phòng, tiền cọc...). Hiện tại Backend mới chỉ có `POST /renters/invitations` và `POST /renters/invitations/accept`. |

## 3. Filter/Thống kê và hợp đồng
*Màn hình ảnh hưởng:* **Action Center (Dashboard)** và **Debt List (Công nợ)**

| API / Endpoint cần tối ưu | Vấn đề hiện tại ở Backend | Mô tả cần bổ sung |
| :--- | :--- | :--- |
| `/dashboard/summary` | Trả về tổng quan chung chung. | Cần bổ sung các mảng dữ liệu/số lượng đếm cho: **Yêu cầu thuê chờ duyệt (Pending Requests)**, **Hợp đồng sắp hết hạn (Expiring Contracts)**, **Hóa đơn chưa thanh toán (Unpaid Invoices)**, **Tickets đang mở**. Hoặc nếu không, Frontend sẽ phải gọi 4 API GET list riêng lẻ với các tham số lọc (filters). |
| `/invoices/debts` | Mới chỉ trả về danh sách công nợ. | Cần trả về thêm **Thống kê (meta stats)**: Tổng tiền nợ, Số tiền quá hạn trên 30 ngày, Quá hạn dưới 30 ngày... để UI hiển thị các khối Card thống kê thay vì Mock Data. |
| `/contracts/:id` | Đã trả `members`. | Frontend chi tiết và trang thành viên đã dùng quan hệ thật, không còn CCCD/lịch sử mẫu. |

---
*Ghi chú: action-center/debt stats và chi tiết lời mời vẫn là các cải tiến API/UI hợp lệ; chúng không chặn các flow địa chỉ, Goong, marketplace, lịch xem phòng và hợp đồng đã triển khai.*
