import { Page } from '@playwright/test';

export class PropertyPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async createProperty(name: string, address: string) {
    await this.page.goto('/khu-tro/tao-moi');
    
    await this.page.getByLabel(/tên khu trọ/i).fill(name);
    const selects = this.page.getByRole('combobox');
    await selects.nth(2).click();
    await this.page.getByRole('option', { name: /Thành phố Hà Nội/i }).click();
    await selects.nth(3).click();
    await this.page.getByRole('option', { name: /Phường Ba Đình/i }).click();
    await this.page.getByLabel(/số nhà, tên đường/i).fill(address);
    await this.page.getByRole('listbox').getByRole('button').first().click();
    await this.page.getByTestId('goong-map').waitFor();

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
