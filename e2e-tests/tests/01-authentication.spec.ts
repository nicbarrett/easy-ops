import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard-page';
import { AuthHelper } from '../utils/auth-helper';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('Authentication & Authorization (US-ADM)', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);
    
    await authHelper.ensureLoggedOut();
  });

  test('TC-ADM-001: Admin login and role verification', async ({ page, browserName, isMobile }) => {
    // Covers AC-ADM-001a: Admin can login and access admin features
    await loginPage.goto();
    
    await loginPage.loginAndExpectSuccess(
      TEST_USERS.admin.email, 
      TEST_USERS.admin.password
    );
    
    // Verify admin is on dashboard
    await expect(dashboardPage.pageTitle).toBeVisible();
    
    // For mobile devices, open the mobile menu to access navigation
    if (isMobile || (await page.viewportSize())!.width < 1024) {
      await page.locator('button[aria-label="Toggle menu"]').click();
      await page.waitForTimeout(500); // Allow animation to complete
    }
    
    // Verify admin has access to all navigation items
    await expect(dashboardPage.inventoryLink).toBeVisible();
    await expect(dashboardPage.productionLink).toBeVisible();
    await expect(dashboardPage.usersLink).toBeVisible();
    await expect(dashboardPage.settingsLink).toBeVisible();
  });

  test('TC-ADM-002: Role-based navigation restrictions', async ({ page, isMobile }) => {
    // Test different user roles have appropriate access
    
    // Team Member - limited access
    await loginPage.goto();
    await loginPage.loginAndExpectSuccess(
      TEST_USERS.teamMember.email,
      TEST_USERS.teamMember.password
    );
    
    // For mobile devices, open the mobile menu to access navigation
    if (isMobile || (await page.viewportSize())!.width < 1024) {
      await page.locator('button[aria-label="Toggle menu"]').click();
      await page.waitForTimeout(500); // Allow animation to complete
    }
    
    await expect(dashboardPage.inventoryLink).toBeVisible();
    await expect(dashboardPage.productionLink).toBeVisible();
    await expect(dashboardPage.usersLink).not.toBeVisible(); // No admin access
    await expect(dashboardPage.settingsLink).not.toBeVisible(); // No admin access
    
    await authHelper.logout();
    
    // Shift Lead - operational access
    await loginPage.loginAndExpectSuccess(
      TEST_USERS.shiftLead.email,
      TEST_USERS.shiftLead.password
    );
    
    // For mobile devices, open the mobile menu again
    if (isMobile || (await page.viewportSize())!.width < 1024) {
      await page.locator('button[aria-label="Toggle menu"]').click();
      await page.waitForTimeout(500); // Allow animation to complete
    }
    
    await expect(dashboardPage.inventoryLink).toBeVisible();
    await expect(dashboardPage.productionLink).toBeVisible();
    // Shift leads might have limited admin access - check based on your requirements
  });

  test('TC-ADM-003: Invalid login attempts', async ({ page }) => {
    await loginPage.goto();
    
    // Wrong password
    await loginPage.loginAndExpectError(
      TEST_USERS.admin.email,
      'wrongpassword',
      'Invalid email or password'
    );
    
    // Non-existent user
    await loginPage.loginAndExpectError(
      'nonexistent@example.com',
      'password123',
      'Invalid email or password'
    );
    
    // Empty fields - should show validation error when submitted
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill('');
    await loginPage.loginButton.click();
    // The form should stay on login page (not redirect)
    await expect(page).toHaveURL('/login');
  });

  test('TC-ADM-004: Session persistence and logout', async ({ page, isMobile }) => {
    // Login and verify session
    await authHelper.loginAs('admin');
    
    // Navigate away and back - should stay logged in
    await page.goto('/inventory');
    await page.goto('/dashboard');
    
    // Verify still logged in by checking dashboard content (user name may be hidden on mobile)
    await expect(dashboardPage.pageTitle).toBeVisible();
    
    // Logout and verify redirect
    await authHelper.logout();
    await expect(page).toHaveURL('/login');
    
    // Try to access protected route - should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});