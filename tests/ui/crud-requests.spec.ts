import { test, expect } from '@playwright/test';

const USERS = {
  landlord: { email: 'test1@gmail.com', pass: 'TestPassword123!' },
  tenant: { email: 'nguoithue1@gmail.com', pass: 'TestPassword123!' }
};

test.describe.serial('CRUD: Viewing schedules & Rental requests', () => {
  const timestamp = Date.now();
  const requestNotes = `Yêu cầu thuê test ${timestamp}`;

  test('Create & Read: Tenant tạo Yêu cầu thuê', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.tenant.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.tenant.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('/');

    // Tìm phòng marketplace
    await page.goto('/');
    const firstRoom = page.locator('.room-card').first();
    if (await firstRoom.isVisible()) {
      await firstRoom.click();
      
      // Bấm Yêu cầu thuê
      const requestBtn = page.getByRole('button', { name: /yêu cầu thuê/i }).first();
      if (await requestBtn.isVisible()) {
        await requestBtn.click();
        await page.getByLabel(/ghi chú/i).fill(requestNotes);
        await page.getByRole('button', { name: /gửi/i }).click();
        
        await expect(page.locator('text=/chờ duyệt/i').first()).toBeVisible();
      }
    }
    await context.close();
  });

  test('Update: Landlord duyệt Yêu cầu thuê', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.landlord.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.landlord.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL('/');

    await page.goto('/quan-ly-nha-tro/yeu-cau-thue');
    
    // Tìm yêu cầu theo notes
    const row = page.locator('tr, .card', { hasText: requestNotes }).first();
    if (await row.isVisible()) {
      await row.getByRole('button', { name: /duyệt|approve/i }).click();
      await expect(page.locator('text=/đã duyệt/i').first()).toBeVisible();
    }
    await context.close();
  });

  test.skip('Delete: Tenant hủy Lịch xem phòng (chưa có màn self-service)', async ({ browser }) => {
    // Tương tự, nếu có lịch xem phòng, Tenant có thể vào hủy
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.tenant.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.tenant.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    
    await page.goto('/quan-ly-nha-tro/lich-xem-phong');
    const appointmentRow = page.locator('tr, .card', { hasText: 'Chờ xác nhận' }).first();
    if (await appointmentRow.isVisible()) {
      await appointmentRow.getByRole('button', { name: /hủy/i }).click();
      await page.getByRole('button', { name: /đồng ý/i }).click();
      
      await expect(appointmentRow).not.toBeVisible();
    }
    await context.close();
  });
});
