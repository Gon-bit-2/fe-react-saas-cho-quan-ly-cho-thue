import { Page, expect } from '@playwright/test';

export class PropertyPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async createProperty(name: string, address: string) {
    await this.page.goto('/khu-tro/tao-moi');
    
    // Form tạo khu trọ
    await this.page.getByLabel(/tên khu trọ/i).fill(name);
    await this.page.getByLabel(/địa chỉ/i).fill(address);
    // Có thể có các trường khác như mô tả
    const desc = this.page.getByLabel(/mô tả/i);
    if (await desc.isVisible()) {
        await desc.fill(`Mô tả cho ${name}`);
    }

    await this.page.getByRole('button', { name: /lưu|tạo mới/i }).click();
    
    // Đợi redirect sang trang danh sách
    await this.page.waitForURL('**/khu-tro');
  }

  async createRoom(roomNumber: string, propertyName: string, price: string, area: string) {
    await this.page.goto('/quan-ly-phong/tao-moi');
    
    // Chọn khu trọ (Dropdown hoặc Select)
    // Giả định dùng shadcn select
    const selectProperty = this.page.getByRole('combobox', { name: /chọn khu trọ/i }).first();
    if (await selectProperty.isVisible()) {
        await selectProperty.click();
        await this.page.getByRole('option', { name: new RegExp(propertyName, 'i') }).click();
    }

    // Điền số phòng, giá, diện tích
    await this.page.getByLabel(/số phòng|tên phòng/i).fill(roomNumber);
    await this.page.getByLabel(/giá/i).fill(price);
    await this.page.getByLabel(/diện tích/i).fill(area);

    await this.page.getByRole('button', { name: /lưu|tạo mới/i }).click();
    
    // Đợi redirect sang trang danh sách phòng
    await this.page.waitForURL('**/quan-ly-phong/danh-sach');
  }
}
