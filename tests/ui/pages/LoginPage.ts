import { Page, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async gotoLogin() {
    await this.page.goto('/dang-nhap')
  }

  async gotoRegister() {
    await this.page.goto('/dang-ky')
  }

  async login(email: string, pass: string) {
    await this.gotoLogin()
    await this.page.getByLabel(/email/i).fill(email)
    await this.page.getByLabel(/mật khẩu|password/i).fill(pass)
    await this.page.getByRole('button', { name: /đăng nhập/i }).click()
  }

  async register(name: string, email: string, phone: string, pass: string) {
    await this.gotoRegister()
    // Tùy thuộc vào nhãn (label) thực tế trên form đăng ký.
    await this.page.getByLabel(/họ và tên|name/i).fill(name)
    await this.page.getByLabel(/email/i).fill(email)
    // Có thể form cần số điện thoại
    const phoneInput = this.page.getByLabel(/số điện thoại|phone/i)
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(phone)
    }

    await this.page
      .getByLabel(/mật khẩu|password/i)
      .first()
      .fill(pass)

    // Nếu có confirm password
    const confirmPass = this.page.getByLabel(/xác nhận mật khẩu/i)
    if (await confirmPass.isVisible()) {
      await confirmPass.fill(pass)
    }

    // Checkbox điều khoản
    const termsCheckbox = this.page.getByLabel(/tôi đồng ý/i)
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check()
    }

    await this.page.getByRole('button', { name: /đăng ký|tạo tài khoản/i }).click()
  }

  async logout() {
    // Điều hướng tới trang tài khoản để lấy nút đăng xuất (nếu flow yêu cầu thế)
    await this.page.goto('/tai-khoan')
    await this.page.getByRole('button', { name: /đăng xuất/i }).click()
    // Đợi về trang chủ
    await this.page.waitForURL('/')
  }
}
