import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/api';
import { InventoryItem, InventoryCategory, Location, InventoryItemRequest } from '../../types/api';
import InventoryItemForm from '../../components/inventory/InventoryItemForm';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import globals from '../../styles/globals.module.css';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, locationsData] = await Promise.all([
        apiClient.getInventoryItems(),
        apiClient.getLocations()
      ]);
      setItems(itemsData);
      setLocations(locationsData);
      setError(null);
    } catch (err) {
      setError('Failed to load inventory data');
      console.error('Error loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (data: InventoryItemRequest) => {
    try {
      const newItem = await apiClient.createInventoryItem(data);
      setItems(prev => [...prev, newItem]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating item:', err);
      setError('Failed to create inventory item');
    }
  };

  const handleUpdateItem = async (data: InventoryItemRequest) => {
    if (!editingItem) return;
    
    try {
      const updatedItem = await apiClient.updateInventoryItem(editingItem.id, data);
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ));
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update inventory item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await apiClient.deleteInventoryItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      setDeletingItem(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete inventory item');
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: InventoryCategory) => {
    const colors = {
      BASE: `${globals.bgBlue} ${globals.textBlue}`,
      MIX_IN: `${globals.bgGreen} ${globals.textGreen}`,
      PACKAGING: `${globals.bgYellow} ${globals.textYellow}`,
      BEVERAGE: `${globals.bgPurple} ${globals.textPurple}`
    };
    return colors[category] || `${globals.bgGray} ${globals.textGray}`;
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'Not assigned';
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown location';
  };

  if (loading) {
    return (
      <div className={`${globals.container} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.py16}`}>
        <div className={`${globals.textCenter}`}>
          <Package size={48} className={`${globals.mb4} ${globals.textMuted}`} />
          <p className={`${globals.textLg} ${globals.textMuted}`}>Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${globals.container} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.py16}`}>
        <div className={`${globals.textCenter}`}>
          <AlertCircle size={48} className={`${globals.mb4} ${globals.textDanger}`} />
          <p className={`${globals.textLg} ${globals.textDanger} ${globals.mb4}`}>{error}</p>
          <button 
            onClick={loadData}
            className={`${globals.px4} ${globals.py2} ${globals.bgPrimary} ${globals.textPrimary} ${globals.rounded}`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${globals.container}`}>
      <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb8}`}>
        <div>
          <h1 className={`${globals.text3xl} ${globals.fontBold} ${globals.textPrimary} ${globals.mb2}`}>
            Inventory Management
          </h1>
          <p className={`${globals.textLg} ${globals.textSecondary}`}>
            Manage your ice cream ingredients and supplies ({items.length} items)
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py3} ${globals.bgPrimary} ${globals.textPrimary} ${globals.border} ${globals.rounded} ${globals.shadowSm}`}
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Search Bar */}
      <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb6} ${globals.maxW2xl}`}>
        <Search size={20} className={`${globals.textMuted}`} />
        <input 
          type="text" 
          placeholder="Search items by name, SKU, or category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${globals.flex} ${globals.wFull} ${globals.px4} ${globals.py3} ${globals.border} ${globals.rounded} ${globals.textBase}`}
        />
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p12} ${globals.textCenter}`}>
          <Package size={64} className={`${globals.mb4} ${globals.textMuted}`} />
          <h2 className={`${globals.textXl} ${globals.fontSemibold} ${globals.mb2}`}>
            {items.length === 0 ? 'No inventory items' : 'No items match your search'}
          </h2>
          <p className={`${globals.textMuted} ${globals.mb6}`}>
            {items.length === 0 
              ? 'Add your first inventory item to get started with managing your ice cream ingredients and supplies.' 
              : 'Try adjusting your search terms or browse all items.'
            }
          </p>
          {items.length === 0 && (
            <button 
              onClick={() => setShowAddModal(true)}
              className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px6} ${globals.py3} ${globals.bgPrimary} ${globals.textPrimary} ${globals.rounded} ${globals.mxAuto}`}
            >
              <Plus size={20} />
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridMd2} ${globals.gridLg3} ${globals.gap6}`}>
          {filteredItems.map((item) => (
            <div key={item.id} className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm} ${globals.transition}`}>
              <div className={`${globals.flex} ${globals.itemsStart} ${globals.justifyBetween} ${globals.mb4}`}>
                <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3}`}>
                  <div className={`${globals.p2} ${globals.rounded} ${getCategoryColor(item.category)}`}>
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className={`${globals.fontSemibold} ${globals.textLg}`}>{item.name}</h3>
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.textSm} ${globals.textMuted}`}>
                      <span className={`${globals.px2} ${globals.py1} ${getCategoryColor(item.category)} ${globals.rounded} ${globals.textXs} ${globals.fontMedium}`}>
                        {item.category}
                      </span>
                      {item.sku && <span>SKU: {item.sku}</span>}
                    </div>
                  </div>
                </div>
                <div className={`${globals.flex} ${globals.gap1}`}>
                  <button 
                    onClick={() => setEditingItem(item)}
                    className={`${globals.p2} ${globals.textMuted} ${globals.rounded} ${globals.transition}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => setDeletingItem(item)}
                    className={`${globals.p2} ${globals.textMuted} ${globals.rounded} ${globals.transition}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4} ${globals.textSm}`}>
                <div>
                  <span className={`${globals.textMuted}`}>Par Level:</span>
                  <p className={`${globals.fontSemibold}`}>{item.parStockLevel} {item.unit}</p>
                </div>
                <div>
                  <span className={`${globals.textMuted}`}>Location:</span>
                  <p className={`${globals.fontSemibold}`}>{getLocationName(item.defaultLocationId)}</p>
                </div>
              </div>
              
              {item.notes && (
                <div className={`${globals.mt4} ${globals.pt4} ${globals.borderT}`}>
                  <span className={`${globals.textMuted} ${globals.textSm}`}>Notes:</span>
                  <p className={`${globals.textSm} ${globals.mt1}`}>{item.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <InventoryItemForm
          locations={locations}
          onSubmit={handleCreateItem}
          onCancel={() => setShowAddModal(false)}
          title="Add New Item"
          submitLabel="Create Item"
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <InventoryItemForm
          locations={locations}
          initialValues={{
            name: editingItem.name,
            category: editingItem.category,
            unit: editingItem.unit,
            parStockLevel: editingItem.parStockLevel,
            defaultLocationId: editingItem.defaultLocationId,
            sku: editingItem.sku,
            notes: editingItem.notes
          }}
          onSubmit={handleUpdateItem}
          onCancel={() => setEditingItem(null)}
          title="Edit Item"
          submitLabel="Save Changes"
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingItem}
        title="Delete Item"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Item"
        onConfirm={() => deletingItem && handleDeleteItem(deletingItem.id)}
        onCancel={() => setDeletingItem(null)}
        variant="danger"
      />
    </div>
  );
}