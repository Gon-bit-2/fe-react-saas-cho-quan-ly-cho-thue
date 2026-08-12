import { test, expect } from '@playwright/test';

const USERS = {
  admin: { email: 'gonjswork@gmail.com', pass: 'gonjs0710' }
};

test.describe.serial('CRUD: Admin Interactions', () => {
  const timestamp = Date.now();
  const amenityName = `Tiện ích Test ${timestamp}`;
  const planName = `Gói Test Cập nhật ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.goto('/dang-nhap');
    await page.getByLabel(/email/i).fill(USERS.admin.email);
    await page.getByLabel(/mật khẩu|password/i).fill(USERS.admin.pass);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await page.waitForURL(/.*\/admin/);
  });

  test('Create & Read: Admin tạo và xem Tiện ích', async ({ page }) => {
    // Navigate to Amenities
    await page.goto('/admin/tien-ich');
    
    // Bấm Tạo mới
    await page.getByRole('button', { name: /tạo mới|thêm/i }).click();
    
    // Fill data
    await page.getByLabel(/tên tiện ích/i).fill(amenityName);
    await page.getByRole('button', { name: /lưu|xác nhận/i }).click();
    
    // Read/Verify creation
    await expect(page.getByText(amenityName).first()).toBeVisible();
  });

  test('Update: Admin cập nhật thông tin Gói dịch vụ', async ({ page }) => {
    await page.goto('/admin/goi-dich-vu');
    
    // Chọn gói đầu tiên để Edit
    const firstEditBtn = page.getByRole('button', { name: /sửa|edit/i }).first();
    if (await firstEditBtn.isVisible()) {
      await firstEditBtn.click();
      
      // Đổi tên gói
      await page.getByLabel(/tên gói/i).fill(planName);
      await page.getByRole('button', { name: /lưu|cập nhật/i }).click();
      
      // Kiểm tra tên mới
      await expect(page.getByText(planName).first()).toBeVisible();
    }
  });

  test('Delete: Admin xóa/ẩn Tiện ích', async ({ page }) => {
    await page.goto('/admin/tien-ich');
    
    // Tìm tiện ích vừa tạo và bấm xóa
    // Giả sử có nút Xóa ở mỗi dòng (hoặc menu dropdown)
    const row = page.locator('tr', { hasText: amenityName }).first();
    if (await row.isVisible()) {
      await row.getByRole('button', { name: /xóa|delete/i }).click();
      
      // Có thể có hộp thoại xác nhận xóa
      const confirmBtn = page.getByRole('button', { name: /đồng ý|xóa/i }).first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }
      
      // Verify đã biến mất
      await expect(page.getByText(amenityName).first()).not.toBeVisible();
    }
  });

  test('Read & Update: Admin tìm và khóa tài khoản Chủ trọ', async ({ page }) => {
    await page.goto('/admin/chu-tro');
    
    // Read: Xem và tìm kiếm
    const searchInput = page.getByPlaceholder(/tìm kiếm/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test1@gmail.com');
      await searchInput.press('Enter');
      
      await expect(page.getByText('test1@gmail.com').first()).toBeVisible();
    }
    
    // Update: Khóa tài khoản
    const suspendBtn = page.getByRole('button', { name: /khóa|suspend/i }).first();
    if (await suspendBtn.isVisible()) {
      await suspendBtn.click();
      // Xác nhận khóa
      await page.getByRole('button', { name: /đồng ý/i }).click();
      await expect(page.locator('text=/đã khóa|suspended/i').first()).toBeVisible();
      
      // Mở khóa lại để không hỏng test khác
      await page.getByRole('button', { name: /mở khóa|active/i }).first().click();
      await page.getByRole('button', { name: /đồng ý/i }).click();
    }
  });
});
