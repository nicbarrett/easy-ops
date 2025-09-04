import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class ProductionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Elements
  get pageTitle(): Locator {
    return this.page.locator('h1:has-text("Production Management")');
  }

  get createRequestButton(): Locator {
    return this.page.locator('[data-testid="create-request-button"]');
  }

  get recordBatchButton(): Locator {
    return this.page.locator('[data-testid="record-batch-button"]');
  }

  // Request columns
  get openRequestsColumn(): Locator {
    return this.page.locator('[data-testid="open-requests-column"]');
  }

  get inProgressColumn(): Locator {
    return this.page.locator('[data-testid="in-progress-column"]');
  }

  get completedColumn(): Locator {
    return this.page.locator('[data-testid="completed-column"]');
  }

  // Request form elements
  get requestProductSelect(): Locator {
    return this.page.locator('[data-testid="request-product-select"]');
  }

  get requestQuantityInput(): Locator {
    return this.page.locator('[data-testid="request-quantity-input"]');
  }

  get requestPrioritySelect(): Locator {
    return this.page.locator('[data-testid="request-priority-select"]');
  }

  get requestNeededByInput(): Locator {
    return this.page.locator('[data-testid="request-needed-by-input"]');
  }

  get requestReasonInput(): Locator {
    return this.page.locator('[data-testid="request-reason-input"]');
  }

  get saveRequestButton(): Locator {
    return this.page.locator('[data-testid="save-request-button"]');
  }

  // Batch form elements
  get batchProductSelect(): Locator {
    return this.page.locator('[data-testid="batch-product-select"]');
  }

  get batchQuantityInput(): Locator {
    return this.page.locator('[data-testid="batch-quantity-input"]');
  }

  get batchLocationSelect(): Locator {
    return this.page.locator('[data-testid="batch-location-select"]');
  }

  get saveBatchButton(): Locator {
    return this.page.locator('[data-testid="save-batch-button"]');
  }

  // Actions
  async goto() {
    await this.page.goto('/production');
    await this.page.waitForLoadState('networkidle');
  }

  async createProductionRequest(requestData: {
    product: string;
    quantity: number;
    priority: string;
    neededBy: string;
    reason: string;
  }) {
    await this.createRequestButton.click();
    await this.page.waitForSelector('[data-testid="request-form-modal"]');
    
    await this.requestProductSelect.selectOption(requestData.product);
    await this.requestQuantityInput.fill(requestData.quantity.toString());
    await this.requestPrioritySelect.selectOption(requestData.priority);
    await this.requestNeededByInput.fill(requestData.neededBy);
    await this.requestReasonInput.fill(requestData.reason);
    
    await this.saveRequestButton.click();
    await this.waitForToast('Production request created');
  }

  async recordProductionBatch(batchData: {
    product: string;
    quantity: number;
    location: string;
  }) {
    await this.recordBatchButton.click();
    await this.page.waitForSelector('[data-testid="batch-form-modal"]');
    
    await this.batchProductSelect.selectOption(batchData.product);
    await this.batchQuantityInput.fill(batchData.quantity.toString());
    await this.batchLocationSelect.selectOption(batchData.location);
    
    await this.saveBatchButton.click();
    await this.waitForToast('Production batch recorded');
  }

  async getRequestCard(requestId: string): Promise<Locator> {
    return this.page.locator(`[data-testid="request-card-${requestId}"]`);
  }

  async getBatchCard(batchId: string): Promise<Locator> {
    return this.page.locator(`[data-testid="batch-card-${batchId}"]`);
  }

  async moveRequestToInProgress(requestId: string) {
    const requestCard = await this.getRequestCard(requestId);
    await requestCard.locator('[data-testid="start-request-button"]').click();
    await this.waitForToast('Request started');
  }

  async markRequestComplete(requestId: string) {
    const requestCard = await this.getRequestCard(requestId);
    await requestCard.locator('[data-testid="complete-request-button"]').click();
    await this.waitForToast('Request completed');
  }

  async runOutBatch(batchId: string) {
    const batchCard = await this.getBatchCard(batchId);
    await batchCard.locator('[data-testid="runout-batch-button"]').click();
    
    await this.page.waitForSelector('[data-testid="runout-confirmation-modal"]');
    await this.page.click('[data-testid="confirm-runout-button"]');
    await this.waitForToast('Batch marked as run out');
  }

  async recordWaste(batchId: string, wasteData: { quantity: number; reason: string }) {
    const batchCard = await this.getBatchCard(batchId);
    await batchCard.locator('[data-testid="waste-batch-button"]').click();
    
    await this.page.waitForSelector('[data-testid="waste-form-modal"]');
    await this.page.fill('[data-testid="waste-quantity-input"]', wasteData.quantity.toString());
    await this.page.selectOption('[data-testid="waste-reason-select"]', wasteData.reason);
    await this.page.click('[data-testid="record-waste-button"]');
    
    await this.waitForToast('Waste recorded');
  }

  async getOpenRequestsCount(): Promise<number> {
    return await this.openRequestsColumn.locator('[data-testid^="request-card"]').count();
  }

  async getInProgressRequestsCount(): Promise<number> {
    return await this.inProgressColumn.locator('[data-testid^="request-card"]').count();
  }

  async getCompletedRequestsCount(): Promise<number> {
    return await this.completedColumn.locator('[data-testid^="request-card"]').count();
  }
}