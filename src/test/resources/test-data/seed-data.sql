-- Seed data for integration tests
-- Provides consistent test data across all test runs

-- Enable foreign key checks (H2 syntax)  
SET REFERENTIAL_INTEGRITY TRUE;

-- Insert test users (matching cleanup.sql preservation list)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at) VALUES
('admin-user-uuid', 'admin@sweetswirls.com', '$2a$10$CwTycUXWue0Thq9StjUM0uBUcUaoxkVOKJe6JSqOEcyJwFBrthrhm', 'System', 'Administrator', 'ADMIN', true, NOW(), NOW()),
('prod-lead-uuid', 'production@sweetswirls.com', '$2a$10$CwTycUXWue0Thq9StjUM0uBUcUaoxkVOKJe6JSqOEcyJwFBrthrhm', 'Production', 'Lead', 'PRODUCTION_LEAD', true, NOW(), NOW()),
('shift-lead-uuid', 'shift@sweetswirls.com', '$2a$10$CwTycUXWue0Thq9StjUM0uBUcUaoxkVOKJe6JSqOEcyJwFBrthrhm', 'Shift', 'Lead', 'SHIFT_LEAD', true, NOW(), NOW()),
('team-member-uuid', 'team@sweetswirls.com', '$2a$10$CwTycUXWue0Thq9StjUM0uBUcUaoxkVOKJe6JSqOEcyJwFBrthrhm', 'Team', 'Member', 'TEAM_MEMBER', true, NOW(), NOW());

-- Insert test locations
INSERT INTO locations (id, name, type, is_active, created_at, updated_at) VALUES
('test-location-uuid', 'Main Shop', 'SHOP', true, NOW(), NOW()),
('truck-location-uuid', 'Truck 1', 'TRUCK', true, NOW(), NOW()),
('freezer-location-uuid', 'Freezer A', 'STORAGE', true, NOW(), NOW());

-- Insert test product/inventory items
INSERT INTO inventory_items (id, name, category, unit, par_stock_level, location_id, sku, is_active, notes, created_at, updated_at) VALUES
('test-product-uuid', 'Vanilla Base', 'BASE', 'gallons', 10.0, 'test-location-uuid', 'VAN-BASE-001', true, 'Standard vanilla ice cream base', NOW(), NOW()),
('test-mixinitem-uuid', 'Chocolate Chips', 'MIX_IN', 'lbs', 5.0, 'test-location-uuid', 'CHOC-CHIP-001', true, 'Premium chocolate chips for mix-ins', NOW(), NOW()),
('test-packaging-uuid', 'Pint Containers', 'PACKAGING', 'pieces', 100, 'test-location-uuid', 'PINT-CONT-001', true, 'Standard pint containers', NOW(), NOW());

-- Insert user permissions based on roles
INSERT INTO user_permissions (id, user_id, permission, granted_at, granted_by) VALUES
-- Admin permissions
('admin-perm-1', 'admin-user-uuid', 'admin:user:rw', NOW(), 'admin-user-uuid'),
('admin-perm-2', 'admin-user-uuid', 'inventory:item:rw', NOW(), 'admin-user-uuid'),
('admin-perm-3', 'admin-user-uuid', 'production:batch:rw', NOW(), 'admin-user-uuid'),
('admin-perm-4', 'admin-user-uuid', 'production:request:rw', NOW(), 'admin-user-uuid'),

-- Production Lead permissions
('prod-perm-1', 'prod-lead-uuid', 'inventory:item:rw', NOW(), 'admin-user-uuid'),
('prod-perm-2', 'prod-lead-uuid', 'production:batch:rw', NOW(), 'admin-user-uuid'),
('prod-perm-3', 'prod-lead-uuid', 'production:request:rw', NOW(), 'admin-user-uuid'),

-- Shift Lead permissions
('shift-perm-1', 'shift-lead-uuid', 'inventory:item:rw', NOW(), 'admin-user-uuid'),
('shift-perm-2', 'shift-lead-uuid', 'production:batch:rw', NOW(), 'admin-user-uuid'),
('shift-perm-3', 'shift-lead-uuid', 'inventory:session:rw', NOW(), 'admin-user-uuid'),

-- Team Member permissions (read-only)
('team-perm-1', 'team-member-uuid', 'inventory:item:r', NOW(), 'admin-user-uuid'),
('team-perm-2', 'team-member-uuid', 'production:batch:r', NOW(), 'admin-user-uuid');

-- Insert user-location assignments  
INSERT INTO user_locations (id, user_id, location_id, is_primary, created_at) VALUES
('admin-loc-1', 'admin-user-uuid', 'test-location-uuid', true, NOW()),
('admin-loc-2', 'admin-user-uuid', 'truck-location-uuid', false, NOW()),
('admin-loc-3', 'admin-user-uuid', 'freezer-location-uuid', false, NOW()),
('prod-loc-1', 'prod-lead-uuid', 'test-location-uuid', true, NOW()),
('shift-loc-1', 'shift-lead-uuid', 'test-location-uuid', true, NOW()),
('team-loc-1', 'team-member-uuid', 'test-location-uuid', true, NOW());

-- Insert initial current stock for testing
INSERT INTO current_stock (id, item_id, location_id, quantity, last_updated, last_session_id, created_at, updated_at) VALUES
('stock-1', 'test-product-uuid', 'test-location-uuid', 8.0, NOW(), null, NOW(), NOW()),
('stock-2', 'test-mixinitem-uuid', 'test-location-uuid', 3.0, NOW(), null, NOW(), NOW()),
('stock-3', 'test-packaging-uuid', 'test-location-uuid', 50, NOW(), null, NOW(), NOW());