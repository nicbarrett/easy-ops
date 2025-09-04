import { test, expect, devices } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { InventoryPage } from '../pages/inventory-page';
import { DashboardPage } from '../pages/dashboard-page';
import { AuthHelper } from '../utils/auth-helper';

// Configure mobile device for all tests in this file
test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Responsive Design (US-OPS-002)', () => {

  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);
    
    await authHelper.ensureLoggedOut();
  });

  test('TC-OPS-004: Mobile login experience', async ({ page }) => {
    await loginPage.goto();
    
    // Verify mobile-optimized login form
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    
    // Test login on mobile
    await authHelper.loginAs('shiftLead');
    
    // Verify mobile navigation is accessible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
  });

  test('TC-OPS-005: Mobile inventory management', async ({ page }) => {
    // Covers AC-OPS-002a/b: Complete tasks via mobile, instant updates
    await authHelper.loginAs('shiftLead');
    await inventoryPage.goto();
    
    // Verify mobile-optimized inventory grid
    await expect(inventoryPage.pageTitle).toBeVisible();
    
    // Test mobile search
    await inventoryPage.searchForItem('Vanilla');
    const itemCount = await inventoryPage.getItemCount();
    expect(itemCount).toBeGreaterThan(0);
    
    // Verify item cards are mobile-friendly
    const firstItem = inventoryPage.itemCards.first();
    await expect(firstItem).toBeVisible();
    
    // Verify mobile navigation menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
    
    // Test navigation
    await page.click('[data-testid="mobile-nav-production"]');
    await page.waitForURL('/production');
  });

  test('TC-OPS-006: Mobile dashboard widgets', async ({ page }) => {
    await authHelper.loginAs('admin');
    await dashboardPage.goto();
    
    // Verify widgets stack properly on mobile
    await expect(dashboardPage.lowStockWidget).toBeVisible();
    await expect(dashboardPage.openRequestsWidget).toBeVisible();
    
    // Test mobile-specific interactions
    await dashboardPage.refreshDashboard();
    
    // Verify touch-friendly buttons
    const lowStockCount = await dashboardPage.getLowStockItemsCount();
    if (lowStockCount > 0) {
      // Test quick action buttons are appropriately sized for touch
      const createRequestButton = page.locator('[data-testid="create-request-from-low-stock"]').first();
      const buttonSize = await createRequestButton.boundingBox();
      
      // Minimum touch target size should be 44x44px per accessibility guidelines
      expect(buttonSize?.height).toBeGreaterThanOrEqual(44);
      expect(buttonSize?.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('TC-OPS-007: Mobile form interactions', async ({ page }) => {
    await authHelper.loginAs('productionLead');
    await inventoryPage.goto();
    
    // Test mobile form modal
    await inventoryPage.openAddItemModal();
    
    // Verify form is mobile-optimized
    await expect(inventoryPage.itemNameInput).toBeVisible();
    await expect(inventoryPage.itemCategorySelect).toBeVisible();
    
    // Test form validation on mobile
    await inventoryPage.saveItemButton.click();
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    
    // Fill form and submit
    await inventoryPage.itemNameInput.fill('Mobile Test Item');
    await inventoryPage.itemCategorySelect.selectOption('MIX_IN');
    await inventoryPage.itemUnitInput.fill('lbs');
    await inventoryPage.itemParLevelInput.fill('10');
    
    await inventoryPage.saveItemButton.click();
    await inventoryPage.waitForToast('Item created successfully');
    
    // Verify modal closes on mobile
    await expect(page.locator('[data-testid="item-form-modal"]')).not.toBeVisible();
  });

  test('TC-OPS-008: Mobile viewport breakpoints', async ({ page }) => {
    // Test different mobile viewport sizes
    const viewports = [
      { width: 360, height: 640, name: 'Small Mobile' },
      { width: 414, height: 896, name: 'Large Mobile' },
      { width: 768, height: 1024, name: 'Tablet' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await authHelper.loginAs('admin');
      await dashboardPage.goto();
      
      // Verify layout adapts to viewport
      await expect(dashboardPage.pageTitle).toBeVisible();
      
      // Test navigation at different sizes
      if (viewport.width <= 768) {
        // Mobile navigation should be hamburger menu
        await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      } else {
        // Desktop navigation should be sidebar
        await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
      }
      
      await authHelper.logout();
    }
  });
});