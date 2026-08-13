# Danh sách màn hình Frontend — Web & Mobile

**Phiên bản:** 1.0.0  
**Cơ sở:** Tài liệu MVP, kiến trúc và đặc tả G01–G12  
**Quy ước ưu tiên:** `P0` = bắt buộc cho MVP; `P1` = nên có để hoàn chỉnh trải nghiệm; `P2` = sau MVP hoặc phụ thuộc API còn backlog.

## 1. Cách chia sản phẩm

Hệ thống nên được triển khai thành bốn surface dùng chung design system:

1. **Public marketplace web** — khách và renter tìm phòng.
2. **Operations web** — landlord/manager/accountant/maintenance vận hành tenant.
3. **Platform admin web** — super admin quản trị SaaS và moderation.
4. **Mobile app** — ưu tiên renter self-service; staff mobile là phạm vi rút gọn.

Một “màn hình” trong danh sách là một logical view. Create/edit có thể dùng chung component và route mode. Detail phức tạp nên dùng tab thay vì tách quá nhiều trang.

## 2. Navigation đề xuất

### 2.1. Operations web

```text
Tổng quan
Nguồn cung
  ├─ Nhà trọ
  ├─ Phòng
  └─ Tiện ích phòng
Khách thuê
  ├─ Yêu cầu thuê
  ├─ Lịch xem phòng
  └─ Người thuê
Hợp đồng
  ├─ Hợp đồng
  ├─ Tài sản & bàn giao
  └─ Yêu cầu kết thúc
Điện nước & dịch vụ
  ├─ Công tơ
  ├─ Chỉ số
  ├─ OCR
  ├─ Danh mục dịch vụ
  └─ Gán dịch vụ
Tài chính
  ├─ Hóa đơn
  ├─ Công nợ
  └─ Thanh toán
Vận hành
  ├─ Ticket
  └─ Thông báo
Gói dịch vụ
```

Menu được lọc theo role. `ACCOUNTANT` không được thấy action sửa meter nếu API không cấp quyền; `MAINTENANCE_STAFF` tập trung ticket được giao.

### 2.2. Platform admin web

```text
Dashboard nền tảng
Landlords
Tenants
Plans
Marketplace moderation
Subscription payments
Amenities
Review moderation
Report moderation
Thông báo
```

### 2.3. Renter mobile

```text
Khám phá | Thuê nhà | Thanh toán | Hỗ trợ | Tài khoản
```

## 3. Web — Shared/Auth

| ID | Màn hình | Route gợi ý | Actor | Ưu tiên | Nguồn |
|---|---|---|---|---|---|
| W-A01 | Đăng nhập bước mật khẩu | `/login` | Public | P0 | G01/FR-01 |
| W-A02 | Xác nhận OTP đăng nhập | `/login/otp` | Public | P0 | G01/FR-01 |
| W-A03 | Đăng ký tài khoản | `/register` | Public | P0 | G01/FR-01 |
| W-A04 | Quên/đặt lại mật khẩu bằng OTP | `/forgot-password` | Public | P0 | G01/FR-01 |
| W-A05 | Google OAuth callback/session exchange | `/auth/google/callback` | Public | P1 | G01/FR-01 |
| W-A06 | Hồ sơ tài khoản | `/account/profile` | Authenticated | P0 | G01/FR-02 |
| W-A07 | Session expired/no permission/tenant unavailable | route state | Authenticated | P0 | G01/NFR-01–02 |

**Ghi chú:** OTP là bước trong flow, không nên mở như màn hình độc lập có thể truy cập tự do. Return URL phải được giữ sau login.

## 4. Web — Public Marketplace

| ID | Màn hình | Route gợi ý | Actor | Ưu tiên | Nguồn |
|---|---|---|---|---|---|
| W-P01 | Trang chủ marketplace + search nhanh | `/` | Public | P0 | G04/FR-09 |
| W-P02 | Danh sách/tìm/lọc phòng | `/rooms` | Public | P0 | G04/FR-09 |
| W-P03 | Chi tiết phòng + gallery + review summary | `/rooms/:roomId` | Public | P0 | G04, G12/FR-10 |
| W-P04 | Đặt lịch xem phòng | `/rooms/:roomId/book-viewing` hoặc drawer | RENTER | P0 | G04/FR-11 |
| W-P05 | Gửi yêu cầu thuê | `/rooms/:roomId/rental-request` hoặc drawer | RENTER | P0 | G04/FR-11 |
| W-P06 | Báo cáo tin/phòng vi phạm | `/rooms/:roomId/report` hoặc modal | Authenticated | P1 | G12 |

**Không đưa vào MVP:** favorite room, view log, sort/radius nâng cao nếu OpenAPI hiện hành chưa có API tương ứng.

## 5. Web — Renter Self-service

| ID | Màn hình | Route gợi ý | Ưu tiên | Nội dung chính | Nguồn |
|---|---|---|---|---|---|
| W-R01 | Tổng quan renter | `/me` | P1 | Việc sắp tới, hóa đơn cần trả, ticket đang mở, notification | FR-29 |
| W-R02 | Hồ sơ người thuê | `/me/renter-profile` | P0 | RenterProfile; link sang hồ sơ tài khoản chung | G05/FR-12 |
| W-R03 | Yêu cầu thuê của tôi | `/me/rental-requests` | P0 | List/filter/status/cancel/resubmit | G04/FR-11 |
| W-R04 | Chi tiết yêu cầu thuê | `/me/rental-requests/:id` | P0 | Timeline, message, trạng thái, bổ sung thông tin | G04 |
| W-R05 | Lịch xem phòng của tôi | `/me/appointments` | P0 | List/calendar, cancel, reschedule state | G04/FR-11 |
| W-R06 | Chi tiết lịch xem | `/me/appointments/:id` | P0 | Phòng, thời gian, staff, trạng thái | G04 |
| W-R07 | Hợp đồng của tôi | `/me/contracts` | P0 | List/filter trạng thái | G05/FR-13, FR-29 |
| W-R08 | Chi tiết hợp đồng | `/me/contracts/:id` | P0 | Terms, members, room, timeline, handover, termination | G05 |
| W-R09 | Bàn giao/kiểm kê của tôi | `/me/contracts/:id/handovers/:handoverId` | P1 | Checklist tài sản, confirm/dispute | G05 |
| W-R10 | Yêu cầu kết thúc hợp đồng | `/me/contracts/:id/termination` | P1 | Tạo/theo dõi/cancel theo state | G05 |
| W-R11 | Hóa đơn của tôi | `/me/invoices` | P0 | List, status, due date, remaining | G07/FR-18–20, FR-29 |
| W-R12 | Chi tiết hóa đơn & thanh toán | `/me/invoices/:id` | P0 | Item breakdown, QR PayOS, manual confirmation | G07–G08/FR-21–22 |
| W-R13 | Ticket của tôi | `/me/tickets` | P0 | List/filter/status | G09/FR-23, FR-29 |
| W-R14 | Tạo ticket | `/me/tickets/new` | P0 | Contract/room, category, priority, mô tả, ảnh | G09 |
| W-R15 | Chi tiết ticket | `/me/tickets/:id` | P0 | Public comments, attachments, close/reopen/cancel hợp lệ | G09 |
| W-R16 | Trung tâm thông báo | `/notifications` | P0 | Filter, unread count, mark read/all | G10/FR-24, FR-29 |
| W-R17 | Đánh giá của tôi | `/me/reviews` | P1 | List/detail/create từ contract đủ điều kiện | G12 |
| W-R18 | Báo cáo của tôi | `/me/reports` | P1 | List/detail/status | G12 |

**Giới hạn:** Không tách màn “lịch sử thanh toán của tôi” nếu runtime chưa có `/payments/me`; trạng thái payment nên hiển thị trong invoice detail. Không làm màn renter xem meter reading nếu API self-service chưa tồn tại.

## 6. Web — Tenant Operations

### 6.1. Dashboard và tenant shell

| ID | Màn hình | Route gợi ý | Actor | Ưu tiên | Nguồn |
|---|---|---|---|---|---|
| W-O01 | Dashboard tenant | `/dashboard` | LANDLORD, MANAGER, ACCOUNTANT | P0 | G11/FR-14, FR-25 |
| W-O02 | Hoạt động gần đây | tab trong dashboard | Cùng nhóm | P0 | G11 |
| W-O03 | Chọn/chuyển tenant | topbar control | Tenant staff | P0 | G01/FR-03 |

Dashboard gồm room metrics, occupancy, contract ending soon, invoice/payment/debt, ticket và revenue trend. Dùng REST; không thiết kế realtime dashboard.

### 6.2. Nhà trọ, tầng, phòng, tiện ích

| ID | Màn hình | Route gợi ý | Actor | Ưu tiên | Nguồn |
|---|---|---|---|---|---|
| W-O04 | Danh sách nhà trọ | `/properties` | LANDLORD, MANAGER | P0 | G03/FR-06 |
| W-O05 | Tạo/sửa nhà trọ | `/properties/new`, `/:id/edit` | LANDLORD, MANAGER | P0 | G03 |
| W-O06 | Chi tiết nhà trọ | `/properties/:id` | LANDLORD, MANAGER | P0 | G03 |
| W-O07 | Quản lý tầng | tab `floors` trong property detail | LANDLORD, MANAGER | P0 | G03 |
| W-O08 | Danh sách phòng | `/rooms` | LANDLORD, MANAGER | P0 | G03/FR-07 |
| W-O09 | Tạo/sửa phòng | `/rooms/new`, `/:id/edit` | LANDLORD, MANAGER | P0 | G03 |
| W-O10 | Chi tiết phòng | `/rooms/:id` | LANDLORD, MANAGER | P0 | G03 |
| W-O11 | Ảnh & tiện ích phòng | tabs trong room detail | LANDLORD, MANAGER | P0 | G03 |
| W-O12 | Publish/ẩn/gửi duyệt tin | action panel trong room detail | LANDLORD, MANAGER | P0 | G03–G04/FR-08 |

### 6.3. Lead, lịch xem và người thuê

| ID | Màn hình | Route gợi ý | Actor | Ưu tiên | Nguồn |
|---|---|---|---|---|---|
| W-O13 | Danh sách yêu cầu thuê | `/rental-requests` | LANDLORD, MANAGER | P0 | G04/FR-11 |
| W-O14 | Chi tiết/xử lý yêu cầu thuê | `/rental-requests/:id` | LANDLORD, MANAGER | P0 | G04 |
| W-O15 | Danh sách/lịch xem phòng | `/appointments` | LANDLORD, MANAGER | P0 | G04 |
| W-O16 | Chi tiết/xử lý lịch xem | `/appointments/:id` | LANDLORD, MANAGER | P0 | G04 |
| W-O17 | Danh sách người thuê | `/renters` | LANDLORD, MANAGER | P0 | G05/FR-12 |
| W-O18 | Chi tiết người thuê/lịch sử thuê | `/renters/:id` | LANDLORD, MANAGER | P0 | G05 |
| W-O19 | Mời/provision renter | drawer từ renter/request/contract | LANDLORD, MANAGER | P1 | G05 |

### 6.4. Hợp đồng, tài sản, bàn giao, kết thúc

| ID | Màn hình | Route gợi ý | Actor | Ưu tiên | Nguồn |
|---|---|---|---|---|---|
| W-O20 | Danh sách hợp đồng | `/contracts` | LANDLORD, MANAGER | P0 | G05/FR-13–14 |
| W-O21 | Tạo/sửa hợp đồng | `/contracts/new`, `/:id/edit` | LANDLORD, MANAGER | P0 | G05 |
| W-O22 | Chi tiết hợp đồng | `/contracts/:id` | LANDLORD, MANAGER | P0 | G05 |
| W-O23 | Kích hoạt/hủy hợp đồng | action panel trong detail | LANDLORD, MANAGER | P0 | G05 |
| W-O24 | Danh mục tài sản | `/assets/categories` | LANDLORD, MANAGER | P1 | G05 |
| W-O25 | Tài sản theo phòng | `/rooms/:id/assets` | LANDLORD, MANAGER | P1 | G05 |
| W-O26 | Danh sách bàn giao | `/handovers` | LANDLORD, MANAGER | P1 | G05 |
| W-O27 | Tạo/chi tiết bàn giao | `/handovers/new`, `/:id` | LANDLORD, MANAGER | P1 | G05 |
| W-O28 | Xử lý dispute bàn giao | panel trong handover detail | LANDLORD, MANAGER | P1 | G05 |
| W-O29 | Yêu cầu kết thúc hợp đồng | `/terminations` | LANDLORD, MANAGER | P1 | G05 |
| W-O30 | Chi tiết/approve/reject/complete termination | `/terminations/:id` | LANDLORD, MANAGER | P1 | G05 |

### 6.5. Điện nước, OCR và dịch vụ

| ID | Màn hình | Route gợi ý | Actor | Ưu tiên | Nguồn |
|---|---|---|---|---|---|
| W-O31 | Danh sách công tơ | `/meters` | LANDLORD, MANAGER | P0 | G06/FR-15 |
| W-O32 | Tạo/sửa/chi tiết công tơ | `/meters/new`, `/:id` | LANDLORD, MANAGER | P0 | G06 |
| W-O33 | Danh sách chỉ số | `/meter-readings` | LANDLORD, MANAGER, ACCOUNTANT | P0 | G06/FR-16 |
| W-O34 | Nhập/sửa/chi tiết chỉ số | `/meter-readings/new`, `/:id` | Nhóm trên | P0 | G06 |
| W-O35 | Upload OCR chỉ số | `/ocr/new` | Role được API cho phép | P1 | G06/FR-17 |
| W-O36 | Danh sách job OCR | `/ocr` | Role được API cho phép | P1 | G06 |
| W-O37 | Review/accept kết quả OCR | `/ocr/:id` | Role được API cho phép | P1 | G06 |
| W-O38 | Danh mục dịch vụ | `/services` | LANDLORD, MANAGER | P0 | G06/FR-15 |
| W-O39 | Tạo/sửa dịch vụ | `/services/new`, `/:id/edit` | LANDLORD, MANAGER | P0 | G06 |
| W-O40 | Gán dịch vụ cho phòng/hợp đồng | `/service-assignments` | LANDLORD, MANAGER | P0 | G06 |

### 6.6. Hóa đơn, công nợ và thanh toán

| ID | Màn hình | Route gợi ý | Actor | Ưu tiên | Nguồn |
|---|---|---|---|---|---|
| W-O41 | Danh sách hóa đơn | `/invoices` | LANDLORD, MANAGER, ACCOUNTANT | P0 | G07/FR-18–19 |
| W-O42 | Tạo/sửa hóa đơn draft | `/invoices/new`, `/:id/edit` | Nhóm trên | P0 | G07 |
| W-O43 | Chi tiết hóa đơn | `/invoices/:id` | Nhóm trên | P0 | G07 |
| W-O44 | Phát hành/hủy/đánh dấu overdue | action panel trong detail | Nhóm trên | P0 | G07 |
| W-O45 | Danh sách công nợ | `/debts` | LANDLORD, MANAGER, ACCOUNTANT | P0 | G07/FR-20 |
| W-O46 | Danh sách thanh toán chờ đối soát | `/payments` | Staff tài chính | P0 | G08/FR-21–22 |
| W-O47 | Chi tiết/approve/reject payment | `/payments/:id` | Staff tài chính | P0 | G08 |

### 6.7. Ticket, notification và subscription

| ID | Màn hình | Route gợi ý | Actor | Ưu tiên | Nguồn |
|---|---|---|---|---|---|
| W-O48 | Danh sách ticket | `/tickets` | LANDLORD, MANAGER, MAINTENANCE_STAFF | P0 | G09/FR-23 |
| W-O49 | Chi tiết ticket | `/tickets/:id` | Nhóm trên | P0 | G09 |
| W-O50 | Phân công/trạng thái/comment/attachment | panels trong ticket detail | Theo permission | P0 | G09 |
| W-O51 | Trung tâm thông báo | `/notifications` | Authenticated staff | P0 | G10/FR-24 |
| W-O52 | Gói dịch vụ hiện tại | `/subscription` | LANDLORD | P1 | G02, G08/FR-05 |
| W-O53 | Chọn plan & PayOS checkout | `/subscription/plans` | LANDLORD | P1 | G02, G08 |
| W-O54 | Lịch sử/chi tiết thanh toán gói | `/subscription/payments`, `/:id` | LANDLORD | P1 | G08 |

## 7. Web — Platform Admin

| ID | Màn hình | Route gợi ý | Ưu tiên | Nội dung | Nguồn |
|---|---|---|---|---|---|
| W-D01 | Dashboard nền tảng | `/admin/dashboard` | P0 | Summary/trends user, tenant, room, listing, subscription | G11/FR-26 |
| W-D02 | Danh sách landlords | `/admin/landlords` | P0 | Search/filter/status | G01–G02/FR-27 |
| W-D03 | Chi tiết landlord | `/admin/landlords/:id` | P0 | Profile, owned tenants, status action | G01–G02 |
| W-D04 | Danh sách tenants | `/admin/tenants` | P0 | Status, verification, plan | G02/FR-04 |
| W-D05 | Tạo/sửa/chi tiết tenant | `/admin/tenants/new`, `/:id` | P0 | Owner, tenant, subscription, status | G02 |
| W-D06 | Xác minh/đình chỉ/đổi plan tenant | action panels trong detail | P0 | State action có reason/confirm | G02 |
| W-D07 | Danh sách plans | `/admin/plans` | P0 | Active/inactive, price, quota/feature | G02/FR-05 |
| W-D08 | Tạo/sửa/chi tiết plan | `/admin/plans/new`, `/:id` | P0 | Monthly/yearly, quota, flags | G02 |
| W-D09 | Marketplace moderation queue | `/admin/marketplace` | P0 | Filter trạng thái, tenant, date | G04/FR-28 |
| W-D10 | Moderation detail & history | `/admin/marketplace/:roomId` | P0 | Listing snapshot, approve/reject/hide, history | G04 |
| W-D11 | Đối soát subscription payments | `/admin/subscription-payments` | P1 | List/detail provider/reference/status | G08 |
| W-D12 | Danh mục tiện ích toàn hệ thống | `/admin/amenities` | P0 | List/create/edit/disable | G03 |
| W-D13 | Review moderation queue/detail | `/admin/reviews`, `/:id` | P1 | Approve/reject/hide, audit metadata | G12 |
| W-D14 | Report moderation queue/detail | `/admin/reports`, `/:id` | P1 | Claim/resolve/reject, target snapshot | G12 |
| W-D15 | Thông báo của admin | `/admin/notifications` | P1 | Inbox/read state | G10 |

## 8. Mobile — Renter MVP

Mobile dùng cùng API self-service nhưng tối ưu theo task, không bê nguyên table web.

| ID | Màn hình | Navigation/route | Ưu tiên | Nguồn |
|---|---|---|---|---|
| M-R01 | Splash/session restore | root | P0 | G01 |
| M-R02 | Đăng nhập + OTP | auth stack | P0 | G01/FR-01 |
| M-R03 | Đăng ký | auth stack | P0 | G01 |
| M-R04 | Quên mật khẩu | auth stack | P0 | G01 |
| M-R05 | Khám phá/tìm phòng | tab Khám phá | P0 | G04/FR-09 |
| M-R06 | Bộ lọc phòng | bottom sheet | P0 | G04 |
| M-R07 | Chi tiết phòng | room detail | P0 | G04, G12/FR-10 |
| M-R08 | Đặt lịch/gửi yêu cầu | sheet/flow | P0 | G04/FR-11 |
| M-R09 | Thuê nhà overview | tab Thuê nhà | P0 | FR-29 |
| M-R10 | Requests & appointments | nested tabs | P0 | G04 |
| M-R11 | Chi tiết hợp đồng | contract detail | P0 | G05/FR-13, FR-29 |
| M-R12 | Bàn giao/termination | contract subflow | P1 | G05 |
| M-R13 | Danh sách hóa đơn | tab Thanh toán | P0 | G07/FR-18–20 |
| M-R14 | Chi tiết hóa đơn + QR/manual confirmation | invoice detail | P0 | G07–G08/FR-21–22 |
| M-R15 | Danh sách ticket | tab Hỗ trợ | P0 | G09/FR-23 |
| M-R16 | Tạo ticket | ticket composer | P0 | G09 |
| M-R17 | Ticket detail/thread | ticket detail | P0 | G09 |
| M-R18 | Notification center | app bar/account | P0 | G10/FR-24 |
| M-R19 | Hồ sơ tài khoản/renter | tab Tài khoản | P0 | G01, G05 |
| M-R20 | Review của tôi/tạo review | account subflow | P1 | G12 |
| M-R21 | Report của tôi/gửi report | account subflow | P1 | G12 |
| M-R22 | Push deep-link/error/offline state | cross-cutting | P0 | G10/NFR-05 |

## 9. Mobile — Staff rút gọn

Đây là `P1`, trừ khi đề tài yêu cầu app cho cả nhân viên. Có thể dùng một app role-aware hoặc app riêng, nhưng nên dùng chung component/domain model.

| ID | Màn hình | Actor | Ưu tiên | Nội dung |
|---|---|---|---|---|
| M-S01 | Dashboard nhanh | LANDLORD, MANAGER, ACCOUNTANT | P1 | KPI và việc cần xử lý |
| M-S02 | Chọn tenant | Tenant staff | P1 | Đổi context an toàn |
| M-S03 | Danh sách/chi tiết phòng | LANDLORD, MANAGER | P1 | Trạng thái, publish quick action |
| M-S04 | Request/appointment inbox | LANDLORD, MANAGER | P1 | Approve/reject/reschedule |
| M-S05 | Nhập chỉ số/OCR camera | LANDLORD, MANAGER, ACCOUNTANT | P1 | Field workflow tại hiện trường |
| M-S06 | Invoice/payment review | LANDLORD, MANAGER, ACCOUNTANT | P1 | Duyệt payment, xem evidence |
| M-S07 | Ticket queue | LANDLORD, MANAGER, MAINTENANCE_STAFF | P1 | Assigned/unassigned theo quyền |
| M-S08 | Ticket detail & update | Nhóm trên | P1 | Comment, ảnh, status, assignment |
| M-S09 | Notification center | Staff | P1 | Push/deep link |
| M-S10 | Profile/logout | Staff | P1 | Profile, session |

## 10. Các màn hình chưa nên xây như tính năng hoàn chỉnh

| Màn hình | Lý do | Khi nào đưa vào |
|---|---|---|
| Audit log explorer | `AuditLog` chưa có API quản trị thống nhất | Sau khi có writer/query/policy |
| System settings | `SystemSetting` chưa có CRUD/cache contract | Sau khi có API |
| Contract template/file/e-signature | Backend chưa hoàn chỉnh | Sau khi chốt legal/signature flow |
| Invoice batch/recurring billing | Orchestration/scheduler chưa hoàn chỉnh | Sau khi có preview/run/retry API |
| Realtime chat/conversation | G09 mới có ticket comment; chat riêng backlog | Sau khi có conversation/message API |
| Reputation aggregate dashboard | Chưa có công thức đa nguồn chính thức | Sau khi product khóa policy |
| Export CSV/XLSX/PDF/scheduled report | G11 chưa có export | Sau khi có job/file API |
| Renter meter reading | Self-service API chưa có | Sau khi backend scope theo contract |
| Renter payment history độc lập | `/payments/me` được tài liệu G08 ghi là còn thiếu | Sau khi có list/detail API |
| Favorites/recently viewed/map radius | Schema/backlog chưa đủ API | Sau khi G04 hoàn thiện |
| Staff/team management | G02 ghi còn backlog | Sau khi có invitation/membership API đầy đủ |

Có thể dựng placeholder “Sắp ra mắt” cho demo, nhưng không để CTA gọi API giả hoặc hiển thị dữ liệu hard-code như chức năng thật.

## 11. Traceability G01–G12 → nhóm màn hình

| Nhóm | Màn hình chính |
|---|---|
| G01 | Auth, profile, role/permission, tenant switch/session states |
| G02 | Admin landlords/tenants/plans; landlord subscription |
| G03 | Property, floor, room, images, amenities, marketplace state |
| G04 | Public marketplace, request, appointment, moderation |
| G05 | Renter profile, contract, asset, handover, termination |
| G06 | Meter, reading, OCR, service catalog/assignment |
| G07 | Invoice, debt |
| G08 | QR/manual confirmation, staff payment review, subscription checkout |
| G09 | Ticket, comment, attachment, assignment/status |
| G10 | Notification, unread state, push/deep link |
| G11 | Tenant dashboard, platform dashboard |
| G12 | Review/report self-service và moderation |

## 12. Thứ tự triển khai FE đề xuất

### Sprint 1 — Foundation và auth

- Design tokens, primitives, app shell, API client, auth/refresh, route guard, tenant context, error contract.
- W-A01–W-A07.

### Sprint 2 — Marketplace và renter acquisition

- W-P01–W-P05, W-R02–W-R06.
- Mobile M-R05–M-R10.

### Sprint 3 — Supply và contract

- W-O04–W-O23.
- Renter W-R07–W-R10, mobile M-R11–M-R12.

### Sprint 4 — Utility, invoice và payment

- W-O31–W-O47.
- Renter W-R11–W-R12, mobile M-R13–M-R14.

### Sprint 5 — Ticket, notification và dashboards

- W-O01–W-O03, W-O48–W-O51, W-R13–W-R16.
- Mobile M-R15–M-R18.

### Sprint 6 — Admin và trust

- W-D01–W-D15, W-R17–W-R18, mobile M-R20–M-R21.

### Sprint 7 — P1 operations

- Asset/handover/termination polish, OCR, subscription billing, staff mobile.

## 13. Hành trình E2E tối thiểu cần nghiệm thu

1. Landlord tạo property/phòng, ảnh/tiện ích và gửi tin duyệt.
2. Admin duyệt tin; khách tìm và xem phòng public.
3. Renter đăng nhập, đặt lịch hoặc gửi yêu cầu thuê.
4. Landlord xử lý lead, tạo/kích hoạt hợp đồng.
5. Staff nhập meter/service, tạo và phát hành invoice.
6. Renter xem invoice, tạo QR hoặc gửi confirmation.
7. Accountant duyệt payment; invoice/debt đổi đúng trạng thái.
8. Renter tạo ticket; maintenance được phân công và xử lý.
9. Notification xuất hiện qua REST và realtime/push; dashboard phản ánh dữ liệu mới.
10. Tenant A không xem được dữ liệu tenant B; renter không thấy internal comment/PII staff.

## 14. Nguồn tài liệu

- `Tai_lieu_yeu_cau_chuc_nang_MVP.md`
- `tai_lieu_phan_tich_nghiep_vu_he_thong.md`
- `Mo_ta_kien_truc_he_thong_MVP.md`
- `Bao_cao_danh_gia_tien_do_va_an_toan.md`
- `SEC_M01_M05_trien_khai.md`
- `G01_xac_thuc_tai_khoan_phan_quyen.md` đến `G12_danh_gia_uy_tin_bao_cao_vi_pham.md`
