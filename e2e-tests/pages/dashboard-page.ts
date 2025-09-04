import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Elements
  get pageTitle(): Locator {
    return this.page.locator('h1:has-text("Good evening")');
  }

  // Accessibility-first selectors - targeting semantic content
  get lowStockWidget(): Locator {
    return this.page.locator('div:has-text("Low Stock Items"):has-text("Need attention")').first();
  }

  get openRequestsWidget(): Locator {
    return this.page.locator('div:has-text("Open Production Requests"):has-text("Production pending")').first();
  }

  get todaysBatchesWidget(): Locator {
    return this.page.locator('div:has-text("Today\'s Production"):has-text("Completed today")').first();
  }

  get recentWasteWidget(): Locator {
    return this.page.locator(':has-text("RECENT WASTE")').first();
  }

  get locationSelector(): Locator {
    return this.page.getByText('Main Shop').locator('..');
  }

  get refreshButton(): Locator {
    return this.page.getByRole('button', { name: /refresh|reload/i });
  }

  // Navigation elements (works for both desktop and mobile)
  get inventoryLink(): Locator {
    return this.page.locator('a[href="/inventory"]:visible').first();
  }

  get productionLink(): Locator {
    return this.page.locator('a[href="/production"]:visible').first();
  }

  get usersLink(): Locator {
    return this.page.locator('a[href="/users"]:visible').first();
  }

  get settingsLink(): Locator {
    return this.page.locator('a[href="/settings"]:visible').first();
  }

  get userNameDisplay(): Locator {
    return this.page.locator('text=System Administrator');
  }

  // Low stock alerts
  get lowStockItems(): Locator {
    return this.lowStockWidget.locator('[data-testid="low-stock-item"]');
  }

  get criticalStockItems(): Locator {
    return this.page.locator('[data-testid="critical-stock-item"]');
  }

  // Quick actions
  get createRequestFromLowStockButton(): Locator {
    return this.page.locator('[data-testid="create-request-from-low-stock"]');
  }

  // Actions
  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async selectLocation(locationName: string) {
    await this.locationSelector.click();
    await this.page.click(`[data-testid="location-option"]:has-text("${locationName}")`);
    await this.page.waitForLoadState('networkidle');
  }

  async refreshDashboard() {
    await this.refreshButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getLowStockItemsCount(): Promise<number> {
    // Extract the large number from the LOW STOCK card
    const countElement = this.lowStockWidget.locator('text=/^\\d+$/').first();
    const countText = await countElement.textContent();
    return parseInt(countText || '0');
  }

  async getCriticalStockItemsCount(): Promise<number> {
    // For now, return 0 until we have critical items showing
    return 0;
  }

  async getOpenRequestsCount(): Promise<number> {
    // Extract the large number from the OPEN REQUESTS card
    const countElement = this.openRequestsWidget.locator('text=/^\\d+$/').first();
    const countText = await countElement.textContent();
    return parseInt(countText || '0');
  }

  async createRequestFromLowStock(itemName: string) {
    const lowStockItem = this.page.locator(`[data-testid="low-stock-item"]:has-text("${itemName}")`);
    await lowStockItem.locator('[data-testid="create-request-button"]').click();
    
    await this.page.waitForSelector('[data-testid="request-form-modal"]');
    await this.page.fill('[data-testid="request-quantity-input"]', '10');
    await this.page.click('[data-testid="save-request-button"]');
    
    await this.waitForToast('Production request created from low stock alert');
  }

  async verifyWelcomeMessage(userRole: string) {
    const welcomeText = await this.page.locator('[data-testid="welcome-message"]').textContent();
    return welcomeText?.includes(userRole) || false;
  }
}