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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '32rem',
        width: '100%',
        maxHeight: '100vh',
        overflowY: 'auto'
      }}>
        <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb6}`}>
          <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>{title}</h2>
          <button 
            onClick={onCancel}
            style={{
              padding: '8px',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              style={{
                padding: '8px 16px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                background: 'transparent'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '8px',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                border: 'none'
              }}
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