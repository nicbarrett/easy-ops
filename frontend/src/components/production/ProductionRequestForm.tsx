import React, { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { CreateProductionRequestRequest, InventoryItem, Location, ProductionPriority } from '../../types/api';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import globals from '../../styles/globals.module.css';

interface ProductionRequestFormProps {
  items: InventoryItem[];
  locations: Location[];
  onSubmit: (data: CreateProductionRequestRequest) => void;
  onCancel: () => void;
}

export default function ProductionRequestForm({
  items,
  locations,
  onSubmit,
  onCancel
}: ProductionRequestFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateProductionRequestRequest>({
    productItemId: '',
    locationId: '',
    neededBy: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm'),
    targetQuantity: 1,
    unit: 'units',
    priority: 'NORMAL',
    reason: '',
    requestedBy: user?.id || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update requestedBy when user becomes available
  useEffect(() => {
    if (user?.id && !formData.requestedBy) {
      setFormData(prev => ({ ...prev, requestedBy: user.id }));
    }
  }, [user?.id, formData.requestedBy]);

  const handleChange = (field: keyof CreateProductionRequestRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productItemId) {
      newErrors.productItemId = 'Product item is required';
    }

    if (!formData.locationId) {
      newErrors.locationId = 'Location is required';
    }

    if (!formData.neededBy) {
      newErrors.neededBy = 'Needed by date is required';
    } else {
      const neededByDate = new Date(formData.neededBy);
      if (neededByDate <= new Date()) {
        newErrors.neededBy = 'Needed by date must be in the future';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (!formData.targetQuantity || formData.targetQuantity <= 0) {
      newErrors.targetQuantity = 'Target quantity must be greater than 0';
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
          <h2 className={`${globals.textXl} ${globals.fontSemibold} ${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
            <Calendar size={20} />
            New Production Request
          </h2>
          <button 
            onClick={onCancel}
            style={{
              padding: '8px',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Product Item */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Product Item *
            </label>
            <select
              value={formData.productItemId}
              onChange={(e) => handleChange('productItemId', e.target.value)}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.productItemId ? globals.borderDanger : ''}`}
            >
              <option value="">Select product to produce...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
            {errors.productItemId && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.productItemId}</p>}
          </div>

          {/* Location */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Needed At Location *
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => handleChange('locationId', e.target.value)}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.locationId ? globals.borderDanger : ''}`}
            >
              <option value="">Select location...</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.type})
                </option>
              ))}
            </select>
            {errors.locationId && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.locationId}</p>}
          </div>

          {/* Target Quantity & Unit */}
          <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4}`}>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Target Quantity *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.targetQuantity}
                onChange={(e) => handleChange('targetQuantity', parseFloat(e.target.value) || 0)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.targetQuantity ? globals.borderDanger : ''}`}
                placeholder="1.0"
              />
              {errors.targetQuantity && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.targetQuantity}</p>}
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
                placeholder="e.g., gallons, batches, dozen"
              />
              {errors.unit && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.unit}</p>}
            </div>
          </div>

          {/* Priority & Needed By Date */}
          <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4}`}>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as ProductionPriority)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded}`}
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Needed By *
              </label>
              <input
                type="datetime-local"
                value={formData.neededBy}
                onChange={(e) => handleChange('neededBy', e.target.value)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.neededBy ? globals.borderDanger : ''}`}
              />
              {errors.neededBy && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.neededBy}</p>}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Reason *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              rows={3}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.reason ? globals.borderDanger : ''}`}
              placeholder="Why is this production needed? Include any special requirements..."
            />
            {errors.reason && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.reason}</p>}
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
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
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
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Save size={16} />
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}