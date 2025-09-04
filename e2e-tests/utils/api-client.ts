import axios, { AxiosInstance } from 'axios';

export class TestApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:8080/api') {
    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' }
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    this.token = response.data.token;
    return response.data;
  }

  async createUser(userData: any) {
    return await this.client.post('/auth/users', userData);
  }

  async getUsers() {
    const response = await this.client.get('/auth/users');
    return response.data;
  }

  async createInventoryItem(itemData: any) {
    const response = await this.client.post('/inventory', itemData);
    return response.data;
  }

  async getInventoryItems() {
    const response = await this.client.get('/inventory');
    return response.data;
  }

  async createInventorySession(sessionData: any) {
    const response = await this.client.post('/inventory/sessions', sessionData);
    return response.data;
  }

  async addSessionLine(sessionId: string, lineData: any) {
    return await this.client.post(`/inventory/sessions/${sessionId}/lines`, lineData);
  }

  async closeInventorySession(sessionId: string, closeData: any = {}) {
    const response = await this.client.post(`/inventory/sessions/${sessionId}/close`, closeData);
    return response.data;
  }

  async createProductionRequest(requestData: any) {
    const response = await this.client.post('/production/requests', requestData);
    return response.data;
  }

  async getProductionRequests() {
    const response = await this.client.get('/production/requests');
    return response.data;
  }

  async createProductionBatch(batchData: any) {
    const response = await this.client.post('/production/batches', batchData);
    return response.data;
  }

  async runOutBatch(batchId: string) {
    const response = await this.client.post(`/production/batches/${batchId}/runout`);
    return response.data;
  }

  async getCurrentStock() {
    const response = await this.client.get('/inventory/current');
    return response.data;
  }

  async getLocations() {
    const response = await this.client.get('/locations');
    return response.data;
  }

  async cleanup() {
    // Clear all test data - implement based on your cleanup needs
    this.token = null;
  }
}