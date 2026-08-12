import { test, expect } from '@playwright/test';

// Định nghĩa thông tin tài khoản dùng cho test
const USERS = {
  admin: { email: 'gonjswork@gmail.com', pass: 'gonjs0710' },
  landlord: { email: 'test1@gmail.com', pass: 'TestPassword123!' },
  tenant: { email: 'nguoithue1@gmail.com', pass: 'TestPassword123!' }
};

// Chạy các test tuần tự để mô phỏng một luồng xuyên suốt
test.describe.serial('Core Rental Workflow E2E (UI)', () => {
  // Tạo tên độc nhất để dễ nhận diện dữ liệu test
  const runId = `E2E-UI-${Date.now()}`;
  const propertyName = `${runId} Khu Trọ Test`;
  const roomName = `${runId} Phòng Test`;
  
  // Các URL tĩnh của hệ thống theo routes.tsx
  const ROUTES = {
    login: '/dang-nhap',
    landlordProperty: '/app/khu-tro',
    landlordRoom: '/app/quan-ly-phong/danh-sach',
    landlordRequests: '/app/quan-ly-nha-tro/yeu-cau-thue',
    landlordContracts: '/app/hop-dong',
    adminModeration: '/admin/kiem-duyet/hang-cho',
    marketplace: '/phong'
  };

  test('Landlord: Tạo khu trọ và tạo phòng', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Landlord Đăng nhập
    await page.goto(ROUTES.login);
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/(tai-khoan|app)/);

    // 2. Tạo Khu trọ
    await page.goto(`${ROUTES.landlordProperty}/tao-moi`);
    // Giả định các trường input cơ bản
    await page.getByLabel(/tên khu trọ/i).fill(propertyName);
    await page.getByLabel(/địa chỉ/i).fill('123 Đường Test, Quận Test');
    await page.getByRole('button', { name: /lưu|tạo mới/i }).click();
    await page.waitForURL(ROUTES.landlordProperty);
    await expect(page.getByText(propertyName)).toBeVisible();

    // 3. Tạo Phòng và gửi duyệt
    await page.goto(`${ROUTES.landlordRoom}/tao-moi`);
    await page.getByLabel(/tên phòng/i).fill(roomName);
    await page.getByLabel(/giá thuê/i).fill('3500000');
    await page.getByLabel(/diện tích/i).fill('25');
    // Bấm lưu
    await page.getByRole('button', { name: /lưu|tạo mới/i }).click();
    
    // Gửi duyệt (Có thể là một nút Đăng tin / Gửi duyệt trong chi tiết phòng)
    // Giả định click vào phòng vừa tạo và chọn Đăng tin
    await page.getByText(roomName).click();
    const publishBtn = page.getByRole('button', { name: /đăng tin|gửi duyệt/i });
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      // Chấp nhận confirm dialog nếu có
    }
    
    await context.close();
  });

  test('Admin: Duyệt phòng cho lên Marketplace', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Admin Đăng nhập
    await page.goto(ROUTES.login);
    await page.getByLabel(/email/i).fill(USERS.admin.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.admin.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/admin/);

    // 2. Vào hàng chờ kiểm duyệt
    await page.goto(ROUTES.adminModeration);
    
    // 3. Tìm phòng và duyệt (PUBLISHED)
    await page.getByText(roomName).click();
    await page.getByRole('button', { name: /duyệt|chấp nhận/i }).click();
    
    // Xác minh phòng đã biến mất khỏi hàng chờ hoặc trạng thái đổi thành Đã duyệt
    await expect(page.locator('text=/đã duyệt|thành công/i').first()).toBeVisible();

    await context.close();
  });

  test('Tenant: Tìm phòng, đặt lịch xem và gửi yêu cầu thuê', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Tenant Đăng nhập
    await page.goto(ROUTES.login);
    await page.getByLabel(/email/i).fill(USERS.tenant.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.tenant.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/(tai-khoan|app)/);

    // 2. Ra Marketplace tìm phòng
    await page.goto(ROUTES.marketplace);
    await page.getByPlaceholder(/tìm kiếm/i).fill(roomName);
    await page.keyboard.press('Enter');
    
    // Click vào phòng
    await page.getByText(roomName).click();
    await page.waitForURL(/.*\/phong\/\d+/);

    // 3. Đặt lịch xem phòng
    await page.getByRole('button', { name: /đặt lịch xem/i }).click();
    // Chọn ngày mai (tương đối)
    await page.getByLabel(/ngày/i).fill('2026-12-31'); // Cần fix date thực tế
    await page.getByRole('button', { name: /xác nhận/i }).click();
    await expect(page.getByText(/thành công/i)).toBeVisible();

    // 4. Gửi yêu cầu thuê
    await page.getByRole('button', { name: /gửi yêu cầu thuê/i }).click();
    await page.getByLabel(/lời nhắn/i).fill('Tôi muốn thuê phòng này.');
    await page.getByRole('button', { name: /gửi/i }).click();
    await expect(page.getByText(/thành công/i)).toBeVisible();

    await context.close();
  });

  test('Landlord: Duyệt yêu cầu thuê và tạo hợp đồng', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Landlord Đăng nhập
    await page.goto(ROUTES.login);
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/(tai-khoan|app)/);

    // 2. Vào xem yêu cầu thuê
    await page.goto(ROUTES.landlordRequests);
    
    // Tìm yêu cầu có liên quan đến Tenant vừa gửi
    await page.getByText(roomName).first().click();
    
    // 3. Duyệt yêu cầu (APPROVED)
    await page.getByRole('button', { name: /duyệt|chấp nhận/i }).click();
    await expect(page.getByText(/thành công/i)).toBeVisible();

    // 4. Tạo và kích hoạt hợp đồng từ yêu cầu
    await page.getByRole('button', { name: /tạo hợp đồng/i }).click();
    await page.waitForURL(/.*\/hop-dong\/tao/);
    
    // Điền thông tin hợp đồng
    await page.getByLabel(/ngày bắt đầu/i).fill('2026-08-15');
    await page.getByLabel(/ngày kết thúc/i).fill('2027-08-15');
    await page.getByRole('button', { name: /lưu/i }).click();
    
    // Kích hoạt hợp đồng
    await page.getByRole('button', { name: /kích hoạt/i }).click();
    await expect(page.getByText(/đang hiệu lực|active/i)).toBeVisible();

    await context.close();
  });
});
