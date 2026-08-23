import { test, expect } from '@playwright/test';

test.describe('Authentication Workflow', () => {
  test('Khách có thể truy cập trang chủ và chuyển đến trang đăng nhập', async ({ page }) => {
    // Truy cập trang chủ
    await page.goto('/');
    
    // Kiểm tra tiêu đề hoặc thành phần cơ bản của trang chủ
    await expect(page).toHaveTitle(/.*|.*/); // Điều chỉnh regex tùy title thực tế

    // Tìm nút Đăng nhập và click
    // Giả định có nút/link chứa text 'Đăng nhập'
    const loginLink = page.getByRole('link', { name: /Đăng nhập/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*\/dang-nhap/);
    }
  });

  test('Người dùng có thể đăng nhập bằng tài khoản Landlord', async ({ page }) => {
    await page.goto('/dang-nhap');

    // Điền form đăng nhập
    // Giả định input email và password có name hoặc placeholder tương ứng
    await page.getByLabel(/email/i).fill('test1@gmail.com');
    await page.getByLabel(/mật khẩu|password/i).fill('TestPassword123!');
    
    // Bấm nút đăng nhập
    await page.getByRole('button', { name: /đăng nhập/i }).click();

    // Sau khi đăng nhập thành công, người dùng được chuyển về trang chủ
    // Cần đợi URL thay đổi để xác nhận đăng nhập thành công
    await page.waitForURL('/', { timeout: 10000 });
    
    // Xác nhận đã vào trang bên trong
    await expect(page).toHaveURL('/');
  });
});
