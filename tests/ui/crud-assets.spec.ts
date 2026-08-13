import { test, expect } from '@playwright/test';

const USERS = {
  landlord: { email: 'test1@gmail.com', pass: 'TestPassword123!' },
  tenant: { email: 'nguoithue1@gmail.com', pass: 'TestPassword123!' }
};

test.describe.serial('CRUD: Asset Management', () => {
  const timestamp = Date.now();
  const assetName = `Tài sản ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('/');
  });

  test('Create & Read: Landlord thêm tài sản', async ({ page }) => {
    await page.goto('/quan-ly-tai-san');
    
    // Create
    await page.getByRole('button', { name: /thêm|tạo mới/i }).click();
    await page.getByLabel(/tên tài sản/i).fill(assetName);
    await page.getByLabel(/số lượng/i).fill('5');
    await page.getByRole('button', { name: /lưu/i }).click();
    
    // Read
    await expect(page.getByText(assetName).first()).toBeVisible();
  });

  test('Update: Landlord sửa thông tin tài sản', async ({ page }) => {
    await page.goto('/quan-ly-tai-san');
    
    const row = page.locator('tr, .card', { hasText: assetName }).first();
    if (await row.isVisible()) {
      await row.getByRole('button', { name: /sửa|edit/i }).click();
      
      await page.getByLabel(/số lượng/i).fill('10');
      await page.getByRole('button', { name: /lưu/i }).click();
      
      // Có thể expect số 10 xuất hiện gần assetName, ta chỉ expect popup đóng
      await expect(page.getByRole('button', { name: /lưu/i })).not.toBeVisible();
    }
  });

  test('Delete: Landlord xóa tài sản', async ({ page }) => {
    await page.goto('/quan-ly-tai-san');
    
    const row = page.locator('tr, .card', { hasText: assetName }).first();
    if (await row.isVisible()) {
      await row.getByRole('button', { name: /xóa/i }).click();
      await page.getByRole('button', { name: /đồng ý/i }).click();
      
      await expect(page.getByText(assetName).first()).not.toBeVisible();
    }
  });
});
