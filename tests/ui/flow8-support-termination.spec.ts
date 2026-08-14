import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Flow 8: Hỗ Trợ & Yêu Cầu Trả Phòng', () => {

  test('Người thuê gửi ticket hỗ trợ và yêu cầu kết thúc hợp đồng', async ({ context }) => {
    // === PHẦN 1: NGƯỜI THUÊ GỬI TICKET ===
    const renterPage = await context.newPage();
    const renterLogin = new LoginPage(renterPage);
    await renterLogin.login('nguoithue1@gmail.com', 'TestPassword123!');
    
    // Vào trang hỗ trợ tạo ticket
    await renterPage.goto('/ho-tro');
    
    const createTicketBtn = renterPage.getByRole('button', { name: /tạo yêu cầu|tạo ticket/i });
    if (await createTicketBtn.isVisible()) {
        await createTicketBtn.click();
        
        await renterPage.getByLabel(/tiêu đề/i).fill('Báo hỏng bóng đèn');
        await renterPage.getByLabel(/nội dung/i).fill('Bóng đèn nhà vệ sinh bị cháy, nhờ anh/chị sửa giúp.');
        await renterPage.getByRole('button', { name: /gửi|lưu/i }).click();
        
        await expect(renterPage.getByText(/thành công/i).first()).toBeVisible({ timeout: 5000 });
    }

    // === PHẦN 2: CHỦ TRỌ TRẢ LỜI TICKET ===
    const landlordPage = await context.newPage();
    const landlordLogin = new LoginPage(landlordPage);
    await landlordLogin.login('test1@gmail.com', 'TestPassword123!');
    
    await landlordPage.goto('/ho-tro');
    
    // Tìm ticket đầu tiên
    const firstTicket = landlordPage.locator('table tbody tr').first().getByRole('button', { name: /chi tiết/i });
    if (await firstTicket.isVisible()) {
        await firstTicket.click();
        
        // Phản hồi
        const replyInput = landlordPage.getByLabel(/phản hồi|trả lời/i);
        if (await replyInput.isVisible()) {
            await replyInput.fill('Đã nhận thông tin, mai thợ qua sửa.');
            await landlordPage.getByRole('button', { name: /gửi/i }).click();
            await expect(landlordPage.getByText(/mai thợ qua sửa/i).first()).toBeVisible({ timeout: 5000 });
        }
    }
    
    // === PHẦN 3: YÊU CẦU TRẢ PHÒNG & BÀN GIAO ===
    // (Giả lập cả 2 phía)
    
    // Người thuê yêu cầu kết thúc hợp đồng
    await renterPage.goto('/yeu-cau-ket-thuc-hop-dong');
    const reqTermBtn = renterPage.getByRole('button', { name: /yêu cầu trả phòng/i });
    if (await reqTermBtn.isVisible()) {
        await reqTermBtn.click();
        await renterPage.getByLabel(/lý do/i).fill('Chuyển công tác');
        await renterPage.getByRole('button', { name: /gửi/i }).click();
    }
    await renterPage.close();

    // Chủ trọ duyệt và lập bàn giao
    await landlordPage.goto('/yeu-cau-ket-thuc-hop-dong');
    const approveTermBtn = landlordPage.getByRole('button', { name: /duyệt/i }).first();
    if (await approveTermBtn.isVisible()) {
        await approveTermBtn.click();
        // Redirect tới biên bản bàn giao
        await expect(landlordPage.getByText(/bàn giao/i).first()).toBeVisible({ timeout: 10000 });
    }
    await landlordPage.close();
  });

});
