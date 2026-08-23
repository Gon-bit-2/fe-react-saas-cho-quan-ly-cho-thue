import { test as setup } from '@playwright/test';

// const authFileLandlord = 'tests/ui/.auth/landlord.json';
// const authFileTenant = 'tests/ui/.auth/tenant.json';

setup('authenticate as landlord', () => {
  // TODO: Viết logic giả lập UI đăng nhập cho Landlord và lưu storageState
  // await page.goto('/dang-nhap');
  // await page.getByPlaceholder(/email/i).fill('test1@gmail.com');
  // await page.getByPlaceholder(/mật khẩu|password/i).fill('TestPassword123!');
  // await page.getByRole('button', { name: /đăng nhập/i }).click();
  // await page.waitForURL('/');
  // await page.context().storageState({ path: authFileLandlord });
});

setup('authenticate as tenant', () => {
  // TODO: Viết logic giả lập UI đăng nhập cho Tenant và lưu storageState
  // await page.goto('/dang-nhap');
  // await page.getByPlaceholder(/email/i).fill('nguoithue1@gmail.com');
  // await page.getByPlaceholder(/mật khẩu|password/i).fill('TestPassword123!');
  // await page.getByRole('button', { name: /đăng nhập/i }).click();
  // await page.waitForURL('/');
  // await page.context().storageState({ path: authFileTenant });
});
