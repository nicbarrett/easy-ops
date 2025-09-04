import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/inventory-page';
import { AuthHelper } from '../utils/auth-helper';
import { TestApiClient } from '../utils/api-client';

test.describe('Inventory Sessions (US-INV-002, US-INV-007)', () => {
  let inventoryPage: InventoryPage;
  let authHelper: AuthHelper;
  let apiClient: TestApiClient;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    authHelper = new AuthHelper(page);
    apiClient = new TestApiClient();
    
    await authHelper.ensureLoggedOut();
  });

  test('TC-INV-008: Complete inventory session workflow', async ({ page }) => {
    // Covers AC-INV-002a/b/c: Complete session, stock updates
    await authHelper.loginAs('shiftLead');
    
    // Navigate to inventory sessions
    await page.goto('/inventory/sessions');
    await page.waitForLoadState('networkidle');
    
    // Start new session
    await page.click('[data-testid="start-session-button"]');
    await page.waitForSelector('[data-testid="session-form-modal"]');
    
    // Select location
    await page.selectOption('[data-testid="session-location-select"]', 'Main Shop');
    await page.click('[data-testid="create-session-button"]');
    await page.waitForSelector('[data-testid="session-details-page"]');
    
    // Add line items with counts
    const sessionItems = [
      { name: 'Vanilla Base', count: 8 },
      { name: 'Chocolate Chips', count: 3 },
      { name: 'Pint Containers', count: 150 }
    ];
    
    for (const item of sessionItems) {
      await page.click('[data-testid="add-line-button"]');
      await page.waitForSelector('[data-testid="line-form"]');
      
      await page.selectOption('[data-testid="line-item-select"]', item.name);
      await page.fill('[data-testid="line-count-input"]', item.count.toString());
      await page.click('[data-testid="save-line-button"]');
      
      // Verify line appears in session
      await expect(page.locator(`[data-testid="session-line"]:has-text("${item.name}")`))
        .toContainText(item.count.toString());
    }
    
    // Submit session
    await page.click('[data-testid="submit-session-button"]');
    await page.waitForSelector('[data-testid="submit-confirmation-modal"]');
    await page.click('[data-testid="confirm-submit-button"]');
    
    // Verify session is closed and immutable
    await page.waitForSelector('[data-testid="session-status"]:has-text("CLOSED")');
    await expect(page.locator('[data-testid="add-line-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="edit-line-button"]')).not.toBeVisible();
  });

  test('TC-INV-009: Draft session editing (US-INV-007)', async ({ page }) => {
    // Covers AC-INV-007a/b/c: Edit draft, immutable after submit
    await authHelper.loginAs('shiftLead');
    
    // Create session via API
    await apiClient.login(TEST_USERS.shiftLead.email, TEST_USERS.shiftLead.password);
    
    const locations = await apiClient.getLocations();
    const mainShop = locations.find((loc: any) => loc.name === 'Main Shop');
    
    const session = await apiClient.createInventorySession({
      locationId: mainShop.id
    });
    
    // Navigate to session
    await page.goto(`/inventory/sessions/${session.id}`);
    await page.waitForLoadState('networkidle');
    
    // Add initial line item
    await page.click('[data-testid="add-line-button"]');
    await page.selectOption('[data-testid="line-item-select"]', 'Vanilla Base');
    await page.fill('[data-testid="line-count-input"]', '5');
    await page.click('[data-testid="save-line-button"]');
    
    // Edit the line item (should be possible in draft)
    await page.click('[data-testid="edit-line-button"]');
    await page.fill('[data-testid="line-count-input"]', '10');
    await page.click('[data-testid="save-line-button"]');
    
    // Verify edit was saved
    await expect(page.locator('[data-testid="session-line"]:has-text("Vanilla Base")'))
      .toContainText('10');
    
    // Submit session
    await page.click('[data-testid="submit-session-button"]');
    await page.click('[data-testid="confirm-submit-button"]');
    
    // Verify session is now immutable
    await page.waitForSelector('[data-testid="session-status"]:has-text("CLOSED")');
    await expect(page.locator('[data-testid="edit-line-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="add-line-button"]')).not.toBeVisible();
    
    // Verify immutable warning message
    await expect(page.locator('[data-testid="immutable-session-warning"]'))
      .toContainText('This session has been submitted and cannot be edited');
  });

  test('TC-INV-010: Photo attachment to line items (US-INV-003)', async ({ page }) => {
    // Covers AC-INV-003a/b: Upload images, images in history
    await authHelper.loginAs('shiftLead');
    
    // Create session
    await apiClient.login(TEST_USERS.shiftLead.email, TEST_USERS.shiftLead.password);
    const locations = await apiClient.getLocations();
    const mainShop = locations.find((loc: any) => loc.name === 'Main Shop');
    
    const session = await apiClient.createInventorySession({
      locationId: mainShop.id
    });
    
    await page.goto(`/inventory/sessions/${session.id}`);
    
    // Add line item with photo
    await page.click('[data-testid="add-line-button"]');
    await page.selectOption('[data-testid="line-item-select"]', 'Vanilla Base');
    await page.fill('[data-testid="line-count-input"]', '8');
    
    // Upload photo (create a small test image)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );
    
    await page.setInputFiles('[data-testid="line-photo-input"]', {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: testImageBuffer
    });
    
    // Verify photo preview appears
    await expect(page.locator('[data-testid="photo-preview"]')).toBeVisible();
    
    await page.click('[data-testid="save-line-button"]');
    
    // Verify line item shows photo indicator
    const lineItem = page.locator('[data-testid="session-line"]:has-text("Vanilla Base")');
    await expect(lineItem.locator('[data-testid="photo-indicator"]')).toBeVisible();
    
    // Submit session
    await page.click('[data-testid="submit-session-button"]');
    await page.click('[data-testid="confirm-submit-button"]');
    
    // Navigate to session history and verify photo is accessible
    await page.goto('/inventory/sessions');
    await page.click(`[data-testid="session-link-${session.id}"]`);
    
    // Verify photo is still visible in closed session
    await expect(lineItem.locator('[data-testid="photo-indicator"]')).toBeVisible();
    
    // Click to view full photo
    await lineItem.locator('[data-testid="view-photo-button"]').click();
    await expect(page.locator('[data-testid="photo-modal"]')).toBeVisible();
  });

  test('TC-INV-011: Session permissions by role', async ({ page }) => {
    // Test different roles can access sessions appropriately
    
    // Team Member - can view but not create sessions
    await authHelper.loginAs('teamMember');
    await page.goto('/inventory/sessions');
    
    // Should see sessions list but no create button
    await expect(page.locator('[data-testid="sessions-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-session-button"]')).not.toBeVisible();
    
    await authHelper.logout();
    
    // Shift Lead - can create and manage sessions
    await authHelper.loginAs('shiftLead');
    await page.goto('/inventory/sessions');
    
    await expect(page.locator('[data-testid="start-session-button"]')).toBeVisible();
    
    // Can start new session
    await page.click('[data-testid="start-session-button"]');
    await expect(page.locator('[data-testid="session-form-modal"]')).toBeVisible();
  });

  test.afterEach(async () => {
    await apiClient.cleanup();
  });
});