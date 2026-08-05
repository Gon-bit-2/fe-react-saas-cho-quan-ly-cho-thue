# Design System — Rental SaaS & Marketplace

**Version:** 1.0.0  
**Trạng thái:** Đề xuất cho giai đoạn triển khai Frontend MVP  
**Phạm vi:** Web public marketplace, web quản trị/vận hành SaaS, mobile renter và mobile staff rút gọn.

## 1. Cơ sở và ranh giới

Tài liệu nghiệp vụ xác định ba lớp sản phẩm:

1. Quản trị nền tảng SaaS cho `ADMIN`.
2. Vận hành tài sản cho thuê theo tenant cho `LANDLORD`, `MANAGER`, `ACCOUNTANT`, `MAINTENANCE_STAFF`.
3. Marketplace và self-service cho `RENTER`.

Backend hiện là nguồn API; frontend và mobile chưa có implementation. Các token, màu, typography, layout và pattern trong file này là **đề xuất thiết kế**, còn actor, nghiệp vụ, state transition và phạm vi màn hình được rút ra từ tài liệu G01–G12.

Không thiết kế thành tính năng hoạt động trong MVP đối với các phần backend còn backlog: contract e-signature đầy đủ, conversation/chat riêng, invoice batch/scheduler, audit/settings CRUD, export báo cáo, reputation đa nguồn và realtime dashboard.

## 2. Nguyên tắc thiết kế

### 2.1. Tenant context luôn rõ ràng

- Web vận hành phải hiển thị tenant hiện tại ở header/sidebar.
- Khi đổi tenant, xóa cache trang cũ và tải lại toàn bộ dữ liệu tenant-scoped.
- Không hiển thị tenant switcher cho `RENTER` hoặc `ADMIN` platform.
- Không cho phép user tự sửa `tenantId` trong form hoặc URL để truy cập chéo dữ liệu.

### 2.2. Status-first UI

Hầu hết miền nghiệp vụ là state machine. Trạng thái hiện tại phải xuất hiện gần tiêu đề, kèm hành động hợp lệ tiếp theo. Không hiển thị action bị backend cấm; action nhạy cảm cần confirm và giải thích side effect.

### 2.3. Tài chính phải chính xác và dễ kiểm tra

- Số tiền căn phải phân tách hàng nghìn: `1.250.000 ₫`.
- Không dùng số làm tròn cho ledger, invoice, debt và payment.
- Invoice detail phải tách rõ: tổng tiền, đã trả, còn nợ, hạn thanh toán, item breakdown.
- Payment approve/reject phải hiện reference, amount, evidence, provider và thời điểm.

### 2.4. Mobile-first cho renter

Các hành trình tìm phòng, lịch xem, yêu cầu thuê, hợp đồng, hóa đơn, QR, ticket và notification phải hoàn tất được trên màn hình 360–430 px mà không cần desktop.

### 2.5. Async/realtime không làm mất dữ liệu

REST là nguồn đồng bộ bền vững. Socket.IO và push chỉ giúp cập nhật nhanh. Khi reconnect hoặc mở app từ push, client phải gọi lại API detail/list tương ứng.

### 2.6. Không che giấu lỗi nghiệp vụ

Hiển thị lỗi theo `requestId`, mã lỗi và hành động khắc phục. Với `409`, giải thích rằng dữ liệu/trạng thái đã thay đổi và cung cấp nút tải lại. Với `429`, hiển thị thời gian thử lại nếu có `Retry-After`.

## 3. Kiến trúc giao diện

### 3.1. Public marketplace web

- Header: logo, tìm phòng, đăng nhập/đăng ký, notification/avatar khi đã đăng nhập.
- Trang kết quả: filter sidebar desktop, filter drawer mobile web.
- Room detail: gallery, summary sticky, giá, tiện ích, vị trí rút gọn, review, CTA đặt lịch/gửi yêu cầu.
- Public projection không hiển thị PII, field nội bộ hoặc địa chỉ chi tiết ngoài policy.

### 3.2. Tenant operations web

- Sidebar desktop rộng `272px`, có nhóm: Tổng quan, Nguồn cung, Khách thuê, Hợp đồng, Điện nước & dịch vụ, Tài chính, Sự cố, Thông báo, Gói dịch vụ.
- Topbar cao `64px`: breadcrumb, tenant switcher, notification, avatar.
- Content max-width `1440px`; trang bảng có thể full-width.
- Quyền menu và action dựa trên role/permission thực tế, không chỉ ẩn bằng CSS.

### 3.3. Platform admin web

- Sidebar riêng: Dashboard, Landlords, Tenants, Plans, Marketplace moderation, Subscription payments, Amenities, Reviews, Reports.
- Không dùng `x-tenant-id`.
- Các trang moderation ưu tiên queue, reason, history và action audit-friendly.

### 3.4. Renter mobile

Bottom navigation 5 mục:

1. **Khám phá** — marketplace.
2. **Thuê nhà** — request, appointment, contract, handover/termination.
3. **Thanh toán** — invoice và QR.
4. **Hỗ trợ** — ticket.
5. **Tài khoản** — profile, notification, review/report.

Notification icon có unread badge ở app bar. Deep link từ push phải mở đúng entity detail.

### 3.5. Staff mobile rút gọn

Bottom navigation role-aware:

- `LANDLORD/MANAGER`: Tổng quan, Phòng, Leads, Công việc, Tài khoản.
- `ACCOUNTANT`: Tổng quan, Chỉ số, Hóa đơn, Thanh toán, Tài khoản.
- `MAINTENANCE_STAFF`: Việc được giao, Ticket, Thông báo, Tài khoản.

Mobile staff không cần tái tạo toàn bộ bảng desktop. Chỉ ưu tiên quick action và công việc tại hiện trường.

## 4. Design tokens

File triển khai đi kèm: `design-tokens.css`.

### 4.1. Màu sắc

| Token       |   Giá trị | Dùng cho                                |
| ----------- | --------: | --------------------------------------- |
| Brand 600   | `#2563EB` | Primary CTA, link, focus                |
| Neutral 900 | `#0F172A` | Text chính                              |
| Neutral 600 | `#475569` | Text phụ                                |
| Neutral 200 | `#E2E8F0` | Border                                  |
| Success 600 | `#059669` | Hoàn tất, active, paid, approved        |
| Warning 600 | `#D97706` | Pending, due soon, need review          |
| Danger 600  | `#DC2626` | Rejected, overdue, destructive          |
| Info 600    | `#0891B2` | Processing, scheduled, informational    |
| Purple 600  | `#9333EA` | Moderation/trust đặc thù, dùng tiết chế |

Quy tắc:

- Không dùng màu là tín hiệu duy nhất; luôn có label hoặc icon.
- Status badge nền nhạt, chữ đậm; tránh badge nền màu đậm trên bảng dày dữ liệu.
- Primary blue dành cho hành động, không dùng để biểu thị “thành công”.

### 4.2. Typography

Font stack: `Inter, Noto Sans, Roboto, Segoe UI, Arial, sans-serif`.

| Style      | Size/line-height | Weight | Dùng cho             |
| ---------- | ---------------- | -----: | -------------------- |
| Display    | 36/43            |    700 | Hero marketplace     |
| H1         | 30/38            |    700 | Tiêu đề trang        |
| H2         | 24/32            |    600 | Section lớn          |
| H3         | 20/28            |    600 | Card/section         |
| Body       | 16/24            |    400 | Nội dung chính       |
| Body small | 14/20            |    400 | Table, metadata      |
| Caption    | 12/16            |    500 | Label phụ, timestamp |
| Micro      | 11/14            |    600 | Badge compact        |

Số tiền và số liệu dashboard nên dùng `font-variant-numeric: tabular-nums`.

### 4.3. Spacing, radius, elevation

- Base spacing: `4px`.
- Form field gap: `16px`; section gap: `24–32px`; page padding desktop: `24–32px`; mobile: `16px`.
- Radius mặc định: `8px`; card: `12px`; modal/drawer: `16px`; pill: full.
- Shadow chỉ dùng cho dropdown, drawer, modal và elevated card; table/card thường dùng border.

### 4.4. Breakpoints

| Tên    | Min-width | Hành vi                          |
| ------ | --------: | -------------------------------- |
| Mobile |         0 | Single column, bottom nav/drawer |
| sm     |     640px | Form 2 cột có điều kiện          |
| md     |     768px | Tablet layout, split detail      |
| lg     |    1024px | Sidebar xuất hiện                |
| xl     |    1280px | Data table đầy đủ                |
| 2xl    |    1536px | Content giới hạn max-width       |

## 5. Component library

### 5.1. Foundation components

- `Button`: primary, secondary, outline, ghost, danger; size sm/md/lg; loading state giữ nguyên chiều rộng.
- `IconButton`: tooltip bắt buộc trên web; accessible label bắt buộc.
- `TextField`, `TextArea`, `PasswordField`, `SearchField`, `MoneyField`, `NumberField`.
- `Select`, `Combobox`, `MultiSelect`, `DatePicker`, `DateTimePicker`, `MonthPicker`.
- `Checkbox`, `Radio`, `Switch`.
- `FileUpload`: preview, progress, retry, remove, lỗi loại file/kích thước.
- `OTPInput`: 6 ô, paste hỗ trợ, resend timer, không tự log code.
- `Avatar`, `Tooltip`, `Divider`, `Skeleton`, `Spinner`.

### 5.2. Navigation components

- `AppSidebar`, `AdminSidebar`, `MobileBottomNav`.
- `Topbar`, `TenantSwitcher`, `Breadcrumb`.
- `Tabs` cho detail nhiều miền; URL phải phản ánh tab trên web.
- `Pagination` trên web; infinite scroll/cursor chỉ dùng khi API hỗ trợ.

### 5.3. Data display

- `DataTable`: sort/filter chỉ hiển thị nếu backend hỗ trợ; column visibility; sticky action column; bulk action chỉ khi có API.
- `EntityHeader`: title, subtitle, status, primary actions.
- `DescriptionList`: detail metadata.
- `MetricCard`: value, delta/context, timestamp.
- `ChartCard`: loading/empty/error riêng; không dùng chart 3D.
- `Timeline`: history/state transition/activity.
- `StatusBadge`, `RoleBadge`, `PriorityBadge`.
- `Money`, `DateTime`, `RelativeTime`, `UserIdentity`, `TenantIdentity` formatter.

### 5.4. Feedback and overlays

- `Toast`: thành công nhẹ, không dùng thay confirm.
- `Alert`: inline warning/error/info.
- `ConfirmDialog`: destructive hoặc state terminal.
- `ActionDrawer`: mobile flow nhiều field hoặc quick edit.
- `Modal`: tác vụ ngắn, không dùng cho form dài hơn 6 field.
- `EmptyState`, `NoPermissionState`, `NotFoundState`, `ConflictState`, `RateLimitState`, `OfflineState`.

### 5.5. Domain components

- `RoomCard`, `RoomGallery`, `AmenityList`, `PriceSummary`.
- `RequestStatusStepper`, `AppointmentCard`, `AppointmentCalendar`.
- `ContractSummary`, `ContractMemberList`, `ContractTimeline`.
- `AssetChecklist`, `HandoverComparison`, `DisputePanel`, `TerminationStepper`.
- `MeterReadingInput`, `ConsumptionSummary`, `OcrReviewPanel`.
- `InvoiceBreakdown`, `DebtSummary`, `PaymentQrPanel`, `PaymentEvidenceViewer`.
- `TicketThread`, `InternalCommentComposer`, `AttachmentGallery`, `AssignmentControl`.
- `NotificationItem`, `UnreadBadge`.
- `ModerationQueue`, `ModerationDecisionPanel`, `ReportTargetSnapshot`.

## 6. Status system

Dùng semantic status thay vì gán màu riêng cho mọi enum.

| Nhóm              | Ví dụ                                                           | Semantic                          |
| ----------------- | --------------------------------------------------------------- | --------------------------------- |
| Draft/neutral     | DRAFT, INACTIVE, CANCELED                                       | neutral                           |
| Waiting           | PENDING, PENDING_REVIEW, NEED_MORE_INFO, UNPAID                 | warning                           |
| Processing        | PROCESSING, CONFIRMED appointment, ASSIGNED ticket              | info                              |
| Success           | ACTIVE, PUBLISHED, APPROVED, PAID, SUCCESS, RESOLVED, COMPLETED | success                           |
| Risk/error        | REJECTED, FAILED, OVERDUE, BANNED, SUSPENDED, DISPUTED, BROKEN  | danger                            |
| Archived/terminal | EXPIRED, CLOSED, TERMINATED, HIDDEN                             | neutral hoặc danger theo ngữ cảnh |

Mỗi state machine cần map tập trung tại `status-config`, gồm:

```ts
export type StatusVisual = {
  label: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  icon?: string;
  description?: string;
};
```

Không hard-code label/màu rải rác trong từng màn hình.

## 7. Form và validation

- Label luôn hiển thị; placeholder không thay thế label.
- Required dùng dấu `*` và mô tả lỗi cụ thể.
- Validate client theo DTO để phản hồi sớm, nhưng backend vẫn là nguồn sự thật.
- Form edit phải giữ dirty state; cảnh báo khi rời trang.
- Decimal/money gửi theo contract API; không dùng floating-point để cộng tiền ở client.
- Ngày giờ gửi ISO 8601. UI hiển thị timezone rõ ở lịch xem, handover, payment và dashboard date range.
- State transition form phải yêu cầu reason/note khi nghiệp vụ cần và hiển thị tác động trước khi submit.

## 8. Table và filter conventions

- Filter bar gồm search, status, domain filter, date range và nút reset.
- Query state được đồng bộ vào URL trên web để refresh/share được.
- Pagination mặc định 20; size option chỉ đưa ra giá trị API cho phép.
- Empty do chưa có dữ liệu khác với empty do filter.
- Không giả lập sort/filter client-side cho tập dữ liệu phân trang server-side.
- Mobile thay table bằng card list; mỗi card chỉ hiện 3–5 thông tin quyết định.

## 9. Error contract mapping

|    HTTP | UI pattern                                                                       |
| ------: | -------------------------------------------------------------------------------- |
|     400 | Inline lỗi field hoặc alert đầu form; hiện `requestId` trong “Chi tiết kỹ thuật” |
|     401 | Thử refresh token một lần; thất bại thì về login, giữ return URL                 |
|     403 | No permission/tenant inactive; không gợi ý resource tồn tại                      |
|     404 | Not found hoặc ngoài scope; CTA quay về list                                     |
|     409 | Conflict state, tải lại entity và cập nhật action hợp lệ                         |
|     429 | Disable submit, countdown theo `Retry-After`                                     |
| 500/503 | Error state có retry; không hiển thị stack/provider secret                       |

## 10. Realtime, push và cache

- Notification REST cache theo user, không chia sẻ giữa account.
- Khi nhận `notification.created`, prepend hoặc invalidate list và unread count.
- Khi nhận `ticket.updated`, invalidate ticket detail/list liên quan.
- Khi app resume/reconnect, sync unread count và entity đang mở.
- Optimistic update chỉ dùng cho mark-read; các transition tài chính/hợp đồng/ticket phải chờ server.

## 11. Accessibility

- Mục tiêu WCAG 2.1 AA.
- Contrast text thường tối thiểu 4.5:1.
- Focus ring rõ trên mọi interactive element.
- Touch target mobile tối thiểu 44×44 px.
- Modal/drawer trap focus và trả focus về trigger.
- Chart phải có summary/text/table thay thế.
- Upload ảnh, QR và evidence phải có accessible name/description.
- Hỗ trợ `prefers-reduced-motion`.

## 12. Content style

- Dùng tiếng Việt ngắn, trực tiếp: “Phát hành hóa đơn”, “Duyệt thanh toán”, “Yêu cầu bổ sung”.
- Nút destructive dùng động từ rõ: “Hủy hợp đồng”, không dùng “Đồng ý”.
- Thời gian: `03/08/2026, 22:30`; relative time chỉ là phụ trợ.
- Không dùng thuật ngữ backend như CAS, DTO, idempotency trong nội dung chính; đặt trong help/technical detail nếu cần.

## 13. Security UI checklist

- Access/refresh token không hiển thị trong UI/log analytics.
- Không lưu OTP, raw webhook, service account hoặc payment evidence nhạy cảm trong client log.
- Tenant switch phải xóa dữ liệu/query cache của tenant trước.
- Internal ticket comment chỉ render cho staff được phép.
- Moderation/report UI không lộ reporter/reviewer PII ngoài projection API.
- File upload kiểm tra MIME, dung lượng và preview an toàn; lỗi provider không làm mất form metadata.
- Destructive/financial action chặn double submit và dùng idempotency contract khi API hỗ trợ.

## 14. Definition of Done cho một màn hình

Một màn hình chỉ được coi là hoàn tất khi có:

1. Loading, success, empty, validation error, permission error, conflict, rate-limit và generic error.
2. Responsive tại 360, 768, 1024 và 1440 px.
3. Keyboard/focus/screen-reader label cơ bản.
4. Role/tenant guard ở route và action.
5. API state được invalidate/sync đúng sau mutation.
6. Không lộ PII hoặc field ngoài projection.
7. Test component cho status/action quan trọng và E2E cho hành trình P0.

## 15. Quy ước cấu trúc mã đề xuất

```text
src/
  app/                  # route/layout/provider
  design-system/
    tokens/
    primitives/
    components/
    patterns/
  features/
    auth/
    marketplace/
    tenants/
    properties/
    rooms/
    rental-requests/
    appointments/
    renters/
    contracts/
    handovers/
    utilities/
    invoices/
    payments/
    tickets/
    notifications/
    reviews/
    reports/
    dashboard/
  shared/
    api/
    auth/
    permissions/
    tenant/
    formatters/
    errors/
```

Design system không import trực tiếp feature hoặc API domain. Feature được phép compose primitive/component/pattern từ design system.

## 16. Tài liệu nguồn

- `Tai_lieu_yeu_cau_chuc_nang_MVP.md`
- `tai_lieu_phan_tich_nghiep_vu_he_thong.md`
- `Mo_ta_kien_truc_he_thong_MVP.md`
- `Bao_cao_danh_gia_tien_do_va_an_toan.md`
- `SEC_M01_M05_trien_khai.md`
- `G01_xac_thuc_tai_khoan_phan_quyen.md` đến `G12_danh_gia_uy_tin_bao_cao_vi_pham.md`
