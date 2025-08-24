import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { InventoryCategory, Location, InventoryItemRequest } from '../../types/api';
import globals from '../../styles/globals.module.css';

interface InventoryItemFormProps {
  locations: Location[];
  initialValues?: Partial<InventoryItemRequest>;
  onSubmit: (data: InventoryItemRequest) => void;
  onCancel: () => void;
  title: string;
  submitLabel: string;
}

export default function InventoryItemForm({
  locations,
  initialValues,
  onSubmit,
  onCancel,
  title,
  submitLabel
}: InventoryItemFormProps) {
  const [formData, setFormData] = useState<InventoryItemRequest>({
    name: initialValues?.name || '',
    category: initialValues?.category || 'BASE',
    unit: initialValues?.unit || 'units',
    parStockLevel: initialValues?.parStockLevel || 1,
    defaultLocationId: initialValues?.defaultLocationId || '',
    sku: initialValues?.sku || '',
    notes: initialValues?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof InventoryItemRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (formData.parStockLevel <= 0) {
      newErrors.parStockLevel = 'Par level must be greater than 0';
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

  return (
    <div className={`${globals.fixed} ${globals.inset0} ${globals.bgBlackOpacity50} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.p4} ${globals.zIndex50}`}>
      <div className={`${globals.bgPrimary} ${globals.rounded} ${globals.p6} ${globals.maxWLg} ${globals.wFull} ${globals.maxHScreen} ${globals.overflowYAuto}`}>
        <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb6}`}>
          <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>{title}</h2>
          <button 
            onClick={onCancel}
            className={`${globals.p2} ${globals.textMuted} ${globals.rounded} ${globals.transition}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${globals.spaceY4}`}>
          {/* Name */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.name ? globals.borderDanger : ''}`}
              placeholder="e.g., Vanilla Extract, Sugar, Milk"
            />
            {errors.name && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as InventoryCategory)}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded}`}
            >
              <option value="BASE">Base Ingredients</option>
              <option value="MIX_IN">Mix-ins & Toppings</option>
              <option value="PACKAGING">Packaging & Containers</option>
              <option value="BEVERAGE">Beverages & Drinks</option>
            </select>
          </div>

          {/* Unit & Par Level */}
          <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4}`}>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Unit *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.unit ? globals.borderDanger : ''}`}
                placeholder="e.g., lbs, gallons, dozen"
              />
              {errors.unit && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.unit}</p>}
            </div>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Par Level *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.parStockLevel}
                onChange={(e) => handleChange('parStockLevel', parseFloat(e.target.value) || 0)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.parStockLevel ? globals.borderDanger : ''}`}
              />
              {errors.parStockLevel && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.parStockLevel}</p>}
            </div>
          </div>

          {/* SKU & Location */}
          <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4}`}>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded}`}
                placeholder="Optional SKU code"
              />
            </div>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Default Location
              </label>
              <select
                value={formData.defaultLocationId}
                onChange={(e) => handleChange('defaultLocationId', e.target.value)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded}`}
              >
                <option value="">Select location...</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded}`}
              placeholder="Optional notes about this item..."
            />
          </div>

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
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}