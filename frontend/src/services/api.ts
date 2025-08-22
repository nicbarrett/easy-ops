import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  User,
  Location,
  InventoryItem,
  InventoryItemRequest,
  InventorySession,
  CreateSessionRequest,
  AddSessionLineRequest,
  CloseSessionRequest,
  CurrentStock,
  ProductionRequest,
  CreateProductionRequestRequest,
  UpdateRequestStatusRequest,
  ProductionBatch,
  CreateBatchRequest,
  RecordWasteRequest,
  WasteEvent,
  UserRole
} from '../types/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on init
    this.loadToken();
  }

  private saveToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private loadToken() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.token = token;
    }
  }

  private clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.post('/auth/login', credentials);
    if (response.data.token) {
      this.saveToken(response.data.token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/auth/me');
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response: AxiosResponse<User> = await this.client.post('/auth/users', userData);
    return response.data;
  }

  async getUsers(role?: UserRole): Promise<User[]> {
    const params = role ? { role } : {};
    const response: AxiosResponse<User[]> = await this.client.get('/auth/users', { params });
    return response.data;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    const response: AxiosResponse<User> = await this.client.patch(`/auth/users/${userId}/role`, { role });
    return response.data;
  }

  async deactivateUser(userId: string): Promise<User> {
    const response: AxiosResponse<User> = await this.client.patch(`/auth/users/${userId}/deactivate`);
    return response.data;
  }

  async activateUser(userId: string): Promise<User> {
    const response: AxiosResponse<User> = await this.client.patch(`/auth/users/${userId}/activate`);
    return response.data;
  }

  // Location endpoints
  async getLocations(): Promise<Location[]> {
    const response: AxiosResponse<Location[]> = await this.client.get('/locations');
    return response.data;
  }

  // Inventory Item endpoints
  async getInventoryItems(active?: boolean, locationId?: string): Promise<InventoryItem[]> {
    const params: any = {};
    if (active !== undefined) params.active = active;
    if (locationId) params.location = locationId;
    const response: AxiosResponse<InventoryItem[]> = await this.client.get('/inventory/items', { params });
    return response.data;
  }

  async getInventoryItem(id: string): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryItem> = await this.client.get(`/inventory/items/${id}`);
    return response.data;
  }

  async createInventoryItem(item: InventoryItemRequest): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryItem> = await this.client.post('/inventory/items', item);
    return response.data;
  }

  async updateInventoryItem(id: string, item: Partial<InventoryItemRequest>): Promise<InventoryItem> {
    const response: AxiosResponse<InventoryItem> = await this.client.put(`/inventory/items/${id}`, item);
    return response.data;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.client.delete(`/inventory/items/${id}`);
  }

  // Inventory Session endpoints
  async getInventorySessions(locationId?: string): Promise<InventorySession[]> {
    const params = locationId ? { locationId } : {};
    const response: AxiosResponse<InventorySession[]> = await this.client.get('/inventory/sessions', { params });
    return response.data;
  }

  async getInventorySession(id: string): Promise<InventorySession> {
    const response: AxiosResponse<InventorySession> = await this.client.get(`/inventory/sessions/${id}`);
    return response.data;
  }

  async createInventorySession(request: CreateSessionRequest): Promise<InventorySession> {
    const response: AxiosResponse<InventorySession> = await this.client.post('/inventory/sessions', request);
    return response.data;
  }

  async addSessionLine(sessionId: string, line: AddSessionLineRequest): Promise<void> {
    await this.client.post(`/inventory/sessions/${sessionId}/lines`, line);
  }

  async addSessionLines(sessionId: string, lines: AddSessionLineRequest[]): Promise<void> {
    await this.client.post(`/inventory/sessions/${sessionId}/lines/batch`, lines);
  }

  async closeInventorySession(sessionId: string, request: CloseSessionRequest): Promise<InventorySession> {
    const response: AxiosResponse<InventorySession> = await this.client.post(`/inventory/sessions/${sessionId}/close`, request);
    return response.data;
  }

  // Current Stock endpoints
  async getCurrentStock(locationId?: string): Promise<CurrentStock[]> {
    const params = locationId ? { locationId } : {};
    const response: AxiosResponse<CurrentStock[]> = await this.client.get('/inventory/current', { params });
    return response.data;
  }

  async getItemStock(itemId: string, locationId?: string): Promise<CurrentStock[]> {
    const params = locationId ? { locationId } : {};
    const response: AxiosResponse<CurrentStock[]> = await this.client.get(`/inventory/items/${itemId}/stock`, { params });
    return response.data;
  }

  // Production Request endpoints
  async getProductionRequests(status?: string): Promise<ProductionRequest[]> {
    const params = status ? { status } : {};
    const response: AxiosResponse<ProductionRequest[]> = await this.client.get('/production/requests', { params });
    return response.data;
  }

  async getProductionRequest(id: string): Promise<ProductionRequest> {
    const response: AxiosResponse<ProductionRequest> = await this.client.get(`/production/requests/${id}`);
    return response.data;
  }

  async createProductionRequest(request: CreateProductionRequestRequest): Promise<ProductionRequest> {
    const response: AxiosResponse<ProductionRequest> = await this.client.post('/production/requests', request);
    return response.data;
  }

  async updateProductionRequestStatus(id: string, request: UpdateRequestStatusRequest): Promise<ProductionRequest> {
    const response: AxiosResponse<ProductionRequest> = await this.client.patch(`/production/requests/${id}`, request);
    return response.data;
  }

  // Production Batch endpoints
  async getProductionBatches(status?: string): Promise<ProductionBatch[]> {
    const params = status ? { status } : {};
    const response: AxiosResponse<ProductionBatch[]> = await this.client.get('/production/batches', { params });
    return response.data;
  }

  async getProductionBatch(id: string): Promise<ProductionBatch> {
    const response: AxiosResponse<ProductionBatch> = await this.client.get(`/production/batches/${id}`);
    return response.data;
  }

  async createProductionBatch(request: CreateBatchRequest): Promise<ProductionBatch> {
    const response: AxiosResponse<ProductionBatch> = await this.client.post('/production/batches', request);
    return response.data;
  }

  async completeBatch(id: string): Promise<ProductionBatch> {
    const response: AxiosResponse<ProductionBatch> = await this.client.post(`/production/batches/${id}/complete`);
    return response.data;
  }

  async runOutBatch(id: string): Promise<ProductionBatch> {
    const response: AxiosResponse<ProductionBatch> = await this.client.post(`/production/batches/${id}/runout`);
    return response.data;
  }

  async recordWaste(request: RecordWasteRequest): Promise<WasteEvent> {
    const response: AxiosResponse<WasteEvent> = await this.client.post('/production/waste', request);
    return response.data;
  }

  // Waste Event endpoints
  async getWasteEvents(batchId?: string, itemId?: string): Promise<WasteEvent[]> {
    const params: any = {};
    if (batchId) params.batchId = batchId;
    if (itemId) params.itemId = itemId;
    const response: AxiosResponse<WasteEvent[]> = await this.client.get('/production/waste', { params });
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardData(): Promise<{
    lowStockItems: CurrentStock[];
    openRequests: ProductionRequest[];
    todaysBatches: ProductionBatch[];
    recentWaste: WasteEvent[];
  }> {
    const [lowStock, openRequests, batches, waste] = await Promise.all([
      this.getCurrentStock().then(items => items.filter(item => 
        item.item && item.quantity < item.item.parStockLevel
      )),
      this.getProductionRequests('OPEN'),
      this.getProductionBatches(),
      this.getWasteEvents()
    ]);

    return {
      lowStockItems: lowStock,
      openRequests: openRequests,
      todaysBatches: batches.filter(batch => {
        const today = new Date().toISOString().split('T')[0];
        return batch.createdAt.startsWith(today);
      }),
      recentWaste: waste.slice(0, 10)
    };
  }
}

export const apiClient = new ApiClient();
export default apiClient;