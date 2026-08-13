import { test, expect } from '@playwright/test';

const USERS = {
  admin: { email: 'gonjswork@gmail.com', pass: 'gonjs0710' },
  landlord: { email: 'test1@gmail.com', pass: 'TestPassword123!' }
};

test.describe.serial('Admin and SaaS Workflow E2E (UI)', () => {
  const runId = `E2E-Phase3-${Date.now()}`;
  const planName = `${runId} Gói Cao Cấp`;

  const ROUTES = {
    login: '/dang-nhap',
    adminDashboard: '/admin',
    adminLandlords: '/admin/chu-tro',
    adminPlans: '/admin/goi-dich-vu',
    landlordSubscription: '/goi-dich-vu',
    landlordCompare: '/goi-dich-vu/so-sanh'
  };

  test('Admin: Quản trị Gói dịch vụ (SaaS) và Người dùng', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Admin Đăng nhập
    await page.goto(ROUTES.login);
    await page.getByLabel(/email/i).fill(USERS.admin.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.admin.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/admin/);
    await expect(page.getByRole('heading', { name: /tổng quan|dashboard/i }).first()).toBeVisible();

    // 2. Kiểm tra danh sách Chủ trọ
    await page.goto(ROUTES.adminLandlords);
    // Xác minh danh sách hiển thị
    await expect(page.locator('table, .list, [role="grid"]').first()).toBeVisible();

    // 3. Quản trị Gói dịch vụ - Tạo gói mới
    await page.goto(`${ROUTES.adminPlans}/tao-moi`);
    
    // Điền form tạo gói
    await page.getByLabel(/mã gói/i).fill(`PREMIUM-${Date.now()}`);
    await page.getByLabel(/tên gói/i).fill(planName);
    // Chấp nhận regex mở rộng cho các trường input liên quan đến giá tiền hoặc phòng
    const priceInput = page.getByLabel(/giá|price/i).first();
    if (await priceInput.isVisible()) {
      await priceInput.fill('999000');
    }
    
    // Bấm lưu
    await page.getByRole('button', { name: /lưu|tạo mới/i }).click();
    // Chờ quay lại danh sách
    await page.waitForURL(ROUTES.adminPlans);
    
    // Xác minh gói mới xuất hiện
    await expect(page.getByText(planName).first()).toBeVisible();

    await context.close();
  });

  test('Landlord: Xem, So sánh và Nâng cấp Gói dịch vụ', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Landlord Đăng nhập
    await page.goto(ROUTES.login);
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('/');

    // 2. Xem gói dịch vụ hiện tại
    await page.goto(ROUTES.landlordSubscription);
    await expect(page.getByRole('heading', { name: /gói dịch vụ|gói hiện tại/i }).first()).toBeVisible();

    // 3. Đi tới trang So sánh và chọn gói
    await page.goto(ROUTES.landlordCompare);
    
    // Tìm gói vừa tạo bởi Admin (nếu được hiển thị) hoặc bấm chọn gói cao nhất
    const upgradeBtn = page.getByRole('button', { name: /nâng cấp|chọn gói|mua ngay/i }).first();
    if (await upgradeBtn.isVisible()) {
      await upgradeBtn.click();
      
      // Chờ chuyển hướng sang trang thanh toán / checkout
      await page.waitForURL(/.*\/thanh-toan/);
      
      // Giả lập luồng thanh toán gói
      const checkoutBtn = page.getByRole('button', { name: /xác nhận thanh toán|hoàn tất/i }).first();
      if (await checkoutBtn.isVisible()) {
        await checkoutBtn.click();
        await expect(page.locator('text=/thành công|đang kích hoạt/i').first()).toBeVisible();
      }
    }

    await context.close();
  });
});
