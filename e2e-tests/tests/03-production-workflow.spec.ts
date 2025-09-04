import { test, expect } from '@playwright/test';
import { ProductionPage } from '../pages/production-page';
import { DashboardPage } from '../pages/dashboard-page';
import { AuthHelper } from '../utils/auth-helper';
import { TestApiClient } from '../utils/api-client';

test.describe('Production Workflow (US-PRO)', () => {
  let productionPage: ProductionPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;
  let apiClient: TestApiClient;

  test.beforeEach(async ({ page }) => {
    productionPage = new ProductionPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);
    apiClient = new TestApiClient();
    
    await authHelper.ensureLoggedOut();
  });

  test('TC-PRO-001: Create production request (US-PRO-001)', async ({ page }) => {
    // Covers AC-PRO-001a/b: Create request with product, quantity, due date
    await authHelper.loginAs('productionLead');
    await productionPage.goto();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const neededBy = tomorrow.toISOString().split('T')[0];
    
    const requestData = {
      product: 'Vanilla Base',
      quantity: 15,
      priority: 'HIGH',
      neededBy: neededBy,
      reason: 'Low stock alert - below par level'
    };
    
    await productionPage.createProductionRequest(requestData);
    
    // Verify request appears in Open column
    const openRequestsCount = await productionPage.getOpenRequestsCount();
    expect(openRequestsCount).toBeGreaterThan(0);
    
    // Verify request details are correct
    const openColumn = productionPage.openRequestsColumn;
    await expect(openColumn).toContainText(requestData.product);
    await expect(openColumn).toContainText(requestData.quantity.toString());
    await expect(openColumn).toContainText('HIGH');
  });

  test('TC-PRO-002: Production request workflow (US-PRO-002)', async ({ page }) => {
    // Covers AC-PRO-002a/b: View open requests, update status
    await authHelper.loginAs('shiftLead');
    
    // First create a request via API
    await apiClient.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const request = await apiClient.createProductionRequest({
      productItemId: 'test-product-id', // You'll need to get real product ID
      locationId: 'test-location-id',   // You'll need to get real location ID
      targetQuantity: 10,
      priority: 'NORMAL',
      reason: 'Regular production cycle',
      neededBy: new Date(Date.now() + 86400000).toISOString() // Tomorrow
    });
    
    await productionPage.goto();
    
    // Verify request is visible in Open column
    const requestCard = await productionPage.getRequestCard(request.id);
    await expect(requestCard).toBeVisible();
    
    // Move to In Progress
    await productionPage.moveRequestToInProgress(request.id);
    
    // Verify it moved to In Progress column
    const inProgressCount = await productionPage.getInProgressRequestsCount();
    expect(inProgressCount).toBeGreaterThan(0);
    
    // Complete the request
    await productionPage.markRequestComplete(request.id);
    
    // Verify it moved to Completed column
    const completedCount = await productionPage.getCompletedRequestsCount();
    expect(completedCount).toBeGreaterThan(0);
  });

  test('TC-PRO-003: Record production batch (US-PRO-004)', async ({ page }) => {
    // Covers AC-PRO-004a/b: Record batch, stock adjusts
    await authHelper.loginAs('productionLead');
    await productionPage.goto();
    
    const batchData = {
      product: 'Vanilla Base',
      quantity: 20,
      location: 'Main Shop'
    };
    
    // Get initial stock level
    await apiClient.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    const initialStock = await apiClient.getCurrentStock();
    const vanillaStock = initialStock.find((stock: any) => 
      stock.item?.name === 'Vanilla Base'
    );
    const initialQuantity = vanillaStock?.quantity || 0;
    
    // Record production batch
    await productionPage.recordProductionBatch(batchData);
    
    // Verify stock increased
    const updatedStock = await apiClient.getCurrentStock();
    const updatedVanillaStock = updatedStock.find((stock: any) => 
      stock.item?.name === 'Vanilla Base'
    );
    const finalQuantity = updatedVanillaStock?.quantity || 0;
    
    expect(finalQuantity).toBe(initialQuantity + batchData.quantity);
  });

  test('TC-PRO-004: Batch run-out tracking (US-PRO-004)', async ({ page }) => {
    // Covers AC-PRO-004a/b: Mark run-out, stock decreases
    await authHelper.loginAs('shiftLead');
    
    // Create a batch first via API
    await apiClient.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const batch = await apiClient.createProductionBatch({
      productItemId: 'test-product-id',
      quantityMade: 10,
      storageLocationId: 'test-location-id',
      notes: 'Test batch for run-out'
    });
    
    await productionPage.goto();
    
    // Get initial stock
    const initialStock = await apiClient.getCurrentStock();
    
    // Run out the batch
    await productionPage.runOutBatch(batch.id);
    
    // Verify stock decreased
    const updatedStock = await apiClient.getCurrentStock();
    // Verify the stock adjustment logic based on your implementation
  });

  test('TC-PRO-005: Waste tracking with reasons (US-PRO-005)', async ({ page }) => {
    // Covers AC-PRO-005a/b: Log waste + reason, deduct & report
    await authHelper.loginAs('shiftLead');
    
    // Create a batch via API
    await apiClient.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    const batch = await apiClient.createProductionBatch({
      productItemId: 'test-product-id',
      quantityMade: 20,
      storageLocationId: 'test-location-id'
    });
    
    await productionPage.goto();
    
    const wasteData = {
      quantity: 5,
      reason: 'TEMPERATURE_EXCURSION'
    };
    
    // Record waste
    await productionPage.recordWaste(batch.id, wasteData);
    
    // Verify waste appears in recent waste widget on dashboard
    await dashboardPage.goto();
    await expect(dashboardPage.recentWasteWidget).toContainText(wasteData.reason);
    await expect(dashboardPage.recentWasteWidget).toContainText(wasteData.quantity.toString());
  });

  test('TC-PRO-006: Create request from low stock alert (US-PRO-003)', async ({ page }) => {
    // Covers AC-PRO-003a/b: Create request from alert, shows source
    await authHelper.loginAs('admin');
    
    // Set up low stock scenario via API
    await apiClient.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Create item with high par level
    const testItem = await apiClient.createInventoryItem({
      name: 'High Par Test Item',
      category: 'BASE',
      unit: 'gallons',
      parStockLevel: 50.0,
      sku: 'HIGH-PAR-001'
    });
    
    // Create session with low count
    const locations = await apiClient.getLocations();
    const mainShop = locations.find((loc: any) => loc.name === 'Main Shop');
    
    const session = await apiClient.createInventorySession({
      locationId: mainShop.id
    });
    
    await apiClient.addSessionLine(session.id, {
      itemId: testItem.id,
      count: 5.0, // Well below par of 50
      unit: 'gallons'
    });
    
    await apiClient.closeInventorySession(session.id);
    
    // Go to dashboard and create request from low stock
    await dashboardPage.goto();
    await dashboardPage.refreshDashboard();
    
    // Verify low stock item appears
    const lowStockCount = await dashboardPage.getLowStockItemsCount();
    expect(lowStockCount).toBeGreaterThan(0);
    
    // Create production request from low stock alert
    await dashboardPage.createRequestFromLowStock('High Par Test Item');
    
    // Verify request was created and linked
    await productionPage.goto();
    const openRequestsCount = await productionPage.getOpenRequestsCount();
    expect(openRequestsCount).toBeGreaterThan(0);
  });

  test.afterEach(async () => {
    await apiClient.cleanup();
  });
});