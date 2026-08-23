import { Page, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyDashboardLoaded() {
    // Chờ dashboard load xong
    await this.page.waitForURL('**/tong-quan');
    // Kiểm tra sidebar hoặc header (có thể đổi tuỳ UI thực tế)
    await expect(this.page.getByRole('heading', { name: /tổng quan/i }).first()).toBeVisible({ timeout: 10000 });
  }

  async selectTenant(tenantName: string) {
    await this.page.goto('/tai-khoan/chon-nha-tro');
    
    // Nếu UI là list các tenant đã có
    const tenantCard = this.page.getByText(tenantName).first();
    if (await tenantCard.isVisible()) {
      await tenantCard.click();
    }
  }

  async createNewTenant(tenantName: string) {
    await this.page.goto('/tai-khoan/chon-nha-tro');
    
    // Tìm nút thêm mới nhà trọ
    await this.page.getByRole('button', { name: /thêm nhà trọ|tạo mới/i }).click();
    
    // Điền thông tin nhà trọ
    await this.page.getByLabel(/tên nhà trọ/i).fill(tenantName);
    
    // Bấm lưu/tạo
    await this.page.getByRole('button', { name: /lưu|tạo/i }).click();
    
    // Thường sẽ redirect sang trang tổng quan của nhà trọ đó
    await this.verifyDashboardLoaded();
  }
}
