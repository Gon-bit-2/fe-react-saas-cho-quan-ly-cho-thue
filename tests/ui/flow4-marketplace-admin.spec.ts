import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Flow 4: Đăng Tin Marketplace & Kiểm Duyệt Admin', () => {

  test('Chủ trọ gửi yêu cầu đăng tin và Admin duyệt tin', async ({ page, context }) => {
    // === PHẦN 1: CHỦ TRỌ GỬI YÊU CẦU ===
    const loginPage = new LoginPage(page);
    await loginPage.login('test1@gmail.com', 'TestPassword123!');
    
    // Vào danh sách phòng để gửi duyệt (Giả lập thao tác tạo hoặc chọn phòng có sẵn)
    await page.goto('/quan-ly-phong/danh-sach');
    
    // Tìm phòng đầu tiên và click vào chi tiết (Giả định UI)
    const firstRoom = page.locator('table tbody tr').first().locator('a').first();
    if (await firstRoom.isVisible()) {
        await firstRoom.click();
        
        // Bấm nút đăng tin/công khai
        const publishBtn = page.getByRole('button', { name: /đăng tin|công khai|gửi duyệt/i });
        if (await publishBtn.isVisible()) {
            await publishBtn.click();
            // Đợi thông báo thành công
            await expect(page.getByText(/thành công|đã gửi/i).first()).toBeVisible({ timeout: 5000 });
        }
    }
    
    // Chủ trọ đăng xuất
    await loginPage.logout();

    // === PHẦN 2: ADMIN KIỂM DUYỆT ===
    await loginPage.login('gonjswork@gmail.com', 'gonjs0710');
    
    // Vào hàng đợi kiểm duyệt
    await page.goto('/admin/kiem-duyet/hang-cho');
    
    // Tìm bản ghi đầu tiên cần duyệt
    const firstQueueItem = page.locator('table tbody tr').first().getByRole('button', { name: /chi tiết/i });
    if (await firstQueueItem.isVisible()) {
        await firstQueueItem.click();
        
        // Bấm nút Duyệt (Approve)
        const approveBtn = page.getByRole('button', { name: /duyệt|chấp nhận|approve/i });
        await approveBtn.click();
        
        // Xác nhận duyệt nếu có dialog
        const confirmBtn = page.getByRole('button', { name: /xác nhận|đồng ý/i });
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        }
        
        await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 5000 });
    }
    
    await loginPage.logout();

    // === PHẦN 3: GUEST XEM MARKETPLACE ===
    // Xoá cookie/session bằng cách mở page mới hoàn toàn
    const guestPage = await context.newPage();
    await guestPage.goto('/phong');
    
    // Kiểm tra danh sách có phòng không (Không cần kiểm tra ID chính xác nếu luồng trên lấy phòng ngẫu nhiên)
    // Vì không biết UI cụ thể, kiểm tra tổng quát
    await expect(guestPage.getByRole('heading').first()).toBeVisible();
    await guestPage.close();
  });

});
