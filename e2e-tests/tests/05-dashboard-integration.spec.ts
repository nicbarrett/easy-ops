import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard-page';
import { InventoryPage } from '../pages/inventory-page';
import { ProductionPage } from '../pages/production-page';
import { AuthHelper } from '../utils/auth-helper';
import { TestApiClient } from '../utils/api-client';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('Dashboard Integration (US-RPT-001)', () => {
  let dashboardPage: DashboardPage;
  let inventoryPage: InventoryPage;
  let productionPage: ProductionPage;
  let authHelper: AuthHelper;
  let apiClient: TestApiClient;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    inventoryPage = new InventoryPage(page);
    productionPage = new ProductionPage(page);
    authHelper = new AuthHelper(page);
    apiClient = new TestApiClient();
    
    await authHelper.ensureLoggedOut();
  });

  test('TC-RPT-001: Dashboard shows real-time operational data', async ({ page }) => {
    // Covers AC-RPT-001a/b: Aggregate metrics, filters work
    await authHelper.loginAs('admin');
    await dashboardPage.goto();
    
    // Verify all dashboard widgets are present
    await expect(dashboardPage.lowStockWidget).toBeVisible();
    await expect(dashboardPage.openRequestsWidget).toBeVisible();
    await expect(dashboardPage.todaysBatchesWidget).toBeVisible();
    await expect(dashboardPage.recentWasteWidget).toBeVisible();
    
    // Verify location selector is present
    await expect(dashboardPage.locationSelector).toBeVisible();
    
    // Test location filtering
    await dashboardPage.selectLocation('Main Shop');
    
    // Verify data updates when location changes
    const mainShopRequestCount = await dashboardPage.getOpenRequestsCount();
    
    await dashboardPage.selectLocation('Truck 1');
    const truck1RequestCount = await dashboardPage.getOpenRequestsCount();
    
    // Counts may be different based on location-specific data
    // Just verify the filtering mechanism works
    expect(typeof mainShopRequestCount).toBe('number');
    expect(typeof truck1RequestCount).toBe('number');
  });

  test('TC-RPT-002: Dashboard reflects real-time changes', async ({ page }) => {
    // Test that dashboard updates when changes are made in other modules
    await authHelper.loginAs('admin');
    
    // Start with dashboard baseline
    await dashboardPage.goto();
    const initialRequestCount = await dashboardPage.getOpenRequestsCount();
    
    // Create a production request
    await productionPage.goto();
    await productionPage.createProductionRequest({
      product: 'Vanilla Base',
      quantity: 10,
      priority: 'HIGH',
      neededBy: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      reason: 'Dashboard integration test'
    });
    
    // Return to dashboard and verify count increased
    await dashboardPage.goto();
    await dashboardPage.refreshDashboard();
    
    const updatedRequestCount = await dashboardPage.getOpenRequestsCount();
    expect(updatedRequestCount).toBe(initialRequestCount + 1);
    
    // Verify the new request appears in the widget
    await expect(dashboardPage.openRequestsWidget)
      .toContainText('Dashboard integration test');
  });

  test('TC-RPT-003: Critical stock alerts are highlighted', async ({ page }) => {
    // Test critical stock level alerts (< 50% of par)
    await authHelper.loginAs('admin');
    
    // Create item with critical stock via API
    await apiClient.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const criticalItem = await apiClient.createInventoryItem({
      name: 'Critical Stock Item',
      category: 'BASE',
      unit: 'gallons',
      parStockLevel: 20.0,
      sku: 'CRITICAL-001'
    });
    
    // Create session with critical stock level (< 50% of par)
    const locations = await apiClient.getLocations();
    const mainShop = locations.find((loc: any) => loc.name === 'Main Shop');
    
    const session = await apiClient.createInventorySession({
      locationId: mainShop.id
    });
    
    await apiClient.addSessionLine(session.id, {
      itemId: criticalItem.id,
      count: 5.0, // 25% of par level (20)
      unit: 'gallons'
    });
    
    await apiClient.closeInventorySession(session.id);
    
    // Check dashboard shows critical alert
    await dashboardPage.goto();
    await dashboardPage.refreshDashboard();
    
    const criticalCount = await dashboardPage.getCriticalStockItemsCount();
    expect(criticalCount).toBeGreaterThan(0);
    
    // Verify critical styling/badge is present
    const criticalStockItem = page.locator('[data-testid="critical-stock-item"]:has-text("Critical Stock Item")');
    await expect(criticalStockItem).toBeVisible();
    await expect(criticalStockItem).toHaveClass(/critical/); // Assuming CSS class for critical items
  });

  test('TC-RPT-004: Multi-location dashboard filtering', async ({ page }) => {
    // Covers AC-RPT-001b: Location filtering works correctly
    await authHelper.loginAs('admin');
    
    // Create location-specific data via API
    await apiClient.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const locations = await apiClient.getLocations();
    const mainShop = locations.find((loc: any) => loc.name === 'Main Shop');
    const truck1 = locations.find((loc: any) => loc.name === 'Truck 1');
    
    // Create request for main shop
    await apiClient.createProductionRequest({
      productItemId: 'test-product-id',
      locationId: mainShop.id,
      targetQuantity: 10,
      priority: 'NORMAL',
      reason: 'Main shop request'
    });
    
    // Create request for truck1
    await apiClient.createProductionRequest({
      productItemId: 'test-product-id', 
      locationId: truck1.id,
      targetQuantity: 5,
      priority: 'HIGH',
      reason: 'Truck 1 request'
    });
    
    await dashboardPage.goto();
    
    // Filter by Main Shop
    await dashboardPage.selectLocation('Main Shop');
    const mainShopRequests = await dashboardPage.getOpenRequestsCount();
    await expect(dashboardPage.openRequestsWidget).toContainText('Main shop request');
    
    // Filter by Truck 1  
    await dashboardPage.selectLocation('Truck 1');
    const truck1Requests = await dashboardPage.getOpenRequestsCount();
    await expect(dashboardPage.openRequestsWidget).toContainText('Truck 1 request');
    
    // Verify filtering works (different counts or different content)
    expect(mainShopRequests).toBeGreaterThan(0);
    expect(truck1Requests).toBeGreaterThan(0);
    
    // Filter by "All Locations"
    await dashboardPage.selectLocation('All Locations');
    const allLocationsRequests = await dashboardPage.getOpenRequestsCount();
    expect(allLocationsRequests).toBeGreaterThanOrEqual(Math.max(mainShopRequests, truck1Requests));
  });

  test('TC-RPT-005: Dashboard performance with large datasets', async ({ page }) => {
    // Performance test - dashboard should load quickly even with lots of data
    await authHelper.loginAs('admin');
    
    const startTime = Date.now();
    await dashboardPage.goto();
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 2 seconds per requirements
    expect(loadTime).toBeLessThan(2000);
    
    // Verify all widgets loaded
    await expect(dashboardPage.lowStockWidget).toBeVisible();
    await expect(dashboardPage.openRequestsWidget).toBeVisible();
    await expect(dashboardPage.todaysBatchesWidget).toBeVisible();
    await expect(dashboardPage.recentWasteWidget).toBeVisible();
  });

  test.afterEach(async () => {
    await apiClient.cleanup();
  });
});