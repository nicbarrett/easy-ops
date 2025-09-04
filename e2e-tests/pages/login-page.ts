import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Elements
  get emailInput(): Locator {
    return this.page.locator('#email');
  }

  get passwordInput(): Locator {
    return this.page.locator('#password');
  }

  get loginButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[class*="error"]');
  }

  get forgotPasswordLink(): Locator {
    return this.page.locator('[data-testid="forgot-password-link"]');
  }

  // Actions
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Wait for navigation or error
    await Promise.race([
      this.page.waitForURL('/dashboard'),
      this.errorMessage.waitFor()
    ]);
  }

  async loginAndExpectSuccess(email: string, password: string) {
    await this.login(email, password);
    await this.page.waitForURL('/dashboard');
  }

  async loginAndExpectError(email: string, password: string, expectedError: string) {
    await this.login(email, password);
    await this.page.waitForSelector(`[class*="error"]:has-text("${expectedError}")`);
  }
}