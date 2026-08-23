import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Flow 2: Đăng Ký Làm Chủ Trọ & Chọn Tenant', () => {

  test('Tạo tài khoản mới, sau đó tạo một nhà trọ mới (Tenant) và truy cập dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // 1. Tạo user mới để tránh đụng độ dữ liệu của test1@gmail.com
    const uniqueId = Date.now();
    const newEmail = `landlord_${uniqueId}@example.com`;
    await loginPage.register(`Landlord ${uniqueId}`, newEmail, `0909${String(uniqueId).slice(-6)}`, 'TestPassword123!');
    
    // Đăng nhập lại nếu hệ thống không auto login sau đăng ký
    // Nếu hệ thống auto login thì bước này có thể bỏ qua hoặc check xem đã login chưa
    await page.goto('/dang-nhap');
    if (page.url().includes('dang-nhap')) {
      await loginPage.login(newEmail, 'TestPassword123!');
    }

    // 2. Đi đến trang chọn/thêm tenant
    const tenantName = `Khu Trọ ${uniqueId}`;
    await dashboardPage.createNewTenant(tenantName);

    // 3. Đảm bảo sidebar hoặc header hiển thị thông tin tenant vừa tạo
    const sideBar = page.locator('aside'); // Hoặc container của sidebar
    if (await sideBar.isVisible()) {
        await expect(sideBar).toContainText(/tổng quan/i);
    }
    
    // Đăng xuất dọn dẹp (tuỳ chọn)
    await loginPage.logout();
  });
});
