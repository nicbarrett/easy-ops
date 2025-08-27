// Type definitions for Sweet Swirls API

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'PRODUCTION_LEAD' | 'SHIFT_LEAD' | 'TEAM_MEMBER';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  parentId?: string;
  isActive: boolean;
}

export type LocationType = 'SHOP' | 'TRUCK' | 'FREEZER' | 'STORAGE';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  parStockLevel: number;
  defaultLocationId?: string;
  sku?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InventoryCategory = 'BASE' | 'MIX_IN' | 'PACKAGING' | 'BEVERAGE';

export interface InventorySession {
  id: string;
  locationId: string;
  startedBy: string;
  startedAt: string;
  closedBy?: string;
  closedAt?: string;
  status: InventorySessionStatus;
  lines: InventorySessionLine[];
}

export type InventorySessionStatus = 'DRAFT' | 'CLOSED';

export interface InventorySessionLine {
  id: string;
  sessionId: string;
  itemId: string;
  count: number;
  unit: string;
  note?: string;
  photoUrl?: string;
  item?: InventoryItem;
}

export interface CurrentStock {
  id: string;
  itemId: string;
  locationId: string;
  quantity: number;
  lastUpdated: string;
  item?: InventoryItem;
  location?: Location;
}

export interface ProductionRequest {
  id: string;
  productItemId: string;
  locationId: string;
  requestedBy: string;
  neededBy: string;
  priority: ProductionPriority;
  reason: string;
  status: ProductionRequestStatus;
  createdAt: string;
  updatedAt: string;
  productItem?: InventoryItem;
  location?: Location;
  requestedByUser?: User;
}

export type ProductionPriority = 'NORMAL' | 'HIGH';
export type ProductionRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface ProductionBatch {
  id: string;
  productItemId: string;
  quantityMade: number;
  unit: string;
  storageLocationId: string;
  madeBy: string;
  startedAt?: string;
  finishedAt?: string;
  lotCode: string;
  notes?: string;
  status: ProductionBatchStatus;
  createdAt: string;
  updatedAt: string;
  productItem?: InventoryItem;
  storageLocation?: Location;
  madeByUser?: User;
}

export type ProductionBatchStatus = 'IN_PROGRESS' | 'COMPLETED' | 'RUN_OUT';

export interface WasteEvent {
  id: string;
  batchId?: string;
  itemId: string;
  quantity: number;
  unit: string;
  reason: WasteReason;
  recordedBy: string;
  recordedAt: string;
  notes?: string;
  batch?: ProductionBatch;
  item?: InventoryItem;
  recordedByUser?: User;
}

export type WasteReason = 'SPOILAGE' | 'TEMPERATURE_EXCURSION' | 'QA_FAILURE' | 'ACCIDENT' | 'OTHER';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Inventory request types
export interface InventoryItemRequest {
  name: string;
  category: InventoryCategory;
  unit: string;
  parStockLevel: number;
  defaultLocationId?: string;
  sku?: string;
  notes?: string;
}

export interface CreateSessionRequest {
  locationId: string;
}

export interface AddSessionLineRequest {
  itemId: string;
  count: number;
  unit: string;
  note?: string;
}

export interface CloseSessionRequest {
  notes?: string;
}

// Production request types
export interface CreateProductionRequestRequest {
  productItemId: string;
  locationId: string;
  neededBy: string;
  targetQuantity: number;
  unit: string;
  priority: ProductionPriority;
  reason: string;
  requestedBy: string;
}

export interface CreateBatchRequest {
  productItemId: string;
  quantityMade: number;
  unit: string;
  storageLocationId: string;
  notes?: string;
}

export interface RecordWasteRequest {
  batchId?: string;
  itemId: string;
  quantity: number;
  unit: string;
  reason: WasteReason;
  notes?: string;
}

export interface UpdateRequestStatusRequest {
  status: ProductionRequestStatus;
  notes?: string;
}