import React, { useState } from 'react';
import { X, Save, Factory } from 'lucide-react';
import { CreateBatchRequest, InventoryItem, Location } from '../../types/api';
import globals from '../../styles/globals.module.css';

interface ProductionBatchFormProps {
  items: InventoryItem[];
  locations: Location[];
  onSubmit: (data: CreateBatchRequest) => void;
  onCancel: () => void;
}

export default function ProductionBatchForm({
  items,
  locations,
  onSubmit,
  onCancel
}: ProductionBatchFormProps) {
  const [formData, setFormData] = useState<CreateBatchRequest>({
    productItemId: '',
    quantityMade: 1,
    unit: 'units',
    storageLocationId: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateBatchRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    setFormData(prev => ({
      ...prev,
      productItemId: itemId,
      unit: item?.unit || 'units'
    }));
    if (errors.productItemId) {
      setErrors(prev => ({ ...prev, productItemId: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productItemId) {
      newErrors.productItemId = 'Product item is required';
    }

    if (!formData.storageLocationId) {
      newErrors.storageLocationId = 'Storage location is required';
    }

    if (formData.quantityMade <= 0) {
      newErrors.quantityMade = 'Quantity must be greater than 0';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const selectedItem = items.find(item => item.id === formData.productItemId);

  return (
    <div className={`${globals.fixed} ${globals.inset0} ${globals.bgBlackOpacity50} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.p4} ${globals.zIndex50}`}>
      <div className={`${globals.bgPrimary} ${globals.rounded} ${globals.p6} ${globals.maxWLg} ${globals.wFull} ${globals.maxHScreen} ${globals.overflowYAuto}`}>
        <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb6}`}>
          <h2 className={`${globals.textXl} ${globals.fontSemibold} ${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
            <Factory size={20} />
            Record Production Batch
          </h2>
          <button 
            onClick={onCancel}
            className={`${globals.p2} ${globals.textMuted} ${globals.rounded} ${globals.transition}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${globals.spaceY4}`}>
          {/* Product Item */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Product Item *
            </label>
            <select
              value={formData.productItemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.productItemId ? globals.borderDanger : ''}`}
            >
              <option value="">Select product produced...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
            {errors.productItemId && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.productItemId}</p>}
          </div>

          {/* Quantity & Unit */}
          <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4}`}>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Quantity Made *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.quantityMade}
                onChange={(e) => handleChange('quantityMade', parseFloat(e.target.value) || 0)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.quantityMade ? globals.borderDanger : ''}`}
              />
              {errors.quantityMade && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.quantityMade}</p>}
            </div>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Unit *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.unit ? globals.borderDanger : ''}`}
                placeholder="e.g., gallons, lbs, dozen"
              />
              {errors.unit && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.unit}</p>}
            </div>
          </div>

          {/* Storage Location */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Storage Location *
            </label>
            <select
              value={formData.storageLocationId}
              onChange={(e) => handleChange('storageLocationId', e.target.value)}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.storageLocationId ? globals.borderDanger : ''}`}
            >
              <option value="">Select storage location...</option>
              {locations
                .filter(location => location.type === 'FREEZER' || location.type === 'STORAGE')
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.type})
                  </option>
                ))}
            </select>
            {errors.storageLocationId && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.storageLocationId}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Production Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded}`}
              placeholder="Optional notes about this production batch..."
            />
          </div>

          {/* Selected Item Info */}
          {selectedItem && (
            <div className={`${globals.p4} ${globals.bgSecondary} ${globals.border} ${globals.rounded}`}>
              <h3 className={`${globals.fontMedium} ${globals.mb2}`}>Selected Item Details</h3>
              <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4} ${globals.textSm}`}>
                <div>
                  <span className={`${globals.textMuted}`}>Name:</span>
                  <p className={`${globals.fontSemibold}`}>{selectedItem.name}</p>
                </div>
                <div>
                  <span className={`${globals.textMuted}`}>Category:</span>
                  <p className={`${globals.fontSemibold}`}>{selectedItem.category}</p>
                </div>
                <div>
                  <span className={`${globals.textMuted}`}>Standard Unit:</span>
                  <p className={`${globals.fontSemibold}`}>{selectedItem.unit}</p>
                </div>
                <div>
                  <span className={`${globals.textMuted}`}>Par Level:</span>
                  <p className={`${globals.fontSemibold}`}>{selectedItem.parStockLevel} {selectedItem.unit}</p>
                </div>
              </div>
              {selectedItem.notes && (
                <div className={`${globals.mt2}`}>
                  <span className={`${globals.textMuted} ${globals.textSm}`}>Notes:</span>
                  <p className={`${globals.textSm}`}>{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className={`${globals.flex} ${globals.gap3} ${globals.justifyEnd} ${globals.pt4} ${globals.borderT}`}>
            <button 
              type="button"
              onClick={onCancel}
              className={`${globals.px4} ${globals.py2} ${globals.border} ${globals.rounded} ${globals.textMuted}`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py2} ${globals.bgPrimary} ${globals.textPrimary} ${globals.rounded}`}
            >
              <Save size={16} />
              Record Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}