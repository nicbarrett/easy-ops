-- Cleanup script to reset test data between tests
-- Run after each test method to ensure clean state

-- Disable foreign key checks temporarily (H2 syntax)
SET REFERENTIAL_INTEGRITY FALSE;

-- Clear production data (in order of dependencies)
DELETE FROM waste_events;
DELETE FROM production_batches;
DELETE FROM production_requests;
DELETE FROM recipe_ingredients;
DELETE FROM recipes;
DELETE FROM production_items;

-- Clear inventory data
DELETE FROM inventory_session_lines;
DELETE FROM inventory_sessions;
DELETE FROM current_stock;
DELETE FROM inventory_items;

-- Clear user-specific data but preserve seed users
DELETE FROM user_permissions WHERE user_id NOT IN (
    SELECT id FROM users WHERE email IN (
        'admin@sweetswirls.com',
        'production@sweetswirls.com', 
        'shift@sweetswirls.com',
        'team@sweetswirls.com'
    )
);

DELETE FROM user_locations WHERE user_id NOT IN (
    SELECT id FROM users WHERE email IN (
        'admin@sweetswirls.com',
        'production@sweetswirls.com',
        'shift@sweetswirls.com', 
        'team@sweetswirls.com'
    )
);

DELETE FROM users WHERE email NOT IN (
    'admin@sweetswirls.com',
    'production@sweetswirls.com',
    'shift@sweetswirls.com',
    'team@sweetswirls.com'
);

-- Re-enable foreign key checks (H2 syntax)
SET REFERENTIAL_INTEGRITY TRUE;

-- Reset any auto-increment sequences if needed
-- ALTER TABLE inventory_items AUTO_INCREMENT = 1;
-- ALTER TABLE production_batches AUTO_INCREMENT = 1;