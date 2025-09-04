import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Accessibility-first elements with fallbacks for current implementation
  get emailInput(): Locator {
    // Prefer getByLabel, fallback to ID (encourages proper labeling)
    return this.page.getByLabel(/email/i).or(this.page.locator('#email'));
  }

  get passwordInput(): Locator {
    // Prefer getByLabel, fallback to ID (encourages proper labeling)  
    return this.page.getByLabel(/password/i).or(this.page.locator('#password'));
  }

  get loginButton(): Locator {
    // Prefer accessible button, fallback to submit button
    return this.page.getByRole('button', { name: /sign in|login|log in/i })
      .or(this.page.locator('button[type="submit"]'));
  }

  get errorMessage(): Locator {
    // Prefer alert role, fallback to current implementation
    return this.page.getByRole('alert')
      .or(this.page.locator('text=Invalid email or password'));
  }

  get forgotPasswordLink(): Locator {
    // Accessible link selector
    return this.page.getByRole('link', { name: /forgot.*password/i });
  }

  // Page heading for accessibility verification
  get pageHeading(): Locator {
    // Prefer semantic heading, fallback to any heading on login page
    return this.page.getByRole('heading', { name: /sign in|login/i })
      .or(this.page.getByRole('heading').first());
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
    await this.page.waitForSelector(`text=${expectedError}`);
  }
}