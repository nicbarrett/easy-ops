import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/inventory-page';
import { DashboardPage } from '../pages/dashboard-page';
import { AuthHelper } from '../utils/auth-helper';
import { TestApiClient } from '../utils/api-client';

test.describe('Inventory Management (US-INV)', () => {
  let inventoryPage: InventoryPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;
  let apiClient: TestApiClient;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);
    apiClient = new TestApiClient();
    
    // Login as admin for inventory management
    await authHelper.ensureLoggedOut();
    await authHelper.loginAs('admin');
  });

  test('TC-INV-001: Create inventory item (US-INV-001)', async ({ page }) => {
    // Covers AC-INV-001a/b/c: Create inventory session capability
    await inventoryPage.goto();
    
    const itemData = {
      name: 'Test Strawberry Base',
      category: 'BASE',
      unit: 'gallons', 
      parStockLevel: 8,
      sku: 'STRAWB-001'
    };
    
    await inventoryPage.createItem(itemData);
    
    // Verify item appears in list
    const itemCard = await inventoryPage.getItemCard(itemData.name);
    await expect(itemCard).toBeVisible();
    await expect(itemCard).toContainText(itemData.sku);
    await expect(itemCard).toContainText(`${itemData.parStockLevel} ${itemData.unit}`);
  });

  test('TC-INV-002: Inventory search functionality', async ({ page }) => {
    await inventoryPage.goto();
    
    // Search by name
    await inventoryPage.searchForItem('Vanilla');
    await expect(await inventoryPage.getItemCard('Vanilla Base')).toBeVisible();
    
    // Search by SKU
    await inventoryPage.searchForItem('CHOC-CHIP');
    await expect(await inventoryPage.getItemCard('Chocolate Chips')).toBeVisible();
    
    // Search by category
    await inventoryPage.searchForItem('packaging');
    const itemCount = await inventoryPage.getItemCount();
    expect(itemCount).toBeGreaterThan(0);
    
    // Clear search
    await inventoryPage.searchForItem('');
  });

  test('TC-INV-003: Edit existing inventory item', async ({ page }) => {
    await inventoryPage.goto();
    
    const originalParLevel = 10;
    const newParLevel = 15;
    
    // Edit vanilla base par level
    await inventoryPage.editItem('Vanilla Base', {
      parStockLevel: newParLevel
    });
    
    // Verify change is reflected
    const itemCard = await inventoryPage.getItemCard('Vanilla Base');
    await expect(itemCard).toContainText(`${newParLevel} gallons`);
  });

  test('TC-INV-004: Delete inventory item with confirmation', async ({ page }) => {
    await inventoryPage.goto();
    
    // First create a test item to delete
    await inventoryPage.createItem({
      name: 'Test Delete Item',
      category: 'MIX_IN',
      unit: 'oz',
      parStockLevel: 5
    });
    
    // Count items before deletion
    const initialCount = await inventoryPage.getItemCount();
    
    // Delete the test item
    await inventoryPage.deleteItem('Test Delete Item');
    
    // Verify item is removed
    const finalCount = await inventoryPage.getItemCount();
    expect(finalCount).toBe(initialCount - 1);
    
    // Verify item no longer appears in search
    await inventoryPage.searchForItem('Test Delete Item');
    const itemCard = inventoryPage.page.locator('[data-testid="inventory-item-card"]:has-text("Test Delete Item")');
    await expect(itemCard).not.toBeVisible();
  });

  test('TC-INV-005: Inventory permissions by role', async ({ page }) => {
    // Test as Team Member - should have read-only access
    await authHelper.logout();
    await authHelper.loginAs('teamMember');
    
    await inventoryPage.goto();
    
    // Should see inventory items
    await expect(inventoryPage.pageTitle).toBeVisible();
    const itemCount = await inventoryPage.getItemCount();
    expect(itemCount).toBeGreaterThan(0);
    
    // Should NOT see add button (read-only)
    await expect(inventoryPage.addItemButton).not.toBeVisible();
    
    // Should NOT see edit/delete buttons on items
    const firstItem = inventoryPage.itemCards.first();
    await expect(firstItem.locator('[data-testid="edit-item-button"]')).not.toBeVisible();
    await expect(firstItem.locator('[data-testid="delete-item-button"]')).not.toBeVisible();
  });

  test('TC-INV-006: Low stock alert integration with dashboard', async ({ page }) => {
    // Create an item with low stock via API
    await apiClient.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const lowStockItem = {
      name: 'Low Stock Test Item',
      category: 'BASE',
      unit: 'gallons',
      parStockLevel: 20.0,
      sku: 'LOW-STOCK-001'
    };
    
    await apiClient.createInventoryItem(lowStockItem);
    
    // Create inventory session with count below par
    const locations = await apiClient.getLocations();
    const mainShop = locations.find((loc: any) => loc.name === 'Main Shop');
    
    const session = await apiClient.createInventorySession({
      locationId: mainShop.id
    });
    
    const items = await apiClient.getInventoryItems();
    const testItem = items.find((item: any) => item.name === lowStockItem.name);
    
    // Add count below par level
    await apiClient.addSessionLine(session.id, {
      itemId: testItem.id,
      count: 5.0, // Below par level of 20
      unit: lowStockItem.unit
    });
    
    await apiClient.closeInventorySession(session.id);
    
    // Check dashboard shows low stock alert
    await dashboardPage.goto();
    await dashboardPage.refreshDashboard();
    
    const lowStockCount = await dashboardPage.getLowStockItemsCount();
    expect(lowStockCount).toBeGreaterThan(0);
    
    // Verify the specific item appears in low stock
    await expect(dashboardPage.lowStockWidget).toContainText(lowStockItem.name);
  });
});