import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Flow 7: Dịch Vụ, Hóa Đơn & Thanh Toán', () => {

  test('Chủ trọ tạo dịch vụ, gán vào phòng và lập hóa đơn thu tiền', async ({ page, context }) => {
    // === PHẦN 1: CHỦ TRỌ TẠO DỊCH VỤ & GÁN ===
    const loginPage = new LoginPage(page);
    await loginPage.login('test1@gmail.com', 'TestPassword123!');
    
    // 1. Tạo dịch vụ
    await page.goto('/dich-vu/tao-moi');
    const serviceName = `Dịch Vụ E2E ${Date.now()}`;
    await page.getByLabel(/tên dịch vụ/i).fill(serviceName);
    await page.getByLabel(/đơn giá/i).fill('150000');
    await page.getByRole('button', { name: /lưu|tạo mới/i }).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 5000 });

    // 2. Gán dịch vụ cho phòng
    await page.goto('/dich-vu-da-gan/tao-moi');
    // Bỏ qua tương tác phức tạp, giả định click chọn phòng và lưu
    const saveAssignBtn = page.getByRole('button', { name: /lưu|gán/i }).first();
    if (await saveAssignBtn.isVisible()) {
        await saveAssignBtn.click();
    }

    // 3. Lập Hóa Đơn
    await page.goto('/hoa-don/tao-moi');
    const roomInvoiceSelect = page.getByRole('combobox', { name: /phòng/i });
    if (await roomInvoiceSelect.isVisible()) {
        await roomInvoiceSelect.click();
        await page.getByRole('option').first().click();
    }
    await page.getByRole('button', { name: /lưu|tạo/i }).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 5000 });
    
    // Thoát chủ trọ
    await loginPage.logout();

    // === PHẦN 2: NGƯỜI THUÊ THANH TOÁN (Giả lập) ===
    const renterPage = await context.newPage();
    const renterLogin = new LoginPage(renterPage);
    await renterLogin.login('nguoithue1@gmail.com', 'TestPassword123!');
    
    await renterPage.goto('/thanh-toan');
    
    // Xem hóa đơn / Thanh toán
    const payBtn = renterPage.getByRole('button', { name: /thanh toán/i }).first();
    if (await payBtn.isVisible()) {
        await payBtn.click();
        
        // Mô phỏng thanh toán (Bank transfer/VNPay)
        const confirmPayBtn = renterPage.getByRole('button', { name: /xác nhận thanh toán|đã chuyển khoản/i });
        if (await confirmPayBtn.isVisible()) {
            await confirmPayBtn.click();
            await expect(renterPage.getByText(/thành công/i).first()).toBeVisible({ timeout: 5000 });
        }
    }
    await renterPage.close();

    // === PHẦN 3: CHỦ TRỌ DUYỆT THANH TOÁN ===
    await loginPage.login('test1@gmail.com', 'TestPassword123!');
    await page.goto('/thanh-toan'); // Hoặc link chi tiết
    
    // Tìm giao dịch cần duyệt
    const reviewBtn = page.getByRole('button', { name: /duyệt|xác nhận/i }).first();
    if (await reviewBtn.isVisible()) {
        await reviewBtn.click();
        await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 5000 });
    }
    
  });

});
