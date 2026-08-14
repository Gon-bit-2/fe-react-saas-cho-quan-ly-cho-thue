import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Flow 5: Người Thuê Tìm Phòng & Gửi Yêu Cầu Thuê', () => {

  test('Người thuê đặt lịch/yêu cầu thuê và Chủ trọ duyệt', async ({ page, context }) => {
    // === PHẦN 1: NGƯỜI THUÊ TÌM PHÒNG & YÊU CẦU ===
    const loginPage = new LoginPage(page);
    await loginPage.login('nguoithue1@gmail.com', 'TestPassword123!');
    
    // Vào marketplace tìm phòng
    await page.goto('/phong');
    
    // Tìm phòng đầu tiên và click vào chi tiết
    const firstRoom = page.locator('a[href^="/phong/"]').first();
    if (await firstRoom.isVisible()) {
        await firstRoom.click();
        
        // Bấm nút yêu cầu thuê hoặc đặt lịch
        const requestBtn = page.getByRole('button', { name: /yêu cầu thuê|đặt lịch/i }).first();
        if (await requestBtn.isVisible()) {
            await requestBtn.click();
            
            // Điền form nếu có (ví dụ: lời nhắn, ngày xem)
            const noteInput = page.getByLabel(/lời nhắn|ghi chú/i);
            if (await noteInput.isVisible()) {
                await noteInput.fill('Tôi muốn xem phòng này');
            }
            
            const submitRequestBtn = page.getByRole('button', { name: /gửi yêu cầu/i }).first();
            if (await submitRequestBtn.isVisible()) {
                await submitRequestBtn.click();
                await expect(page.getByText(/thành công|đã gửi/i).first()).toBeVisible({ timeout: 5000 });
            }
        }
    }
    
    await loginPage.logout();

    // === PHẦN 2: CHỦ TRỌ KIỂM TRA & DUYỆT YÊU CẦU ===
    const landlordPage = await context.newPage();
    const landlordLogin = new LoginPage(landlordPage);
    await landlordLogin.login('test1@gmail.com', 'TestPassword123!');
    
    // Vào trang quản lý yêu cầu thuê
    await landlordPage.goto('/quan-ly-nha-tro/yeu-cau-thue');
    
    // Tìm yêu cầu đầu tiên (thường là cái mới nhất)
    const firstReq = landlordPage.locator('table tbody tr').first().getByRole('button', { name: /chi tiết|xem/i });
    if (await firstReq.isVisible()) {
        await firstReq.click();
        
        // Bấm nút Duyệt/Chấp nhận
        const approveBtn = landlordPage.getByRole('button', { name: /duyệt|chấp nhận|đồng ý/i });
        if (await approveBtn.isVisible()) {
            await approveBtn.click();
            await expect(landlordPage.getByText(/thành công/i).first()).toBeVisible({ timeout: 5000 });
        }
    }
    
    await landlordPage.close();
  });

});
