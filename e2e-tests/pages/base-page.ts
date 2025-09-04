import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common navigation elements
  get dashboardLink(): Locator {
    return this.page.locator('[data-testid="nav-dashboard"]');
  }

  get inventoryLink(): Locator {
    return this.page.locator('[data-testid="nav-inventory"]');
  }

  get productionLink(): Locator {
    return this.page.locator('[data-testid="nav-production"]');
  }

  get usersLink(): Locator {
    return this.page.locator('[data-testid="nav-users"]');
  }

  get settingsLink(): Locator {
    return this.page.locator('[data-testid="nav-settings"]');
  }

  // User menu
  get userMenuButton(): Locator {
    return this.page.locator('[data-testid="user-menu-button"]');
  }

  get userNameDisplay(): Locator {
    return this.page.locator('[data-testid="user-name"]');
  }

  get logoutButton(): Locator {
    return this.page.locator('[data-testid="logout-button"]');
  }

  // Common actions
  async navigateTo(section: 'dashboard' | 'inventory' | 'production' | 'users' | 'settings') {
    switch (section) {
      case 'dashboard':
        await this.dashboardLink.click();
        break;
      case 'inventory':
        await this.inventoryLink.click();
        break;
      case 'production':
        await this.productionLink.click();
        break;
      case 'users':
        await this.usersLink.click();
        break;
      case 'settings':
        await this.settingsLink.click();
        break;
    }
    await this.page.waitForLoadState('networkidle');
  }

  async waitForToast(message?: string) {
    const toastSelector = message 
      ? `[data-testid="toast"]:has-text("${message}")`
      : '[data-testid="toast"]';
    
    await this.page.waitForSelector(toastSelector, { timeout: 5000 });
  }

  async closeToast() {
    await this.page.click('[data-testid="toast-close"]');
  }
}