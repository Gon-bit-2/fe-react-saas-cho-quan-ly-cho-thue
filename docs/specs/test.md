# Kế hoạch kiểm thử workflow bằng API thực tế

## 1. Mục tiêu và phương án

admin: gonjswork@gmail.com - gonjs0710
landlord: test1@gmail.com - TestPassword123!
Tenants: nguoithue1@gmail.com - TestPassword123!

- Dùng Playwright `APIRequestContext` để gọi trực tiếp backend tại `API_BASE_URL`, mặc định `http://localhost:1174`.
- Không sử dụng UI, mock frontend, Prisma hoặc thao tác trực tiếp database.
- Chạy trên DB dev hiện tại với ba tài khoản Admin, Landlord và Tenant đã cung cấp.
- Bỏ qua flow tự đăng ký chủ trọ vì endpoint yêu cầu OTP; bắt đầu từ đăng nhập các tài khoản hiện có.
- Không kiểm thử PayOS, QR payment hoặc subscription checkout; chỉ kiểm thử thanh toán hóa đơn thủ công.
- Chạy tuần tự với một worker và không retry để tránh tạo trùng dữ liệu trên DB dev.

## 2. Cấu trúc bộ kiểm thử

- Thêm cấu hình Playwright riêng cho API, không ảnh hưởng cấu hình UI hiện tại.
- Thêm các lệnh:
  - `test:api:smoke`: đăng nhập, phân quyền và kiểm tra môi trường.
  - `test:api:flows`: chạy toàn bộ chuỗi nghiệp vụ.
  - `test:api`: chạy smoke trước, sau đó chạy các flow.
- Đọc thông tin nhạy cảm từ file môi trường bị Git bỏ qua:
  - `E2E_API_BASE_URL`
  - `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`
  - `E2E_LANDLORD_EMAIL`, `E2E_LANDLORD_PASSWORD`
  - `E2E_TENANT_EMAIL`, `E2E_TENANT_PASSWORD`
- Không ghi mật khẩu, access token, refresh token hoặc header `Authorization` vào log/report; tắt trace có chứa request nhạy cảm.
- Xây dựng các fixture:
  - Đăng nhập, refresh token và đăng xuất.
  - Tự lấy tenant ID của Landlord và gắn `x-tenant-id`.
  - Client riêng cho Admin, Landlord và Tenant.
  - Sinh mã chạy duy nhất như `API-E2E-<timestamp>` cho mọi dữ liệu tạo mới.
  - Theo dõi ID và trạng thái tài nguyên trong `RunContext`.
- Không thay đổi API production hoặc DTO hiện có; chỉ bổ sung test client, cấu hình và script kiểm thử.

## 3. Các workflow cần kiểm thử

### Xác thực và phân quyền

- Kiểm tra API hoạt động trước khi tạo dữ liệu.
- Đăng nhập ba tài khoản, gọi profile và xác nhận đúng vai trò.
- Kiểm tra refresh token, logout và token không hợp lệ.
- Xác nhận:
  - Admin không cần tenant context.
  - Landlord truy cập được tenant hiện tại khi có `x-tenant-id`.
  - Tenant dùng renter context.
  - Tenant không gọi được API Landlord/Admin.
  - Landlord không gọi được API Admin.
  - Thiếu hoặc sai `x-tenant-id` bị từ chối.
- Dừng toàn bộ suite trước khi mutation nếu tài khoản sai vai trò, Landlord chưa có tenant active hoặc Tenant chưa có renter profile.

### Khu trọ, phòng và marketplace

- Landlord tạo khu nhà/phòng trọ, tầng và phòng bằng dữ liệu có mã chạy.
- Đọc danh sách/chi tiết, cập nhật thông tin và trạng thái.
- Gán tiện ích, thêm dữ liệu ảnh nếu API upload được cấu hình.
- Gửi phòng lên marketplace.
- Admin xem yêu cầu, duyệt hoặc từ chối và kiểm tra lịch sử kiểm duyệt.
- Tenant xem phòng trong public marketplace sau khi được duyệt.
- Kiểm tra các trường hợp phòng không tồn tại, dữ liệu sai và thao tác sai tenant.

### Lịch xem phòng và yêu cầu thuê

- Tenant đặt lịch xem phòng và gửi yêu cầu thuê.
- Tenant xem danh sách cá nhân và hủy một lịch/yêu cầu thử nghiệm riêng.
- Landlord xem yêu cầu và cập nhật lịch xem phòng.
- Landlord chấp nhận/từ chối các yêu cầu độc lập.
- Kiểm tra gửi trùng, phòng không còn khả dụng và cập nhật trạng thái không hợp lệ.

### Hợp đồng và kết thúc hợp đồng

- Landlord tạo hợp đồng cho Tenant/phòng thử nghiệm.
- Kiểm tra hợp đồng nháp, cập nhật và kích hoạt.
- Tenant xem hợp đồng qua API `me`.
- Kiểm tra không thể tạo hợp đồng trùng đang hiệu lực cho cùng phòng.
- Tạo các nhánh chấm dứt riêng:
  - Tenant gửi và hủy yêu cầu.
  - Tenant gửi, Landlord từ chối.
  - Tenant gửi, Landlord duyệt và hoàn tất.
- Kiểm tra quyền truy cập hợp đồng của người không thuộc hợp đồng.

### Quản lý tài sản

- Landlord tạo danh mục tài sản.
- Thêm tài sản vào phòng, đọc chi tiết và cập nhật số lượng/tình trạng.
- Kiểm tra ràng buộc phòng thuộc đúng tenant.
- Xóa hoặc ngừng sử dụng chỉ các tài sản do lần chạy hiện tại tạo.

### Bàn giao

- Landlord tạo biên bản bàn giao gắn với hợp đồng/phòng.
- Kiểm tra tài sản, chỉ số điện nước và ghi chú bàn giao.
- Nhánh thành công: Landlord xác nhận, Tenant xác nhận.
- Nhánh tranh chấp: Tenant báo tranh chấp, Landlord giải quyết.
- Kiểm tra xác nhận lặp và chuyển trạng thái sai thứ tự bị từ chối.

### Dịch vụ và chỉ số sử dụng

- Landlord tạo/cập nhật dịch vụ trong danh mục.
- Gán dịch vụ cho phòng hoặc hợp đồng.
- Kiểm tra thời gian hiệu lực, đơn giá, dữ liệu trùng và tenant isolation.
- Tạo đồng hồ/chỉ số điện nước nếu cần cho việc lập hóa đơn.
- Ngừng dịch vụ hoặc đưa dữ liệu thử nghiệm về trạng thái kết thúc.

### Hóa đơn và công nợ

- Landlord tạo hóa đơn nháp từ hợp đồng, dịch vụ và chỉ số sử dụng.
- Cập nhật hóa đơn trước khi phát hành.
- Phát hành hóa đơn và xác nhận Tenant xem được qua API `me`.
- Kiểm tra danh sách công nợ của Tenant và Landlord.
- Tạo hóa đơn phụ để kiểm tra hủy và đánh dấu quá hạn.
- Xác nhận hóa đơn đã phát hành không được sửa các trường bị khóa.

### Thanh toán thủ công

- Tenant gửi xác nhận thanh toán thủ công cho hóa đơn.
- Landlord xem giao dịch và duyệt thanh toán.
- Xác nhận số tiền đã trả, số dư và trạng thái hóa đơn được cập nhật.
- Tạo giao dịch riêng để kiểm tra Landlord từ chối.
- Kiểm tra thanh toán vượt số dư, gửi trùng và duyệt/từ chối lặp.
- Không gọi endpoint tạo QR, PayOS webhook hoặc subscription PayOS.

### Hỗ trợ/ticket

- Tenant tạo ticket gắn với phòng/hợp đồng.
- Tenant và Landlord thêm bình luận; upload tệp chỉ khi storage dev khả dụng.
- Landlord phân công, chuyển `OPEN → IN_PROGRESS → WAITING_RENTER/RESOLVED`.
- Tenant đóng ticket đã giải quyết.
- Tạo ticket độc lập để kiểm tra hủy và mở lại.
- Kiểm tra lịch sử trạng thái, quyền xem attachment và tenant isolation.

### Gói dịch vụ

- Landlord xem danh sách gói khả dụng và subscription hiện tại.
- Admin xem danh sách/chi tiết gói.
- Admin tạo một gói có mã chạy, cập nhật và vô hiệu hóa sau kiểm thử.
- Không mua gói hoặc tạo subscription payment vì PayOS đã được loại khỏi phạm vi.
- Không thay đổi gói hiện tại của Landlord được cung cấp.

### Tương tác qua Admin

- Kiểm tra dashboard tổng quan và xu hướng.
- Xem danh sách Landlord, Tenant và tenant detail.
- Tạo một tenant thử nghiệm riêng qua API Admin để kiểm tra:
  - Xác minh hồ sơ.
  - Đổi trạng thái active/suspended/closed.
  - Gán gói dịch vụ.
- Kiểm duyệt phòng marketplace đã tạo trong suite.
- Tenant tạo review/report trên dữ liệu hợp lệ; Admin duyệt hoặc xử lý.
- Kiểm tra quản lý tiện ích, thông báo và audit/history nếu endpoint hỗ trợ.
- Không khóa, đổi mật khẩu hoặc thay đổi trạng thái ba tài khoản được cung cấp.

## 4. Quản lý dữ liệu DB dev

- Chỉ cập nhật/xóa dữ liệu được tạo trong lần chạy hiện tại.
- Không xóa hoặc sửa dữ liệu nghiệp vụ có sẵn.
- Các thay đổi tạm thời phải được hoàn nguyên trong `finally`/global teardown.
- Với tài nguyên không có API xóa:
  - Chuyển về trạng thái cuối như `CANCELED`, `CLOSED` hoặc `INACTIVE`.
  - Giữ mã chạy trong tên/ghi chú để có thể truy vết.
  - Ghi ID còn tồn tại vào báo cáo cleanup.
- Nếu một flow thất bại giữa chừng, teardown vẫn chạy nhưng không che mất lỗi kiểm thử chính.

## 5. Báo cáo và tiêu chí hoàn thành

- Xuất báo cáo HTML và JSON, gồm:
  - Tên flow và bước API thất bại.
  - HTTP method, URL đã loại bỏ dữ liệu nhạy cảm, status mong đợi/thực tế.
  - ID của dữ liệu thử nghiệm.
  - Danh sách dữ liệu đã cleanup và dữ liệu còn lại.
  - Các flow `PASS`, `FAIL`, `SKIPPED` kèm lý do.
- Bộ kiểm thử đạt khi:
  - Ba tài khoản đăng nhập và đúng vai trò.
  - Tất cả happy path trả đúng trạng thái HTTP và trạng thái nghiệp vụ.
  - Các kiểm tra phân quyền/tenant isolation bị từ chối đúng cách.
  - Dữ liệu liên kết xuyên suốt từ phòng → yêu cầu thuê → hợp đồng → bàn giao → hóa đơn → thanh toán.
  - Không gọi frontend mock, PayOS hoặc thao tác trực tiếp database.
  - Không làm thay đổi tài khoản và dữ liệu có sẵn ngoài các tài nguyên thử nghiệm được đánh dấu.

## Giả định đã chốt

- Backend dev sẽ được khởi động trước khi chạy suite.
- API mặc định chạy tại `http://localhost:1174`.
- Ba tài khoản đã cung cấp đang active và Landlord có ít nhất một tenant active.
- Tài khoản Tenant có renter profile hợp lệ.
- Flow tự đăng ký bằng OTP bị loại khỏi phạm vi theo lựa chọn của bạn.
- Upload file sẽ được đánh dấu `SKIPPED` nếu storage dev không khả dụng; các phần còn lại của ticket vẫn tiếp tục.
