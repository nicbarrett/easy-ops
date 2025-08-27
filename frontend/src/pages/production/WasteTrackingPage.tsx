import React, { useEffect, useState } from 'react';
import { Trash2, Plus, AlertTriangle, Calendar, User, Package, Factory, X } from 'lucide-react';
import apiClient from '../../services/api';
import { WasteEvent, InventoryItem, ProductionBatch, RecordWasteRequest, WasteReason } from '../../types/api';
import { format } from 'date-fns';
import globals from '../../styles/globals.module.css';

export default function WasteTrackingPage() {
  const [wasteEvents, setWasteEvents] = useState<WasteEvent[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWasteForm, setShowWasteForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wasteData, itemsData, batchesData] = await Promise.all([
        apiClient.getWasteEvents(),
        apiClient.getInventoryItems(),
        apiClient.getProductionBatches()
      ]);
      setWasteEvents(wasteData);
      setItems(itemsData);
      setBatches(batchesData);
      setError(null);
    } catch (err) {
      setError('Failed to load waste tracking data');
      console.error('Error loading waste data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordWaste = async (data: RecordWasteRequest) => {
    try {
      const newWaste = await apiClient.recordWaste(data);
      setWasteEvents(prev => [newWaste, ...prev]);
      setShowWasteForm(false);
    } catch (err) {
      console.error('Error recording waste:', err);
      setError('Failed to record waste event');
    }
  };

  const getReasonColor = (reason: WasteReason) => {
    const colors = {
      SPOILAGE: `${globals.bgRed} ${globals.textRed}`,
      TEMPERATURE_EXCURSION: `${globals.bgOrange} ${globals.textOrange}`,
      QA_FAILURE: `${globals.bgYellow} ${globals.textYellow}`,
      ACCIDENT: `${globals.bgPurple} ${globals.textPurple}`,
      OTHER: `${globals.bgGray} ${globals.textGray}`
    };
    return colors[reason] || `${globals.bgGray} ${globals.textGray}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, h:mm a');
  };

  const groupedEvents = wasteEvents.reduce((groups, event) => {
    const date = format(new Date(event.recordedAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, WasteEvent[]>);

  const totalWasteValue = wasteEvents.reduce((sum, event) => sum + event.quantity, 0);
  const wasteByReason = wasteEvents.reduce((counts, event) => {
    counts[event.reason] = (counts[event.reason] || 0) + event.quantity;
    return counts;
  }, {} as Record<WasteReason, number>);

  if (loading) {
    return (
      <div className={`${globals.container} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.py16}`}>
        <div className={`${globals.textCenter}`}>
          <Trash2 size={48} className={`${globals.mb4} ${globals.textMuted}`} />
          <p className={`${globals.textLg} ${globals.textMuted}`}>Loading waste tracking data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${globals.container} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.py16}`}>
        <div className={`${globals.textCenter}`}>
          <AlertTriangle size={48} className={`${globals.mb4} ${globals.textDanger}`} />
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
            Waste Tracking
          </h1>
          <p className={`${globals.textLg} ${globals.textSecondary}`}>
            Record and monitor waste events ({wasteEvents.length} events tracked)
          </p>
        </div>
        <button 
          onClick={() => setShowWasteForm(true)}
          className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py3} ${globals.bgDanger} ${globals.textPrimary} ${globals.border} ${globals.rounded} ${globals.shadowSm}`}
        >
          <Plus size={20} />
          Record Waste
        </button>
      </div>

      {/* Waste Summary Cards */}
      <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridMd3} ${globals.gap6} ${globals.mb8}`}>
        <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3} ${globals.mb2}`}>
            <Trash2 size={24} className={`${globals.textDanger}`} />
            <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>Total Waste</h2>
          </div>
          <p className={`${globals.text3xl} ${globals.fontBold} ${globals.textDanger}`}>
            {totalWasteValue.toFixed(1)} units
          </p>
          <p className={`${globals.textSm} ${globals.textMuted}`}>
            Across all items and batches
          </p>
        </div>

        <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3} ${globals.mb2}`}>
            <AlertTriangle size={24} className={`${globals.textWarning}`} />
            <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>Top Waste Reason</h2>
          </div>
          {Object.keys(wasteByReason).length > 0 ? (
            <>
              <p className={`${globals.text3xl} ${globals.fontBold} ${globals.textWarning}`}>
                {Object.entries(wasteByReason).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
              </p>
              <p className={`${globals.textSm} ${globals.textMuted}`}>
                {Object.entries(wasteByReason).sort(([,a], [,b]) => b - a)[0]?.[1]?.toFixed(1) || '0'} units wasted
              </p>
            </>
          ) : (
            <>
              <p className={`${globals.text3xl} ${globals.fontBold} ${globals.textMuted}`}>None</p>
              <p className={`${globals.textSm} ${globals.textMuted}`}>No waste recorded yet</p>
            </>
          )}
        </div>

        <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3} ${globals.mb2}`}>
            <Calendar size={24} className={`${globals.textInfo}`} />
            <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>This Week</h2>
          </div>
          <p className={`${globals.text3xl} ${globals.fontBold} ${globals.textInfo}`}>
            {wasteEvents.filter(e => {
              const eventDate = new Date(e.recordedAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return eventDate > weekAgo;
            }).length}
          </p>
          <p className={`${globals.textSm} ${globals.textMuted}`}>
            Waste events recorded
          </p>
        </div>
      </div>

      {/* Waste Events Timeline */}
      <div>
        <h2 className={`${globals.text2xl} ${globals.fontSemibold} ${globals.mb6}`}>Waste Events</h2>
        
        {Object.keys(groupedEvents).length === 0 ? (
          <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p12} ${globals.textCenter}`}>
            <Trash2 size={64} className={`${globals.mb4} ${globals.textMuted}`} />
            <h3 className={`${globals.textXl} ${globals.fontSemibold} ${globals.mb2}`}>No waste events</h3>
            <p className={`${globals.textMuted} ${globals.mb6}`}>
              No waste has been recorded yet. Start tracking waste to monitor and reduce losses.
            </p>
            <button 
              onClick={() => setShowWasteForm(true)}
              className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px6} ${globals.py3} ${globals.bgDanger} ${globals.textPrimary} ${globals.rounded} ${globals.mxAuto}`}
            >
              <Plus size={20} />
              Record First Waste Event
            </button>
          </div>
        ) : (
          <div className={`${globals.spaceY6}`}>
            {Object.entries(groupedEvents)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, events]) => (
                <div key={date} className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
                  <h3 className={`${globals.textLg} ${globals.fontSemibold} ${globals.mb4} ${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
                    <Calendar size={20} />
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    <span className={`${globals.px2} ${globals.py1} ${globals.bgDanger} ${globals.textDanger} ${globals.rounded} ${globals.textSm} ${globals.fontMedium}`}>
                      {events.length} event{events.length !== 1 ? 's' : ''}
                    </span>
                  </h3>
                  
                  <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridMd2} ${globals.gap4}`}>
                    {events.map((event) => (
                      <div key={event.id} className={`${globals.bgSecondary} ${globals.border} ${globals.rounded} ${globals.p4} ${globals.borderL4} ${getReasonColor(event.reason).includes('Red') ? globals.borderRed : globals.borderYellow}`}>
                        <div className={`${globals.flex} ${globals.itemsStart} ${globals.justifyBetween} ${globals.mb3}`}>
                          <div>
                            <h4 className={`${globals.fontSemibold} ${globals.mb1}`}>
                              {event.item?.name || 'Unknown Item'}
                            </h4>
                            <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.textSm} ${globals.textMuted}`}>
                              {event.batch ? (
                                <>
                                  <Factory size={14} />
                                  <span>Batch: {event.batch.lotCode}</span>
                                </>
                              ) : (
                                <>
                                  <Package size={14} />
                                  <span>General inventory</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className={`${globals.px2} ${globals.py1} ${getReasonColor(event.reason)} ${globals.rounded} ${globals.textXs} ${globals.fontMedium}`}>
                            {event.reason.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb3}`}>
                          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
                            <span className={`${globals.textLg} ${globals.fontBold} ${globals.textDanger}`}>
                              {event.quantity} {event.unit}
                            </span>
                            <span className={`${globals.textSm} ${globals.textMuted}`}>wasted</span>
                          </div>
                          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap1} ${globals.textSm} ${globals.textMuted}`}>
                            <User size={14} />
                            <span>{event.recordedByUser?.name || 'Unknown User'}</span>
                          </div>
                        </div>
                        
                        <div className={`${globals.textXs} ${globals.textMuted} ${globals.mb2}`}>
                          {formatDate(event.recordedAt)}
                        </div>
                        
                        {event.notes && (
                          <div className={`${globals.pt2} ${globals.borderT}`}>
                            <p className={`${globals.textSm}`}>{event.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Record Waste Form */}
      {showWasteForm && (
        <RecordWasteForm
          items={items}
          batches={batches}
          onSubmit={handleRecordWaste}
          onCancel={() => setShowWasteForm(false)}
        />
      )}
    </div>
  );
}

// Record Waste Form Component
interface RecordWasteFormProps {
  items: InventoryItem[];
  batches: ProductionBatch[];
  onSubmit: (data: RecordWasteRequest) => void;
  onCancel: () => void;
}

function RecordWasteForm({ items, batches, onSubmit, onCancel }: RecordWasteFormProps) {
  const [formData, setFormData] = useState<RecordWasteRequest>({
    itemId: '',
    quantity: 0,
    unit: 'units',
    reason: 'OTHER',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasteSource, setWasteSource] = useState<'item' | 'batch'>('item');

  const handleChange = (field: keyof RecordWasteRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    setFormData(prev => ({
      ...prev,
      itemId,
      unit: item?.unit || 'units'
    }));
    if (errors.itemId) {
      setErrors(prev => ({ ...prev, itemId: '' }));
    }
  };

  const handleBatchChange = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch?.productItem) {
      setFormData(prev => ({
        ...prev,
        batchId,
        itemId: batch.productItem!.id,
        unit: batch.unit
      }));
    }
    if (errors.batchId) {
      setErrors(prev => ({ ...prev, batchId: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemId) {
      newErrors.itemId = wasteSource === 'item' ? 'Item is required' : 'Batch is required';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
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

  const selectedItem = items.find(item => item.id === formData.itemId);
  const selectedBatch = formData.batchId ? batches.find(batch => batch.id === formData.batchId) : null;

  return (
    <div className={`${globals.fixed} ${globals.inset0} ${globals.bgBlackOpacity50} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.p4} ${globals.zIndex50}`}>
      <div className={`${globals.bgPrimary} ${globals.rounded} ${globals.p6} ${globals.maxWLg} ${globals.wFull} ${globals.maxHScreen} ${globals.overflowYAuto}`}>
        <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb6}`}>
          <h2 className={`${globals.textXl} ${globals.fontSemibold} ${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
            <Trash2 size={20} />
            Record Waste Event
          </h2>
          <button 
            onClick={onCancel}
            className={`${globals.p2} ${globals.textMuted} ${globals.rounded} ${globals.transition}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${globals.spaceY4}`}>
          {/* Waste Source Type */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Waste Source *
            </label>
            <div className={`${globals.flex} ${globals.gap4}`}>
              <button
                type="button"
                onClick={() => {
                  setWasteSource('item');
                  setFormData(prev => ({ ...prev, batchId: undefined }));
                }}
                className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py2} ${globals.border} ${globals.rounded} ${wasteSource === 'item' ? globals.bgPrimary : globals.bgSecondary} ${globals.transition}`}
              >
                <Package size={16} />
                General Item
              </button>
              <button
                type="button"
                onClick={() => setWasteSource('batch')}
                className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py2} ${globals.border} ${globals.rounded} ${wasteSource === 'batch' ? globals.bgPrimary : globals.bgSecondary} ${globals.transition}`}
              >
                <Factory size={16} />
                Production Batch
              </button>
            </div>
          </div>

          {/* Item or Batch Selection */}
          {wasteSource === 'item' ? (
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Inventory Item *
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => handleItemChange(e.target.value)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.itemId ? globals.borderDanger : ''}`}
              >
                <option value="">Select item...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.category})
                  </option>
                ))}
              </select>
              {errors.itemId && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.itemId}</p>}
            </div>
          ) : (
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Production Batch *
              </label>
              <select
                value={formData.batchId || ''}
                onChange={(e) => handleBatchChange(e.target.value)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.batchId ? globals.borderDanger : ''}`}
              >
                <option value="">Select batch...</option>
                {batches.filter(b => b.status !== 'RUN_OUT').map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.productItem?.name || 'Unknown Item'} - Lot {batch.lotCode} ({batch.quantityMade} {batch.unit})
                  </option>
                ))}
              </select>
              {errors.batchId && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.batchId}</p>}
            </div>
          )}

          {/* Quantity & Unit */}
          <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4}`}>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Quantity Wasted *
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.quantity ? globals.borderDanger : ''}`}
                placeholder="0"
              />
              {errors.quantity && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.quantity}</p>}
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
                placeholder="e.g., lbs, gallons, each"
              />
              {errors.unit && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.unit}</p>}
            </div>
          </div>

          {/* Waste Reason */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Waste Reason *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value as WasteReason)}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded}`}
            >
              <option value="SPOILAGE">Spoilage</option>
              <option value="TEMPERATURE_EXCURSION">Temperature Excursion</option>
              <option value="QA_FAILURE">Quality Assurance Failure</option>
              <option value="ACCIDENT">Accident</option>
              <option value="OTHER">Other</option>
            </select>
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
              placeholder="Describe what happened and any corrective actions taken..."
            />
          </div>

          {/* Selected Item/Batch Info */}
          {(selectedItem || selectedBatch) && (
            <div className={`${globals.p4} ${globals.bgSecondary} ${globals.border} ${globals.rounded}`}>
              <h3 className={`${globals.fontMedium} ${globals.mb2}`}>
                {selectedBatch ? 'Batch Details' : 'Item Details'}
              </h3>
              <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4} ${globals.textSm}`}>
                <div>
                  <span className={`${globals.textMuted}`}>Name:</span>
                  <p className={`${globals.fontSemibold}`}>
                    {selectedBatch ? selectedBatch.productItem?.name : selectedItem?.name}
                  </p>
                </div>
                <div>
                  <span className={`${globals.textMuted}`}>Category:</span>
                  <p className={`${globals.fontSemibold}`}>
                    {selectedBatch ? selectedBatch.productItem?.category : selectedItem?.category}
                  </p>
                </div>
                {selectedBatch && (
                  <>
                    <div>
                      <span className={`${globals.textMuted}`}>Lot Code:</span>
                      <p className={`${globals.fontSemibold}`}>{selectedBatch.lotCode}</p>
                    </div>
                    <div>
                      <span className={`${globals.textMuted}`}>Available:</span>
                      <p className={`${globals.fontSemibold}`}>{selectedBatch.quantityMade} {selectedBatch.unit}</p>
                    </div>
                  </>
                )}
              </div>
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
              className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py2} ${globals.bgDanger} ${globals.textPrimary} ${globals.rounded}`}
            >
              <Trash2 size={16} />
              Record Waste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}