import { Page } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

export class AuthHelper {
  constructor(private page: Page) {}

  async loginAs(userType: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userType];
    
    await this.page.goto('/login');
    await this.page.fill('#email', user.email);
    await this.page.fill('#password', user.password);
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('/dashboard');
    
    // Verify user is logged in by checking for dashboard content instead of user name
    // User name may be hidden on mobile
    await this.page.waitForSelector('h1:has-text("Good evening")');
  }

  async logout() {
    await this.page.click('button[aria-label="User menu"]');
    await this.page.click('button:has-text("Sign Out")');
    await this.page.waitForURL('/login');
  }

  async ensureLoggedOut() {
    // Navigate to login page first to establish context
    await this.page.goto('/login');
    
    // Clear any stored auth tokens from the correct context
    try {
      await this.page.evaluate(() => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.clear();
        }
      });
    } catch (error) {
      // Ignore localStorage access errors - just ensure we're on login page
    }
  }
}