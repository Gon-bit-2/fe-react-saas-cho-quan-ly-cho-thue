# Danh sách Frontend URLs (Routes)

Tài liệu này tổng hợp toàn bộ các đường dẫn (URLs) hiện tại trên Frontend (dựa vào cấu hình của hệ thống Router), được phân loại theo nhóm Role và tính năng để hỗ trợ quá trình kiểm thử (testing).

## 1. Nhóm Public (Không yêu cầu đăng nhập)

_Các trang dành cho khách vãng lai và truy cập cộng đồng._

- `/` - **Trang chủ**: Giới thiệu và tìm kiếm phòng trọ (Marketplace).
- `/phong` - **Danh sách phòng**: Xem danh sách phòng đang cho thuê.
- `/phong/:roomId` - **Chi tiết phòng**: Xem thông tin chi tiết một phòng trọ cụ thể.
- `/gioi-thieu` - **Giới thiệu**: Thông tin về nền tảng.
- `/help` - **Trung tâm trợ giúp**: Hỗ trợ khách hàng.
- `/terms` - **Điều khoản sử dụng**: Chính sách điều khoản.
- `/privacy` - **Chính sách bảo mật**: Quy định bảo vệ dữ liệu.

## 2. Nhóm Xác thực (Guest - Chỉ khi chưa đăng nhập)

_Các trang phục vụ quá trình đăng nhập, đăng ký._

- `/dang-nhap` - **Đăng nhập**: Đăng nhập bằng email/mật khẩu.
- `/dang-nhap/otp` - **Đăng nhập OTP**: Đăng nhập qua mã OTP.
- `/dang-ky` - **Đăng ký**: Đăng ký tài khoản mới.
- `/quen-mat-khau` - **Quên mật khẩu**: Yêu cầu cấp lại mật khẩu.
- `/dat-lai-mat-khau` - **Đặt lại mật khẩu**: Nhập mật khẩu mới sau khi xác thực.
- `/auth/google/callback` - **Xử lý Google OAuth**: Callback sau khi đăng nhập bằng tài khoản Google.

## 3. Nhóm Authenticated (Yêu cầu đăng nhập, Mọi Role)

_Dành cho bất kỳ user nào đã đăng nhập vào hệ thống._

- `/tai-khoan` - **Hồ sơ cá nhân**: Quản lý thông tin tài khoản người dùng (Profile).
- `/tai-khoan/chon-nha-tro` - **Chọn Tenant**: Lựa chọn khu trọ/hệ thống để làm việc (Dành cho user thuộc nhiều tenant/hệ thống quản lý).

## 4. Nhóm Quản lý (Chủ trọ / Nhân viên)

_Yêu cầu đăng nhập và có ngữ cảnh thuộc về một hệ thống trọ (TenantContext)._

> **Quy ước route**: Các URL quản lý chạy trực tiếp dưới domain gốc (ví dụ: `/tong-quan`) và không sử dụng namespace `/app`.

**Dashboard & Báo cáo**

- `/tong-quan` - **Tổng quan Dashboard**: Thống kê chung.
- `/trung-tam-xu-ly` - **Action Center**: Các đầu việc cần xử lý gấp (hóa đơn nợ, hợp đồng sắp hết hạn, ticket...).

**Quản lý Khu trọ & Phòng**

- `/khu-tro` - **Danh sách khu trọ**: Quản lý các cơ sở/tòa nhà của chủ trọ.
- `/khu-tro/tao-moi` - **Tạo khu trọ**: Thêm tòa nhà/khu trọ mới.
- `/khu-tro/:id` - **Chi tiết khu trọ**: Xem thông tin một tòa nhà.
- `/khu-tro/:id/chinh-sua` - **Sửa khu trọ**: Cập nhật thông tin tòa nhà.
- `/quan-ly-phong/danh-sach` - **Danh sách phòng**: Quản lý toàn bộ phòng trọ trong hệ thống.
- `/quan-ly-phong/tao-moi` - **Tạo phòng**: Thêm phòng mới.
- `/quan-ly-phong/:id/chi-tiet` - **Chi tiết phòng**: Xem thông tin chi tiết một phòng.
- `/quan-ly-phong/:id/chinh-sua` - **Sửa phòng**: Cập nhật thông tin phòng.

**Giao dịch & Người thuê**

- `/quan-ly-nha-tro/yeu-cau-thue` - **Yêu cầu thuê**: Quản lý các đơn đăng ký thuê phòng từ khách.
- `/quan-ly-nha-tro/yeu-cau-thue/:id` - **Chi tiết yêu cầu**: Duyệt/từ chối yêu cầu thuê phòng.
- `/quan-ly-nha-tro/lich-xem-phong` - **Lịch xem phòng**: Quản lý lịch hẹn xem phòng của khách.
- `/quan-ly-nha-tro/lich-xem-phong/:id` - **Chi tiết lịch hẹn**: Cập nhật trạng thái và phản hồi lịch hẹn.
- `/nguoi-thue` - **Danh sách người thuê**: Quản lý toàn bộ khách thuê đang ở.
- `/nguoi-thue/:id` - **Chi tiết người thuê**: Xem thông tin cá nhân khách thuê.
- `/nguoi-thue/loi-moi/tao` - **Tạo lời mời**: Mời khách thuê tham gia ứng dụng bằng email.
- `/nguoi-thue/loi-moi/:id` - **Chi tiết lời mời**: Theo dõi trạng thái lời mời (Pending, Accepted...).

**Hợp đồng & Tài sản**

- `/hop-dong` - **Danh sách hợp đồng**: Quản lý toàn bộ hợp đồng thuê nhà.
- `/hop-dong/tao` - **Tạo hợp đồng**: Lập hợp đồng mới.
- `/hop-dong/:id/sua` - **Sửa hợp đồng**: Chỉnh sửa hợp đồng nháp hoặc đang chờ duyệt.
- `/hop-dong/:id` - **Chi tiết hợp đồng**: Xem chi tiết điều khoản hợp đồng.
- `/hop-dong/:id/thanh-vien` - **Thành viên hợp đồng**: Quản lý danh sách người ở chung trong 1 hợp đồng.
- `/yeu-cau-ket-thuc-hop-dong` - **Yêu cầu kết thúc**: Quản lý các yêu cầu thanh lý hợp đồng.
- `/quan-ly-tai-san` - **Danh sách tài sản**: Quản lý thiết bị/tài sản có trong khu trọ.
- `/quan-ly-tai-san/phong/:roomId` - **Tài sản phòng**: Quản lý tài sản bên trong 1 phòng cụ thể.
- `/ban-giao/:id` - **Chi tiết bàn giao**: Biên bản bàn giao tài sản.
- `/ban-giao/:id/tranh-chap` - **Tranh chấp bàn giao**: Xử lý các đền bù/hư hỏng khi nhận trả phòng.

**Dịch vụ & Tài chính**

- `/dich-vu` - **Danh sách dịch vụ**: Quản lý danh mục biểu phí dịch vụ (điện, nước, rác, wifi...).
- `/dich-vu/tao-moi` - **Tạo dịch vụ**: Định nghĩa dịch vụ mới.
- `/dich-vu/:id/chinh-sua` - **Sửa dịch vụ**: Đổi giá, cách tính tiền dịch vụ.
- `/dich-vu-da-gan` - **Dịch vụ đã gán**: Quản lý cấu hình dịch vụ trên từng phòng.
- `/dich-vu-da-gan/tao-moi` - **Gán dịch vụ**: Gắn dịch vụ vào một/nhiều phòng.
- `/hoa-don` - **Danh sách hóa đơn**: Quản lý hóa đơn thu tiền hàng tháng.
- `/hoa-don/tao-moi` - **Tạo hóa đơn**: Chốt số điện/nước và tạo hóa đơn.
- `/hoa-don/cong-no` - **Thống kê công nợ**: Theo dõi hóa đơn nợ xấu/chưa thanh toán.
- `/hoa-don/:id` - **Chi tiết hóa đơn**: Xem và gửi hóa đơn cho khách.
- `/hoa-don/:id/chinh-sua` - **Sửa hóa đơn**: Sửa hóa đơn đang ở trạng thái nháp.
- `/thanh-toan` - **Lịch sử thanh toán**: Lịch sử tracking dòng tiền.
- `/thanh-toan/:id` - **Chi tiết thanh toán**: Thông tin 1 giao dịch cụ thể.
- `/thanh-toan/:id/duyet` - **Duyệt thanh toán**: Xác nhận tiền đã vào tài khoản.

**Hỗ trợ & Quản lý Tenant**

- `/ho-tro` - **Danh sách Ticket**: Các yêu cầu hỗ trợ/sửa chữa từ khách thuê.
- `/ho-tro/:id` - **Chi tiết Ticket**: Xử lý sự cố kỹ thuật.
- `/thong-bao` - **Trung tâm thông báo**: Đăng tải thông báo chung tới các phòng.
- `/goi-dich-vu` - **Gói dịch vụ hiện tại**: Thông tin gói SaaS phần mềm đang dùng.
- `/goi-dich-vu/so-sanh` - **So sánh gói**: Bảng giá nâng cấp hệ thống.
- `/goi-dich-vu/thanh-toan` - **Thanh toán gói**: Mua/Gia hạn phần mềm.
- `/goi-dich-vu/lich-su-thanh-toan` - **Lịch sử mua gói**: Hóa đơn mua phần mềm.

## 5. Nhóm Quản trị viên hệ thống (Admin Platform)

_Yêu cầu đăng nhập và có Role `ADMIN`. Tất cả các route này được gom dưới prefix `/admin`._

**Quản lý Users**

- `/admin` - **Dashboard Admin**: Báo cáo tổng quan của hệ thống nền tảng.
- `/admin/chu-tro` - **Quản lý chủ trọ**: Danh sách toàn bộ Chủ Trọ (Landlords) trên hệ thống.
- `/admin/chu-tro/:id` - **Chi tiết chủ trọ**: Thông tin và cấu hình tài khoản chủ trọ.
- `/admin/nguoi-thue` - **Quản lý người thuê**: Danh sách khách thuê trên toàn nền tảng.
- `/admin/nguoi-thue/:id` - **Chi tiết người thuê**: Thông tin khách thuê.

**Quản trị SaaS & Tiện ích Master Data**

- `/admin/goi-dich-vu` - **Quản lý gói dịch vụ**: Định nghĩa các gói SaaS cho chủ trọ đăng ký.
- `/admin/goi-dich-vu/tao-moi` - **Tạo gói SaaS**: Lên bảng giá mới.
- `/admin/goi-dich-vu/:id/chinh-sua` - **Sửa gói SaaS**: Điều chỉnh quyền lợi/giá gói.
- `/admin/thanh-toan-goi` - **Lịch sử thanh toán SaaS**: Doanh thu ứng dụng thu về từ các chủ trọ.
- `/admin/tien-ich` - **Quản lý tiện ích**: Master data về các tiện ích phòng/tòa nhà.
- `/admin/tien-ich/tao-moi` - **Tạo tiện ích**: Bổ sung danh mục tiện ích.
- `/admin/tien-ich/:id/chinh-sua` - **Sửa tiện ích**: Cập nhật danh mục.

**Hệ thống Kiểm duyệt (Moderation)**

- `/admin/kiem-duyet/hang-cho` - **Hàng chờ kiểm duyệt**: Chờ duyệt bài đăng Marketplace.
- `/admin/kiem-duyet/chi-tiet/:id` - **Chi tiết kiểm duyệt**: Phê duyệt hoặc từ chối phòng/khu trọ được đưa lên Marketplace.
- `/admin/kiem-duyet/lich-su` - **Lịch sử kiểm duyệt**: Theo dõi log thao tác kiểm duyệt.
- `/admin/kiem-duyet-danh-gia` - **Kiểm duyệt đánh giá**: Quản lý review của user (ẩn các đánh giá xấu/spam).
- `/admin/kiem-duyet-danh-gia/:id` - **Chi tiết đánh giá**: Phân tích nội dung review.
- `/admin/bao-cao-vi-pham` - **Báo cáo vi phạm**: Xử lý báo cáo (report) từ cộng đồng.
- `/admin/bao-cao-vi-pham/:id` - **Chi tiết vi phạm**: Đưa ra quyết định xử phạt (khóa bài, cảnh cáo...).

## 6. Các trang Lỗi (Error Pages)

- `/loi-truy-cap` - **403 Forbidden**: Hiện khi truy cập vào trang không đủ quyền hạn.
- `/phien-het-han` - **Session Expired**: Yêu cầu đăng nhập lại do hết hạn Token.
- `*` - **404 Not Found**: Hiển thị khi người dùng nhập sai đường dẫn không có trong hệ thống.
