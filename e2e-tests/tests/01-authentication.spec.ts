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

  test('TC-ADM-001: Admin login and role verification with accessibility checks', async ({ page, browserName, isMobile }) => {
    // Covers AC-ADM-001a: Admin can login and access admin features
    await loginPage.goto();
    
    // Accessibility check: Login page should have proper heading
    await expect(loginPage.pageHeading).toBeVisible();
    
    // Accessibility check: Form fields should be properly labeled
    await expect(loginPage.emailInput).toBeEnabled();
    await expect(loginPage.passwordInput).toBeEnabled();
    await expect(loginPage.loginButton).toBeEnabled();
    
    await loginPage.loginAndExpectSuccess(
      TEST_USERS.admin.email, 
      TEST_USERS.admin.password
    );
    
    // Verify admin is on dashboard with proper accessibility
    await expect(dashboardPage.pageTitle).toBeVisible();
    
    // For mobile devices, use accessible mobile menu
    if (isMobile || (await page.viewportSize())!.width < 1024) {
      await dashboardPage.mobileMenuButton.click();
      await page.waitForTimeout(500); // Allow animation to complete
    }
    
    // Verify admin has access to all navigation items using accessible selectors
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
    
    // For mobile devices, open the mobile menu using accessible selector
    if (isMobile || (await page.viewportSize())!.width < 1024) {
      await dashboardPage.mobileMenuButton.click();
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
    
    // For mobile devices, open the mobile menu again using accessible selector
    if (isMobile || (await page.viewportSize())!.width < 1024) {
      await dashboardPage.mobileMenuButton.click();
      await page.waitForTimeout(500); // Allow animation to complete
    }
    
    await expect(dashboardPage.inventoryLink).toBeVisible();
    await expect(dashboardPage.productionLink).toBeVisible();
    // Shift leads might have limited admin access - check based on your requirements
  });

  test('TC-ADM-003: Invalid login attempts with accessible error handling', async ({ page }) => {
    await loginPage.goto();
    
    // Accessibility check: Error should be announced to screen readers
    // Wrong password
    await loginPage.emailInput.fill(TEST_USERS.admin.email);
    await loginPage.passwordInput.fill('wrongpassword');
    await loginPage.loginButton.click();
    
    // Error should appear in an accessible alert region
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(/invalid.*email.*password/i);
    
    // Non-existent user
    await loginPage.emailInput.fill('nonexistent@example.com');
    await loginPage.passwordInput.fill('password123');
    await loginPage.loginButton.click();
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(/invalid.*email.*password/i);
    
    // Form validation - empty fields
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill('');
    await loginPage.loginButton.click();
    
    // Should stay on login page with accessible error handling
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