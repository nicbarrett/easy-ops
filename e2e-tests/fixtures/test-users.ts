export const TEST_USERS = {
  admin: {
    email: 'admin@sweetswirls.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'ADMIN'
  },
  productionLead: {
    email: 'production@sweetswirls.com', 
    password: 'production123',
    firstName: 'Production',
    lastName: 'Lead',
    role: 'PRODUCTION_LEAD'
  },
  shiftLead: {
    email: 'shift@sweetswirls.com',
    password: 'shift123',
    firstName: 'Shift',
    lastName: 'Lead', 
    role: 'SHIFT_LEAD'
  },
  teamMember: {
    email: 'team@sweetswirls.com',
    password: 'team123',
    firstName: 'Team',
    lastName: 'Member',
    role: 'TEAM_MEMBER'
  }
};

export const TEST_LOCATIONS = {
  mainShop: {
    name: 'Main Shop',
    type: 'SHOP'
  },
  truck1: {
    name: 'Truck 1', 
    type: 'TRUCK'
  },
  freezerA: {
    name: 'Freezer A',
    type: 'FREEZER'
  }
};

export const TEST_INVENTORY_ITEMS = [
  {
    name: 'Vanilla Base',
    category: 'BASE',
    unit: 'gallons',
    parStockLevel: 10.0,
    sku: 'VAN-BASE-001'
  },
  {
    name: 'Chocolate Chips',
    category: 'MIX_IN', 
    unit: 'lbs',
    parStockLevel: 5.0,
    sku: 'CHOC-CHIP-001'
  },
  {
    name: 'Pint Containers',
    category: 'PACKAGING',
    unit: 'pieces', 
    parStockLevel: 200.0,
    sku: 'PINT-CONT-001'
  }
];