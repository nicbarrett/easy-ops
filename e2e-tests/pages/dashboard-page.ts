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

  get lowStockWidget(): Locator {
    return this.page.locator(':has-text("LOW STOCK ITEMS")');
  }

  get openRequestsWidget(): Locator {
    return this.page.locator(':has-text("OPEN REQUESTS")');
  }

  get todaysBatchesWidget(): Locator {
    return this.page.locator(':has-text("TODAY\'S BATCHES")');
  }

  get recentWasteWidget(): Locator {
    return this.page.locator('[data-testid="recent-waste-widget"]');
  }

  get locationSelector(): Locator {
    return this.page.locator('[data-testid="location-selector"]');
  }

  get refreshButton(): Locator {
    return this.page.locator('[data-testid="refresh-dashboard"]');
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
    await this.page.waitForSelector('[data-testid="low-stock-widget"]');
    return await this.lowStockItems.count();
  }

  async getCriticalStockItemsCount(): Promise<number> {
    return await this.criticalStockItems.count();
  }

  async getOpenRequestsCount(): Promise<number> {
    await this.page.waitForSelector('[data-testid="open-requests-widget"]');
    return await this.openRequestsWidget.locator('[data-testid="request-item"]').count();
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