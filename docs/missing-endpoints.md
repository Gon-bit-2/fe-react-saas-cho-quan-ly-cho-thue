# Danh sách API còn thiếu ở Backend

Tài liệu này liệt kê các API (endpoint) hiện tại chưa được triển khai ở Backend (NestJS), nhưng lại cần thiết để Frontend có thể hoạt động hoàn hảo và loại bỏ hoàn toàn các Mock Data đang được gán cứng (hardcode).

## 1. Module Xem phòng (Viewing Appointments)
*Màn hình ảnh hưởng:* **Chi tiết lịch xem phòng** (`frontend/src/features/tenant-app/pages/viewing-schedules/schedule-detail.tsx`)

| API Còn Thiếu | Method | Mô tả |
| :--- | :--- | :--- |
| `/room-viewing-appointments/:id` | `GET` | Lấy chi tiết của một lịch hẹn xem phòng cụ thể (kèm thông tin property, room, và renter). Hiện tại Backend mới chỉ có API dạng danh sách (`GET /room-viewing-appointments` và `GET /room-viewing-appointments/me`). |

## 2. Module Lời mời (Invitations)
*Màn hình ảnh hưởng:* **Chi tiết lời mời thuê phòng** (`frontend/src/features/tenant-app/pages/renters/invite-detail.tsx`)

| API Còn Thiếu | Method | Mô tả |
| :--- | :--- | :--- |
| `/renters/invitations/:id` hoặc `/tenants/invitations/:id` | `GET` | API để lấy chi tiết thông tin của một lời mời thuê phòng (chủ trọ là ai, tòa nhà nào, giá phòng, tiền cọc...). Hiện tại Backend mới chỉ có `POST /renters/invitations` và `POST /renters/invitations/accept`. |

## 3. Các API cần bổ sung Filter/Thống kê (Action Center / Dashboard)
*Màn hình ảnh hưởng:* **Action Center (Dashboard)** và **Debt List (Công nợ)**

| API / Endpoint cần tối ưu | Vấn đề hiện tại ở Backend | Mô tả cần bổ sung |
| :--- | :--- | :--- |
| `/dashboard/summary` | Trả về tổng quan chung chung. | Cần bổ sung các mảng dữ liệu/số lượng đếm cho: **Yêu cầu thuê chờ duyệt (Pending Requests)**, **Hợp đồng sắp hết hạn (Expiring Contracts)**, **Hóa đơn chưa thanh toán (Unpaid Invoices)**, **Tickets đang mở**. Hoặc nếu không, Frontend sẽ phải gọi 4 API GET list riêng lẻ với các tham số lọc (filters). |
| `/invoices/debts` | Mới chỉ trả về danh sách công nợ. | Cần trả về thêm **Thống kê (meta stats)**: Tổng tiền nợ, Số tiền quá hạn trên 30 ngày, Quá hạn dưới 30 ngày... để UI hiển thị các khối Card thống kê thay vì Mock Data. |
| `/contracts/:id` | Cần đảm bảo có chứa `members` | API Chi tiết Hợp đồng (`GET /contracts/:id`) cần phải populate (join) được danh sách các thành viên trong hợp đồng (Tenant Members) thì Frontend mới hiển thị được tab Thành viên mà không cần mock. |

---
*Ghi chú: Sau khi các API này được cập nhật ở Backend, bạn có thể triển khai kế hoạch làm sạch Mock Data ở Frontend một cách đồng bộ nhất.*
