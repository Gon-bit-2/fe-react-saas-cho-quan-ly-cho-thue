import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PropertyPage } from './pages/PropertyPage';

test.describe('Flow 3: Khởi Tạo Khu Trọ & Phòng Trọ', () => {

  test.beforeEach(async ({ page }) => {
    // Đăng nhập bằng tài khoản chủ trọ test1
    const loginPage = new LoginPage(page);
    await loginPage.login('test1@gmail.com', 'TestPassword123!');
    
    // Đảm bảo chọn tenant đúng nếu hệ thống yêu cầu
    // (Bỏ qua nếu tài khoản test1 đã auto vào tenant dashboard)
    await page.waitForURL('**/tong-quan').catch(() => {});
  });

  test('Chủ trọ có thể tạo khu trọ và thêm phòng mới', async ({ page }) => {
    const propertyPage = new PropertyPage(page);
    
    const uniqueId = Date.now();
    const propName = `Khu Trọ E2E ${uniqueId}`;
    const roomNumber = `P101-${uniqueId}`;
    
    // 1. Tạo khu trọ
    await propertyPage.createProperty(propName, '123 Đường Test, Quận 1');
    
    // Kiểm tra danh sách hiển thị khu trọ mới
    await expect(page.getByText(propName).first()).toBeVisible({ timeout: 10000 });

    // 2. Tạo phòng mới thuộc khu trọ vừa tạo
    await propertyPage.createRoom(roomNumber, propName, '5000000', '25');
    
    // Kiểm tra danh sách phòng
    await expect(page.getByText(roomNumber).first()).toBeVisible({ timeout: 10000 });
  });

});
