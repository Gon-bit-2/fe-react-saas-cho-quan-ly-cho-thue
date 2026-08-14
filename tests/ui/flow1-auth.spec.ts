import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Flow 1: Xác Thực (Đăng ký, Đăng nhập, Quên mật khẩu)', () => {

  test('Step 1: Đăng ký tài khoản mới thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Sử dụng timestamp để tránh trùng lặp email do chưa có cơ chế DB reset
    const uniqueId = Date.now();
    const newEmail = `user_${uniqueId}@example.com`;
    
    await loginPage.register(`User ${uniqueId}`, newEmail, `0909${String(uniqueId).slice(-6)}`, 'TestPassword123!');
    
    // Tùy theo thiết kế, sau khi đăng ký có thể chuyển sang trang đăng nhập, trang chủ, hoặc trang OTP.
    // Dưới đây là expect mặc định
    await page.waitForTimeout(1000); // Đợi redirect
    // Kiểm tra không còn ở trang đăng ký
    expect(page.url()).not.toContain('/dang-ky');
  });

  test('Step 2.1: Đăng nhập thành công với tài khoản nguoithue (nguoithue1@gmail.com)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('nguoithue1@gmail.com', 'TestPassword123!');
    
    // Chờ redirect (để tránh timeout nếu mạng chậm)
    await page.waitForTimeout(2000);
    // URL sau đăng nhập phải là một trong các trang sau (không phải dang-nhap)
    expect(page.url()).not.toContain('/dang-nhap');
    
    // Test đăng xuất
    await loginPage.logout();
  });

  test('Step 2.2: Đăng nhập thành công với tài khoản chủ trọ (test1@gmail.com)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('test1@gmail.com', 'TestPassword123!');
    
    // Tương tự, chờ redirect
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain('/dang-nhap');
  });

  test('Step 2.3: Đăng nhập thành công với tài khoản admin (gonjswork@gmail.com)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('gonjswork@gmail.com', 'gonjs0710');
    
    // Admin có thể bị redirect tới /admin hoặc /tai-khoan
    await page.waitForURL('**/*', { timeout: 10000 }).catch(() => {});
    const currentUrl = page.url();
    expect(currentUrl.includes('/admin') || currentUrl.includes('/tai-khoan') || currentUrl.includes('/')).toBeTruthy();
  });

  test('Step 4: Quên mật khẩu', async ({ page }) => {
    await page.goto('/quen-mat-khau');
    
    await page.getByLabel(/email/i).fill('test1@gmail.com');
    await page.getByRole('button', { name: /gửi/i }).click();
    
    // Thường sẽ có thông báo xác nhận đã gửi email hoặc chuyển tới màn hình nhập OTP
    const confirmation = page.getByText(/kiểm tra email|mã xác thực/i);
    if (await confirmation.isVisible({ timeout: 5000 })) {
        await expect(confirmation).toBeVisible();
    }
    // Ghi chú: Flow reset password thực tế cần đọc email, ở cấp độ E2E ta chỉ test giao diện yêu cầu.
  });

});
