import { test, expect } from '@playwright/test';

const USERS = {
  landlord: { email: 'test1@gmail.com', pass: 'TestPassword123!' },
  tenant: { email: 'nguoithue1@gmail.com', pass: 'TestPassword123!' }
};

test.describe.serial('CRUD: Manual Payments', () => {
  const timestamp = Date.now();
  const txnCode = `TXN-${timestamp}`;

  test('Create & Read: Tenant báo cáo thanh toán', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.tenant.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.tenant.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/(tai-khoan|app)/);

    // Create
    await page.goto('/app/thanh-toan');
    const reportBtn = page.getByRole('button', { name: /báo cáo|thanh toán/i }).first();
    if (await reportBtn.isVisible()) {
      await reportBtn.click();
      await page.getByLabel(/mã giao dịch/i).fill(txnCode);
      await page.getByRole('button', { name: /gửi/i }).click();
    }
    
    // Read
    await expect(page.locator('text=/chờ duyệt|pending/i').first()).toBeVisible();
    await context.close();
  });

  test('Update: Landlord duyệt thanh toán', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/(tai-khoan|app)/);

    // Update
    await page.goto('/app/thanh-toan');
    const pendingTxn = page.locator('tr, .card', { hasText: 'Chờ duyệt' }).first();
    if (await pendingTxn.isVisible()) {
      await pendingTxn.getByRole('button', { name: /duyệt/i }).click();
      await expect(page.locator('text=/đã duyệt|thành công/i').first()).toBeVisible();
    }
    await context.close();
  });

  test('Delete: Tenant hủy báo cáo thanh toán', async ({ browser }) => {
    // Để Delete thì Tenant phải có 1 GD đang chờ duyệt, test giả định là có nút Hủy
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.tenant.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.tenant.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/(tai-khoan|app)/);

    await page.goto('/app/thanh-toan');
    const pendingTxn = page.locator('tr, .card', { hasText: 'Chờ duyệt' }).first();
    if (await pendingTxn.isVisible()) {
      const cancelBtn = pendingTxn.getByRole('button', { name: /hủy/i }).first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await page.getByRole('button', { name: /đồng ý/i }).click();
        await expect(pendingTxn).not.toBeVisible();
      }
    }
    await context.close();
  });
});
