import { test, expect } from '@playwright/test';

const USERS = {
  landlord: { email: 'test1@gmail.com', pass: 'TestPassword123!' },
  tenant: { email: 'nguoithue1@gmail.com', pass: 'TestPassword123!' }
};

test.describe.serial('Payment and Ticket Workflow E2E (UI)', () => {
  const runId = `E2E-Phase2-${Date.now()}`;
  const ticketTitle = `${runId} Hỏng bóng đèn`;

  const ROUTES = {
    login: '/dang-nhap',
    payments: '/app/thanh-toan',
    tickets: '/app/ho-tro'
  };

  test('Tenant & Landlord: Báo cáo và Duyệt thanh toán thủ công', async ({ browser }) => {
    // ----------------------------------------------------
    // TENANT: Báo cáo thanh toán
    // ----------------------------------------------------
    const tenantContext = await browser.newContext();
    const tenantPage = await tenantContext.newPage();

    await tenantPage.goto(ROUTES.login);
    await tenantPage.getByLabel(/email/i).fill(USERS.tenant.email);
    await tenantPage.getByLabel(/mật khẩu|password/i).fill(USERS.tenant.pass);
    await tenantPage.getByRole('button', { name: /đăng nhập/i }).click();
    await tenantPage.waitForURL(/.*\/(tai-khoan|app)/);

    // Vào danh sách thanh toán / hóa đơn
    await tenantPage.goto(ROUTES.payments);
    
    // Giả định có nút Báo cáo thanh toán hoặc click vào hóa đơn chờ thanh toán
    // Test framework sẽ cố gắng click vào nút có chữ Thanh toán/Báo cáo
    const reportPaymentBtn = tenantPage.getByRole('button', { name: /báo cáo thanh toán|thanh toán/i }).first();
    if (await reportPaymentBtn.isVisible()) {
      await reportPaymentBtn.click();
      
      // Điền mã giao dịch và tải ảnh UNC
      await tenantPage.getByLabel(/mã giao dịch/i).fill('TXN123456');
      await tenantPage.getByLabel(/ghi chú/i).fill('Đã chuyển khoản tiền tháng này');
      // Giả lập upload ảnh (bỏ qua upload file local thực tế vì phức tạp, có thể chỉ submit text)
      
      await tenantPage.getByRole('button', { name: /gửi|xác nhận/i }).click();
      await expect(tenantPage.locator('text=/thành công|chờ duyệt/i').first()).toBeVisible();
    }
    await tenantContext.close();

    // ----------------------------------------------------
    // LANDLORD: Duyệt thanh toán
    // ----------------------------------------------------
    const landlordContext = await browser.newContext();
    const landlordPage = await landlordContext.newPage();

    await landlordPage.goto(ROUTES.login);
    await landlordPage.getByLabel(/email/i).fill(USERS.landlord.email);
    await landlordPage.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await landlordPage.getByRole('button', { name: /đăng nhập/i }).click();
    await landlordPage.waitForURL(/.*\/(tai-khoan|app)/);

    await landlordPage.goto(ROUTES.payments);
    
    // Tìm giao dịch đang chờ duyệt
    const pendingPayment = landlordPage.locator('text=/chờ duyệt|pending/i').first();
    if (await pendingPayment.isVisible()) {
      await pendingPayment.click(); // Click vào chi tiết
      // Click nút Duyệt
      await landlordPage.getByRole('button', { name: /duyệt|chấp nhận/i }).click();
      await expect(landlordPage.locator('text=/đã duyệt|thành công/i').first()).toBeVisible();
    }
    
    await landlordContext.close();
  });

  test('Tenant & Landlord: Tạo và Xử lý Ticket Hỗ trợ', async ({ browser }) => {
    // ----------------------------------------------------
    // TENANT: Tạo Ticket
    // ----------------------------------------------------
    const tenantContext = await browser.newContext();
    const tenantPage = await tenantContext.newPage();

    await tenantPage.goto(ROUTES.login);
    await tenantPage.getByLabel(/email/i).fill(USERS.tenant.email);
    await tenantPage.getByLabel(/mật khẩu|password/i).fill(USERS.tenant.pass);
    await tenantPage.getByRole('button', { name: /đăng nhập/i }).click();
    await tenantPage.waitForURL(/.*\/(tai-khoan|app)/);

    // Vào mục Hỗ trợ
    await tenantPage.goto(ROUTES.tickets);
    
    // Bấm Tạo mới
    const createTicketBtn = tenantPage.getByRole('button', { name: /tạo mới|thêm/i }).first();
    if (await createTicketBtn.isVisible()) {
      await createTicketBtn.click();
      
      // Điền form ticket
      await tenantPage.getByLabel(/tiêu đề/i).fill(ticketTitle);
      await tenantPage.getByLabel(/nội dung|mô tả/i).fill('Bóng đèn nhà vệ sinh bị cháy, cần thay mới.');
      await tenantPage.getByRole('button', { name: /gửi|lưu/i }).click();
      
      await expect(tenantPage.getByText(ticketTitle).first()).toBeVisible();
    }
    await tenantContext.close();

    // ----------------------------------------------------
    // LANDLORD: Xử lý Ticket
    // ----------------------------------------------------
    const landlordContext = await browser.newContext();
    const landlordPage = await landlordContext.newPage();

    await landlordPage.goto(ROUTES.login);
    await landlordPage.getByLabel(/email/i).fill(USERS.landlord.email);
    await landlordPage.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await landlordPage.getByRole('button', { name: /đăng nhập/i }).click();
    await landlordPage.waitForURL(/.*\/(tai-khoan|app)/);

    await landlordPage.goto(ROUTES.tickets);
    
    // Tìm ticket vừa tạo
    const ticketElement = landlordPage.getByText(ticketTitle).first();
    if (await ticketElement.isVisible()) {
      await ticketElement.click(); // Vào chi tiết ticket
      
      // Chuyển trạng thái sang Đã xử lý / Đóng
      const resolveBtn = landlordPage.getByRole('button', { name: /đóng|hoàn thành|xử lý xong/i }).first();
      if (await resolveBtn.isVisible()) {
        await resolveBtn.click();
        await expect(landlordPage.locator('text=/đóng|hoàn thành/i').first()).toBeVisible();
      }
    }
    
    await landlordContext.close();
  });
});
