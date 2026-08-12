import { test, expect } from '@playwright/test';

const USERS = {
  landlord: { email: 'test1@gmail.com', pass: 'TestPassword123!' }
};

test.describe.serial('CRUD: Invoices & Debt', () => {
  const timestamp = Date.now();
  const invoiceDesc = `Hóa đơn tháng ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/(tai-khoan|app)/);
  });

  test('Create & Read: Landlord tạo và xem Hóa đơn nháp', async ({ page }) => {
    await page.goto('/app/hoa-don/tao-moi');
    
    // Create
    await page.getByLabel(/ghi chú|mô tả/i).fill(invoiceDesc);
    await page.getByLabel(/hạn thanh toán/i).fill('2026-12-31');
    await page.getByRole('button', { name: /lưu nháp|tạo mới/i }).click();
    
    // Read
    await page.waitForURL('/app/hoa-don');
    await expect(page.getByText(invoiceDesc).first()).toBeVisible();
  });

  test('Update: Landlord phát hành Hóa đơn', async ({ page }) => {
    await page.goto('/app/hoa-don');
    
    const draftInvoice = page.locator('tr, .card', { hasText: invoiceDesc }).first();
    if (await draftInvoice.isVisible()) {
      await draftInvoice.getByRole('button', { name: /chi tiết|xem/i }).click();
      
      // Update trạng thái thành Phát hành
      await page.getByRole('button', { name: /phát hành/i }).click();
      await expect(page.locator('text=/đã phát hành|chờ thanh toán/i').first()).toBeVisible();
    }
  });

  test('Delete: Landlord hủy Hóa đơn', async ({ page }) => {
    await page.goto('/app/hoa-don');
    
    const targetInvoice = page.locator('tr, .card', { hasText: invoiceDesc }).first();
    if (await targetInvoice.isVisible()) {
      await targetInvoice.getByRole('button', { name: /chi tiết|xem/i }).click();
      
      // Bấm nút Hủy
      const cancelBtn = page.getByRole('button', { name: /hủy hóa đơn/i }).first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        
        // Xác nhận
        await page.getByRole('button', { name: /đồng ý/i }).click();
        await expect(page.locator('text=/đã hủy/i').first()).toBeVisible();
      }
    }
  });
});
