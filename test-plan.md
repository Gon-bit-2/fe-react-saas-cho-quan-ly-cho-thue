# Kế Hoạch Kiểm Thử Toàn Diện (System Test Plan)

Tài liệu này tổng hợp toàn bộ các URL, phân chia theo các luồng (flow) nghiệp vụ, hướng dẫn chi tiết cách kiểm thử từng bước (step-by-step) và ghi chú các chức năng có thể thiếu API hoặc chưa hoàn thiện trong dự án.

## Tài khoản test:

- admin: gonjswork@gmail.com - gonjs0710
- nguoithue1@gmail.com - TestPassword123!
- test1@gmail.com - TestPassword123!

## 1. Tổng Hợp Các URL (All Routes)

### 1.1. Public & Marketplace (Dành cho mọi người dùng)

- `/` - Trang chủ (Marketplace)
- `/phong` - Danh sách phòng trọ
- `/phong/:roomId` - Chi tiết phòng trọ
- `/gioi-thieu` - Trang giới thiệu
- `/help` - Trung tâm trợ giúp
- `/terms` - Điều khoản sử dụng
- `/privacy` - Chính sách bảo mật

### 1.2. Xác Thực & Người Dùng Khách (Guest / Auth)

- `/dang-nhap` - Đăng nhập
- `/dang-nhap/otp` - Đăng nhập bằng mã OTP
- `/dang-ky` - Đăng ký tài khoản
- `/quen-mat-khau` - Quên mật khẩu
- `/dat-lai-mat-khau` - Đặt lại mật khẩu mới
- `/auth/google/callback` - Callback xác thực Google

### 1.3. Tài Khoản & Định Tuyến (Authenticated)

- `/tai-khoan` - Hồ sơ cá nhân
- `/tai-khoan/chon-nha-tro` - Chọn/Đăng nhập vào một nhà trọ cụ thể (Tenant Selection)

### 1.4. Nghiệp Vụ Chủ Trọ / Quản Lý (Tenant Operations)

- `/tong-quan` - Dashboard tổng quan
- `/trung-tam-xu-ly` - Trung tâm xử lý các tác vụ cần chú ý
- `/khu-tro` - Quản lý danh sách khu trọ
- `/khu-tro/tao-moi` - Tạo khu trọ mới
- `/khu-tro/:id` - Chi tiết khu trọ
- `/khu-tro/:id/chinh-sua` - Chỉnh sửa khu trọ
- `/quan-ly-phong/danh-sach` - Quản lý danh sách phòng
- `/quan-ly-phong/tao-moi` - Tạo phòng mới
- `/quan-ly-phong/:id/chi-tiet` - Chi tiết phòng
- `/quan-ly-phong/:id/chinh-sua` - Chỉnh sửa phòng
- `/quan-ly-nha-tro/yeu-cau-thue` - Danh sách yêu cầu thuê phòng
- `/quan-ly-nha-tro/yeu-cau-thue/:id` - Chi tiết yêu cầu thuê phòng
- `/quan-ly-nha-tro/lich-xem-phong` - Lịch xem phòng
- `/quan-ly-nha-tro/lich-xem-phong/:id` - Chi tiết lịch xem phòng
- `/nguoi-thue` - Danh sách người thuê hiện tại
- `/nguoi-thue/:id` - Chi tiết người thuê
- `/nguoi-thue/loi-moi/tao` - Tạo lời mời người thuê mới (Mời vào phòng)
- `/nguoi-thue/loi-moi/:id` - Chi tiết lời mời
- `/hop-dong` - Danh sách hợp đồng
- `/hop-dong/tao` - Tạo hợp đồng mới
- `/hop-dong/:id` - Chi tiết hợp đồng
- `/hop-dong/:id/sua` - Chỉnh sửa hợp đồng
- `/hop-dong/:id/thanh-vien` - Quản lý thành viên trong hợp đồng
- `/yeu-cau-ket-thuc-hop-dong` - Danh sách yêu cầu kết thúc hợp đồng
- `/quan-ly-tai-san` - Quản lý tài sản (tổng)
- `/quan-ly-tai-san/phong/:roomId` - Quản lý tài sản trong phòng cụ thể
- `/ban-giao/:id` - Biên bản bàn giao phòng/tài sản
- `/ban-giao/:id/tranh-chap` - Xử lý tranh chấp bàn giao
- `/dich-vu` - Danh sách dịch vụ hệ thống cung cấp
- `/dich-vu/tao-moi` - Tạo dịch vụ
- `/dich-vu/:id/chinh-sua` - Sửa dịch vụ
- `/dich-vu-da-gan` - Dịch vụ đã gán vào các phòng
- `/dich-vu-da-gan/tao-moi` - Gán dịch vụ cho phòng
- `/hoa-don` - Danh sách hóa đơn (tiền nhà, dịch vụ...)
- `/hoa-don/tao-moi` - Lập hóa đơn mới
- `/hoa-don/cong-no` - Quản lý công nợ
- `/hoa-don/:id` - Chi tiết hóa đơn
- `/hoa-don/:id/chinh-sua` - Sửa hóa đơn
- `/thanh-toan` - Lịch sử / Danh sách thanh toán
- `/thanh-toan/:id` - Chi tiết một giao dịch thanh toán
- `/thanh-toan/:id/duyet` - Duyệt giao dịch thanh toán (VD: chuyển khoản thủ công)
- `/ho-tro` - Danh sách ticket hỗ trợ (từ người thuê tới chủ trọ)
- `/ho-tro/:id` - Chi tiết ticket
- `/thong-bao` - Trung tâm thông báo
- `/goi-dich-vu` - Gói dịch vụ phần mềm đang dùng
- `/goi-dich-vu/so-sanh` - Bảng giá các gói phần mềm
- `/goi-dich-vu/thanh-toan` - Thanh toán gia hạn/nâng cấp gói
- `/goi-dich-vu/lich-su-thanh-toan` - Lịch sử mua gói phần mềm

### 1.5. Platform Admin (Quản trị hệ thống SaaS)

- `/admin` - Dashboard quản trị toàn bộ hệ thống
- `/admin/chu-tro`, `/admin/chu-tro/:id` - Quản lý tài khoản chủ trọ
- `/admin/nguoi-thue`, `/admin/nguoi-thue/:id` - Quản lý người thuê
- `/admin/goi-dich-vu`... - Quản lý (CRUD) các gói dịch vụ bán cho chủ trọ
- `/admin/thanh-toan-goi` - Kiểm soát doanh thu / giao dịch từ chủ trọ
- `/admin/tien-ich`... - Quản lý các master data tiện ích hệ thống
- `/admin/kiem-duyet/hang-cho`, `/admin/kiem-duyet/chi-tiet/:id`, `/admin/kiem-duyet/lich-su` - Kiểm duyệt phòng trọ đăng lên Marketplace
- `/admin/kiem-duyet-danh-gia`... - Kiểm duyệt review/đánh giá
- `/admin/bao-cao-vi-pham`... - Quản lý báo cáo vi phạm

### 1.6. Error Pages

- `/loi-truy-cap` (403), `/phien-het-han` (401), `*` (404)

---

## 2. Hướng Dẫn Kiểm Thử (Test Cases) Theo Từng Flow

### Flow 1: Xác Thực (Đăng ký, Đăng nhập, Quên mật khẩu)

**Các URL liên quan:** `/dang-ky` -> `/dang-nhap` -> `/auth/google/callback` -> `/quen-mat-khau` -> `/dat-lai-mat-khau`

- **Step 1:** Mở `/dang-ky`. Nhập đầy đủ thông tin hợp lệ -> Đảm bảo tài khoản được tạo thành công và chuyển hướng (redirect) đúng trang. (Kiểm tra validation form).
- **Step 2:** Mở `/dang-nhap`. Đăng nhập bằng tài khoản vừa tạo. Test đăng nhập sai mật khẩu xem có báo lỗi không.
- **Step 3:** Test chức năng Đăng nhập qua Google (Click -> chuyển qua `/auth/google/callback` -> đăng nhập thành công).
- **Step 4:** Mở `/quen-mat-khau`. Nhập email/SĐT -> Nhận link/mã -> Trải nghiệm flow `/dat-lai-mat-khau`.
- **Step 5:** Sau khi đăng nhập thành công, điều hướng về `/tai-khoan`. Click Đăng xuất -> Quay lại trang chủ `/` và clear thông tin phiên đăng nhập.

### Flow 2: Đăng Ký Làm Chủ Trọ & Chọn Tenant

**Các URL liên quan:** `/tai-khoan` -> `/tai-khoan/chon-nha-tro` -> `/tong-quan`

- **Step 1:** Truy cập `/tai-khoan/chon-nha-tro` bằng tài khoản user bình thường.
- **Step 2:** Kiểm tra UI tạo nhà trọ mới (Onboarding/Create Tenant). Điền thông tin nhà trọ.
- **Step 3:** Lưu thành công -> Chuyển hướng vào trang quản lý nhà trọ gốc: `/tong-quan`.
- **Step 4:** Cấp quyền admin tenant -> Đảm bảo sidebar hiển thị đúng các menu của chủ trọ.

### Flow 3: Khởi Tạo Khu Trọ & Phòng Trọ (Tạo dữ liệu cơ sở)

**Các URL liên quan:** `/khu-tro` -> `/khu-tro/tao-moi` -> `/quan-ly-phong/tao-moi`

- **Step 1:** Vào `/khu-tro/tao-moi`. Điền tên khu trọ, địa chỉ, mô tả, ảnh, tiện ích.
- **Step 2:** Vào `/khu-tro` để kiểm tra khu trọ vừa tạo đã xuất hiện trong danh sách.
- **Step 3:** Vào `/quan-ly-phong/tao-moi`. Chọn khu trọ vừa tạo. Nhập thông tin phòng (số phòng, giá tiền, diện tích).
- **Step 4:** Kiểm tra danh sách phòng `/quan-ly-phong/danh-sach`.

### Flow 4: Đăng Tin Marketplace & Kiểm Duyệt Admin (SaaS Admin)

**Các URL liên quan:** Chủ trọ đăng -> `/admin/kiem-duyet/hang-cho` -> Marketplace `/phong`

- **Step 1:** (Chủ trọ) Yêu cầu đăng/public phòng trọ lên marketplace (từ chi tiết phòng).
- **Step 2:** Đăng nhập bằng tài khoản ADMIN hệ thống, vào `/admin/kiem-duyet/hang-cho`.
- **Step 3:** Xem chi tiết (`/admin/kiem-duyet/chi-tiet/:id`) và click Duyệt/Từ chối.
- **Step 4:** Trở lại tư cách khách, vào Marketplace `/phong`. Tìm kiếm phòng vừa được duyệt. Vào `/phong/:roomId` xem chi tiết thông tin, hình ảnh có đúng không.

### Flow 5: Người Thuê Tìm Phòng & Gửi Yêu Cầu Thuê

**Các URL liên quan:** Marketplace `/phong/:roomId` -> Dashboard Chủ Trọ `/quan-ly-nha-tro/yeu-cau-thue` -> `/quan-ly-nha-tro/lich-xem-phong`

- **Step 1:** Ở trang `/phong/:roomId`, user bấm "Gửi yêu cầu thuê" hoặc "Đặt lịch xem phòng".
- **Step 2:** Đăng nhập bằng chủ trọ, kiểm tra `/quan-ly-nha-tro/yeu-cau-thue` và `/quan-ly-nha-tro/lich-xem-phong`.
- **Step 3:** Chủ trọ chấp nhận yêu cầu và xếp lịch xem.

### Flow 6: Quản Lý Hợp Đồng & Người Thuê (Onboarding Renter)

**Các URL liên quan:** `/nguoi-thue/loi-moi/tao` -> `/hop-dong/tao` -> `/hop-dong/:id/thanh-vien`

- **Step 1:** Tạo lời mời (Invite) tại `/nguoi-thue/loi-moi/tao`. Nhập email/sđt người thuê để gán họ vào phòng.
- **Step 2:** Tạo hợp đồng thuê `/hop-dong/tao` cho người thuê đó và phòng tương ứng. Cài đặt các thông số (tiền cọc, chu kỳ thanh toán).
- **Step 3:** Kiểm tra `/nguoi-thue` đã ghi nhận người thuê mới này.
- **Step 4:** (Phần mở rộng) Test bàn giao tài sản khi bắt đầu ở: `/quan-ly-tai-san` và `/ban-giao/:id`.

### Flow 7: Quản Lý Dịch Vụ, Lập Hóa Đơn & Thanh Toán

**Các URL liên quan:** `/dich-vu/tao-moi` -> `/dich-vu-da-gan/tao-moi` -> `/hoa-don/tao-moi` -> `/thanh-toan/:id/duyet`

- **Step 1:** Vào `/dich-vu/tao-moi` tạo (Điện, Nước, Rác, Wifi).
- **Step 2:** Gán dịch vụ cho phòng: `/dich-vu-da-gan/tao-moi`.
- **Step 3:** Tới kỳ thanh toán, vào `/hoa-don/tao-moi` lập hóa đơn. Nhập chỉ số điện nước (nếu có). Lưu.
- **Step 4:** Kiểm tra `/hoa-don/cong-no` xem công nợ đã được cộng lên chưa.
- **Step 5:** Giả lập người thuê thanh toán (hoặc chủ trọ tự ghi nhận thanh toán), vào `/thanh-toan` và Duyệt `/thanh-toan/:id/duyet`.
- **Step 6:** Kiểm tra lại hóa đơn chuyển trạng thái "Đã thanh toán" và công nợ giảm.

### Flow 8: Hỗ Trợ & Yêu Cầu Trả Phòng (Kết thúc hợp đồng)

**Các URL liên quan:** `/ho-tro` -> `/yeu-cau-ket-thuc-hop-dong` -> `/ban-giao/:id`

- **Step 1:** (Người thuê) Gửi ticket báo hỏng đèn. (Chủ trọ) Vào `/ho-tro` trả lời ticket.
- **Step 2:** (Người thuê/Chủ trọ) Tạo yêu cầu kết thúc hợp đồng trước hạn hoặc đúng hạn.
- **Step 3:** Chủ trọ duyệt `/yeu-cau-ket-thuc-hop-dong`.
- **Step 4:** Lập biên bản bàn giao thu hồi tài sản `/ban-giao/:id`. Xử lý tranh chấp hoặc hoàn cọc.

---

## 3. Ghi Chú: Các Vấn Đề Thường Gặp Cần Kiểm Tra (Missing APIs / Implementation Check)

Trong quá trình test, QA/Dev cần lưu ý check console log / network tab để phát hiện các module "chưa triển khai API thực tế" (mock data) hoặc "thiếu API":

- [ ] **Đăng nhập Google (`/auth/google/callback`)**: Cần đảm bảo Backend đã cấu hình Google OAuth2 đúng.
- [ ] **OTP (`/dang-nhap/otp`)**: Chức năng gửi mã OTP SMS/Email có thực sự hoạt động hay đang mock.
- [ ] **Upload Hình Ảnh**: Tạo phòng, tạo khu trọ, chứng minh nhân dân/CCCD của người thuê - cần test xem API upload có support multipart form data và lưu Storage (S3/Cloudinary) đúng không.
- [ ] **Notification / Realtime (`/thong-bao`)**: Kiểm tra Socket.IO hoặc Server-Sent Events (SSE) đã được tích hợp chưa? (Hay chỉ là call API pull tĩnh).
- [ ] **Export / Print PDF**: Tại luồng "Hợp đồng" (`/hop-dong/:id`) và "Hóa đơn" (`/hoa-don/:id`), tính năng xuất file PDF hoặc in thường hay bị thiếu API hoặc sai UI. Cần note lại để fix.
- [ ] **Thanh toán Online (Payment Gateways)**: Tại `/thanh-toan/:id/duyet` và `/goi-dich-vu/thanh-toan`, tích hợp VNPay/Momo/Stripe đã live chưa hay vẫn đang dùng test mode / chuyển khoản thủ công (Bank Transfer).
- [ ] **Kiểm Duyệt Marketplace (Admin)**: Đảm bảo luồng đổi trạng thái từ `PENDING` -> `APPROVED` thực sự hiển thị realtime lên trang chủ marketplace `/`.

_(Tài liệu này nên được chạy dọc (Run Through) kết hợp theo dõi Redux/Zustand State, Network (Fetch/XHR) để ghi nhận những API endpoint trả về 404 hoặc 500)_
