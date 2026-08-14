import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Flow 6: Quản Lý Hợp Đồng & Người Thuê', () => {

  test('Tạo lời mời và lập hợp đồng thuê', async ({ page }) => {
    // === PHẦN 1: CHỦ TRỌ TẠO LỜI MỜI ===
    const loginPage = new LoginPage(page);
    await loginPage.login('test1@gmail.com', 'TestPassword123!');
    
    // Vào trang quản lý lời mời
    await page.goto('/nguoi-thue/loi-moi/tao');
    
    // Điền form lời mời
    await page.getByLabel(/email|số điện thoại/i).fill('nguoithue1@gmail.com');
    // Chọn phòng (Giả định UI có select phòng)
    const roomSelect = page.getByRole('combobox', { name: /phòng/i });
    if (await roomSelect.isVisible()) {
        await roomSelect.click();
        await page.getByRole('option').first().click();
    }
    
    await page.getByRole('button', { name: /gửi lời mời|tạo/i }).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 5000 });

    // === PHẦN 2: LẬP HỢP ĐỒNG ===
    await page.goto('/hop-dong/tao');
    
    // Điền thông tin hợp đồng cơ bản
    // Chọn người thuê hoặc phòng đã gán
    const tenantSelect = page.getByRole('combobox', { name: /người thuê/i });
    if (await tenantSelect.isVisible()) {
        await tenantSelect.click();
        await page.getByRole('option', { name: /nguoithue1/i }).click();
    }
    
    // Cài đặt thông số
    const depositInput = page.getByLabel(/tiền cọc/i);
    if (await depositInput.isVisible()) {
        await depositInput.fill('5000000');
    }
    
    await page.getByRole('button', { name: /lưu|tạo mới/i }).click();
    
    // Kiểm tra danh sách hợp đồng
    await page.waitForURL('**/hop-dong');
    await expect(page.locator('table')).toBeVisible();
    
    await loginPage.logout();
  });

});
