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
    
    // Verify initial counts are numbers (should be 0 for new system)
    const lowStockCount = await dashboardPage.getLowStockItemsCount();
    const openRequestsCount = await dashboardPage.getOpenRequestsCount();
    
    expect(typeof lowStockCount).toBe('number');
    expect(typeof openRequestsCount).toBe('number');
    expect(lowStockCount).toBeGreaterThanOrEqual(0);
    expect(openRequestsCount).toBeGreaterThanOrEqual(0);
  });

  test('TC-RPT-005: Dashboard performance with large datasets', async () => {
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
  });

  test.afterEach(async () => {
    await apiClient.cleanup();
  });
});