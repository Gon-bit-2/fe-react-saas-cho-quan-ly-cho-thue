import { test, expect } from '@playwright/test';

const USERS = {
  landlord: { email: 'test1@gmail.com', pass: 'TestPassword123!' },
  tenant: { email: 'nguoithue1@gmail.com', pass: 'TestPassword123!' }
};

test.describe.serial('CRUD: Contracts & Termination', () => {
  const timestamp = Date.now();
  const contractName = `Hợp đồng ${timestamp}`;

  test('Create & Read: Landlord tạo Hợp đồng nháp', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('/');

    // Create
    await page.goto('/hop-dong/tao');
    await page.getByLabel(/tên hợp đồng/i).fill(contractName);
    // Chọn phòng, khách...
    await page.getByRole('button', { name: /lưu nháp/i }).click();
    
    // Read
    await page.waitForURL('/hop-dong');
    await expect(page.getByText(contractName).first()).toBeVisible();
    await context.close();
  });

  test('Update: Landlord thêm phụ lục/Sửa hợp đồng', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    
    await page.goto('/hop-dong');
    const contractRow = page.locator('tr, .card', { hasText: contractName }).first();
    if (await contractRow.isVisible()) {
      await contractRow.getByRole('button', { name: /sửa/i }).click();
      
      await page.getByLabel(/ghi chú|phụ lục/i).fill('Phụ lục 1');
      await page.getByRole('button', { name: /lưu/i }).click();
      await expect(page.locator('text=/thành công/i').first()).toBeVisible();
    }
    await context.close();
  });

  test('Delete: Landlord hủy hợp đồng nháp', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    
    await page.goto('/hop-dong');
    const contractRow = page.locator('tr, .card', { hasText: contractName }).first();
    if (await contractRow.isVisible()) {
      await contractRow.getByRole('button', { name: /hủy|xóa/i }).click();
      await page.getByRole('button', { name: /đồng ý/i }).click();
      
      await expect(page.getByText(contractName).first()).not.toBeVisible();
    }
    await context.close();
  });
});
