import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class InventoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Elements
  get pageTitle(): Locator {
    return this.page.locator('h1:has-text("Inventory Management")');
  }

  get addItemButton(): Locator {
    return this.page.locator('[data-testid="add-item-button"]');
  }

  get searchInput(): Locator {
    return this.page.locator('[data-testid="inventory-search"]');
  }

  get itemCards(): Locator {
    return this.page.locator('[data-testid="inventory-item-card"]');
  }

  get emptyState(): Locator {
    return this.page.locator('[data-testid="inventory-empty-state"]');
  }

  // Item form elements
  get itemNameInput(): Locator {
    return this.page.locator('[data-testid="item-name-input"]');
  }

  get itemCategorySelect(): Locator {
    return this.page.locator('[data-testid="item-category-select"]');
  }

  get itemUnitInput(): Locator {
    return this.page.locator('[data-testid="item-unit-input"]');
  }

  get itemParLevelInput(): Locator {
    return this.page.locator('[data-testid="item-par-level-input"]');
  }

  get itemLocationSelect(): Locator {
    return this.page.locator('[data-testid="item-location-select"]');
  }

  get itemSkuInput(): Locator {
    return this.page.locator('[data-testid="item-sku-input"]');
  }

  get saveItemButton(): Locator {
    return this.page.locator('[data-testid="save-item-button"]');
  }

  get cancelItemButton(): Locator {
    return this.page.locator('[data-testid="cancel-item-button"]');
  }

  // Actions
  async goto() {
    await this.page.goto('/inventory');
    await this.page.waitForLoadState('networkidle');
  }

  async searchForItem(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Debounce
  }

  async getItemCard(itemName: string): Promise<Locator> {
    return this.page.locator(`[data-testid="inventory-item-card"]:has-text("${itemName}")`);
  }

  async openAddItemModal() {
    await this.addItemButton.click();
    await this.page.waitForSelector('[data-testid="item-form-modal"]');
  }

  async createItem(itemData: {
    name: string;
    category: string;
    unit: string;
    parStockLevel: number;
    sku?: string;
    notes?: string;
  }) {
    await this.openAddItemModal();
    
    await this.itemNameInput.fill(itemData.name);
    await this.itemCategorySelect.selectOption(itemData.category);
    await this.itemUnitInput.fill(itemData.unit);
    await this.itemParLevelInput.fill(itemData.parStockLevel.toString());
    
    if (itemData.sku) {
      await this.itemSkuInput.fill(itemData.sku);
    }
    
    await this.saveItemButton.click();
    await this.waitForToast('Item created successfully');
  }

  async editItem(itemName: string, updates: any) {
    const itemCard = await this.getItemCard(itemName);
    await itemCard.locator('[data-testid="edit-item-button"]').click();
    
    await this.page.waitForSelector('[data-testid="item-form-modal"]');
    
    if (updates.name) {
      await this.itemNameInput.fill(updates.name);
    }
    if (updates.parStockLevel) {
      await this.itemParLevelInput.fill(updates.parStockLevel.toString());
    }
    
    await this.saveItemButton.click();
    await this.waitForToast('Item updated successfully');
  }

  async deleteItem(itemName: string) {
    const itemCard = await this.getItemCard(itemName);
    await itemCard.locator('[data-testid="delete-item-button"]').click();
    
    await this.page.waitForSelector('[data-testid="delete-confirmation-modal"]');
    await this.page.click('[data-testid="confirm-delete-button"]');
    await this.waitForToast('Item deleted successfully');
  }

  async getItemCount(): Promise<number> {
    await this.page.waitForSelector('[data-testid="inventory-item-card"], [data-testid="inventory-empty-state"]');
    return await this.itemCards.count();
  }
}