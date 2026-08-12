import { test, expect } from '@playwright/test';

test.describe('Guest Workflow', () => {
  test('Khách có thể xem danh sách phòng trên marketplace', async ({ page }) => {
    await page.goto('/');

    // Tìm link đến trang danh sách phòng (marketplace)
    const roomsLink = page.getByRole('link', { name: /Phòng|Tìm phòng/i }).first();
    if (await roomsLink.isVisible()) {
      await roomsLink.click();
      await expect(page).toHaveURL(/.*\/phong/);
    } else {
      // Truy cập trực tiếp nếu không thấy link
      await page.goto('/phong');
    }

    // Xác nhận giao diện danh sách phòng load thành công
    // Giả định có các thẻ bài (card) hoặc text báo hiệu danh sách phòng
    await page.waitForLoadState('networkidle');
    const hasHeading = page.getByRole('heading', { name: /kết quả tìm kiếm/i });
    await expect(hasHeading).toBeVisible();
  });

  test('Khách có thể xem chi tiết một phòng', async ({ page }) => {
    await page.goto('/phong');
    await page.waitForLoadState('networkidle');

    // Giả định click vào phòng đầu tiên
    // Thông thường phòng sẽ có thẻ a bọc ngoài hoặc nút "Xem chi tiết"
    const firstRoomLink = page.locator('a[href*="/phong/"]').first();
    
    if (await firstRoomLink.isVisible()) {
      await firstRoomLink.click();
      
      // Chờ chuyển đến trang chi tiết phòng
      await page.waitForURL(/.*\/phong\/\d+/);
      
      // Xác minh trang chi tiết load lên bằng cách tìm heading hoặc chữ liên quan đến phòng
      await expect(page.getByRole('heading').first()).toBeVisible();
    } else {
      console.log('Không có phòng nào hiển thị để click vào xem chi tiết.');
    }
  });
});
