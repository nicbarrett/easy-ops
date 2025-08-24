import React, { useState } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { CreateProductionRequestRequest, InventoryItem, Location, ProductionPriority } from '../../types/api';
import { format } from 'date-fns';
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
  const [formData, setFormData] = useState<CreateProductionRequestRequest>({
    productItemId: '',
    locationId: '',
    neededBy: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm'),
    priority: 'NORMAL',
    reason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
          <h2 className={`${globals.textXl} ${globals.fontSemibold} ${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
            <Calendar size={20} />
            New Production Request
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
              className={`${globals.px4} ${globals.py2} ${globals.border} ${globals.rounded} ${globals.textMuted}`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py2} ${globals.bgPrimary} ${globals.textPrimary} ${globals.rounded}`}
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