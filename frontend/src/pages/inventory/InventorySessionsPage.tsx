import React, { useEffect, useState } from 'react';
import { Package, Plus, Clock, CheckCircle, MapPin, Camera, X } from 'lucide-react';
import apiClient from '../../services/api';
import { InventorySession, InventoryItem, Location, AddSessionLineRequest } from '../../types/api';
import { format } from 'date-fns';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import globals from '../../styles/globals.module.css';

export default function InventorySessionsPage() {
  const [sessions, setSessions] = useState<InventorySession[]>([]);
  const [activeSession, setActiveSession] = useState<InventorySession | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [closingSession, setClosingSession] = useState<InventorySession | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, itemsData, locationsData] = await Promise.all([
        apiClient.getInventorySessions(),
        apiClient.getInventoryItems(),
        apiClient.getLocations()
      ]);
      setSessions(sessionsData);
      setItems(itemsData);
      setLocations(locationsData);

      // Find active session
      const active = sessionsData.find(s => s.status === 'DRAFT');
      setActiveSession(active || null);

      setError(null);
    } catch (err) {
      setError('Failed to load session data');
      console.error('Error loading session data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (locationId: string) => {
    try {
      const newSession = await apiClient.createInventorySession({ locationId });
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);
      setShowStartModal(false);
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start inventory session');
    }
  };

  const handleCloseSession = async (sessionId: string, notes?: string) => {
    try {
      const closedSession = await apiClient.closeInventorySession(sessionId, { notes });
      setSessions(prev => prev.map(s => s.id === sessionId ? closedSession : s));
      setActiveSession(null);
      setClosingSession(null);
    } catch (err) {
      console.error('Error closing session:', err);
      setError('Failed to close inventory session');
    }
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, h:mm a');
  };

  if (loading) {
    return (
      <div className={`${globals.container} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.py16}`}>
        <div className={`${globals.textCenter}`}>
          <Package size={48} className={`${globals.mb4} ${globals.textMuted}`} />
          <p className={`${globals.textLg} ${globals.textMuted}`}>Loading inventory sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${globals.container}`}>
      <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb8}`}>
        <div>
          <h1 className={`${globals.text3xl} ${globals.fontBold} ${globals.textPrimary} ${globals.mb2}`}>
            Inventory Sessions
          </h1>
          <p className={`${globals.textLg} ${globals.textSecondary}`}>
            Track inventory counting sessions and stock levels
          </p>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          disabled={!!activeSession}
          className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py3} ${globals.bgPrimary} ${globals.textPrimary} ${globals.border} ${globals.rounded} ${globals.shadowSm} ${activeSession ? globals.opacity50 : ''}`}
        >
          <Plus size={20} />
          Start Session
        </button>
      </div>

      {/* Active Session Card */}
      {activeSession && (
        <div className={`${globals.bgPrimary} ${globals.border} ${globals.borderGreen} ${globals.borderL4} ${globals.rounded} ${globals.p6} ${globals.mb8} ${globals.shadowSm}`}>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb4}`}>
            <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3}`}>
              <div className={`${globals.p2} ${globals.bgGreen} ${globals.textGreen} ${globals.rounded}`}>
                <Package size={20} />
              </div>
              <div>
                <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>Active Session</h2>
                <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap4} ${globals.textSm} ${globals.textMuted}`}>
                  <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap1}`}>
                    <MapPin size={14} />
                    <span>{getLocationName(activeSession.locationId)}</span>
                  </div>
                  <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap1}`}>
                    <Clock size={14} />
                    <span>Started {formatDate(activeSession.startedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${globals.flex} ${globals.gap2}`}>
              <button
                onClick={() => setShowAddItemModal(true)}
                className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px3} ${globals.py2} ${globals.bgSecondary} ${globals.textPrimary} ${globals.rounded}`}
              >
                <Plus size={16} />
                Add Item
              </button>
              <button
                onClick={() => setClosingSession(activeSession)}
                className={`${globals.px3} ${globals.py2} ${globals.bgGreen} ${globals.textPrimary} ${globals.rounded}`}
              >
                <CheckCircle size={16} />
                Close Session
              </button>
            </div>
          </div>

          {/* Session Items */}
          <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridSm2} ${globals.gridLg3} ${globals.gap4}`}>
            {activeSession.lines.length === 0 ? (
              <div className={`${globals.textCenter} ${globals.py8} ${globals.textMuted} ${globals.colSpanFull}`}>
                <Package size={32} className={`${globals.mb2}`} />
                <p>No items counted yet. Add items to this session.</p>
              </div>
            ) : (
              activeSession.lines.map((line) => (
                <div key={line.id} className={`${globals.bgSecondary} ${globals.border} ${globals.rounded} ${globals.p4}`}>
                  <h3 className={`${globals.fontSemibold} ${globals.mb2}`}>
                    {line.item?.name || 'Unknown Item'}
                  </h3>
                  <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb2}`}>
                    <span className={`${globals.textLg} ${globals.fontBold} ${globals.textGreen}`}>
                      {line.count} {line.unit}
                    </span>
                    {line.photoUrl && (
                      <Camera size={16} className={`${globals.textMuted}`} />
                    )}
                  </div>
                  {line.note && (
                    <p className={`${globals.textSm} ${globals.textMuted}`}>{line.note}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <h2 className={`${globals.text2xl} ${globals.fontSemibold} ${globals.mb6}`}>Recent Sessions</h2>

        {sessions.filter(s => s.status === 'CLOSED').length === 0 ? (
          <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p12} ${globals.textCenter}`}>
            <Package size={64} className={`${globals.mb4} ${globals.textMuted}`} />
            <h3 className={`${globals.textXl} ${globals.fontSemibold} ${globals.mb2}`}>No sessions yet</h3>
            <p className={`${globals.textMuted} ${globals.mb6}`}>
              Start your first inventory session to track stock levels and maintain accurate counts.
            </p>
            <button
              onClick={() => setShowStartModal(true)}
              disabled={!!activeSession}
              className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px6} ${globals.py3} ${globals.bgPrimary} ${globals.textPrimary} ${globals.rounded} ${globals.mxAuto} ${activeSession ? globals.opacity50 : ''}`}
            >
              <Plus size={20} />
              Start First Session
            </button>
          </div>
        ) : (
          <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridMd2} ${globals.gridLg3} ${globals.gap6}`}>
            {sessions
              .filter(s => s.status === 'CLOSED')
              .map((session) => (
                <div key={session.id} className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
                  <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3} ${globals.mb4}`}>
                    <div className={`${globals.p2} ${globals.bgGray} ${globals.textGray} ${globals.rounded}`}>
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className={`${globals.fontSemibold}`}>{getLocationName(session.locationId)}</h3>
                      <p className={`${globals.textSm} ${globals.textMuted}`}>
                        {session.lines.length} items counted
                      </p>
                    </div>
                  </div>

                  <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4} ${globals.textSm} ${globals.mb4}`}>
                    <div>
                      <span className={`${globals.textMuted}`}>Started:</span>
                      <p className={`${globals.fontSemibold}`}>{formatDate(session.startedAt)}</p>
                    </div>
                    <div>
                      <span className={`${globals.textMuted}`}>Closed:</span>
                      <p className={`${globals.fontSemibold}`}>
                        {session.closedAt ? formatDate(session.closedAt) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className={`${globals.pt4} ${globals.borderT}`}>
                    <button className={`${globals.textSm} ${globals.textPrimary} ${globals.underline}`}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Start Session Modal */}
      {showStartModal && (
        <div className={`${globals.fixed} ${globals.inset0} ${globals.bgBlackOpacity50} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.p4} ${globals.zIndex50}`}>
          <div className={`${globals.bgPrimary} ${globals.rounded} ${globals.p6} ${globals.maxWMd} ${globals.wFull}`}>
            <h2 className={`${globals.textXl} ${globals.fontSemibold} ${globals.mb4}`}>Start Inventory Session</h2>
            <p className={`${globals.textMuted} ${globals.mb6}`}>
              Choose a location to begin counting inventory. You can only have one active session at a time.
            </p>

            <div className={`${globals.spaceY3} ${globals.mb6}`}>
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleStartSession(location.id)}
                  className={`${globals.wFull} ${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.p4} ${globals.border} ${globals.rounded} ${globals.textLeft} ${globals.transition}`}
                >
                  <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3}`}>
                    <MapPin size={20} className={`${globals.textMuted}`} />
                    <div>
                      <p className={`${globals.fontSemibold}`}>{location.name}</p>
                      <p className={`${globals.textSm} ${globals.textMuted}`}>{location.type}</p>
                    </div>
                  </div>
                  <Plus size={16} className={`${globals.textMuted}`} />
                </button>
              ))}
            </div>

            <div className={`${globals.flex} ${globals.justifyEnd}`}>
              <button
                onClick={() => setShowStartModal(false)}
                className={`${globals.px4} ${globals.py2} ${globals.border} ${globals.rounded} ${globals.textMuted}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item to Session Modal */}
      {showAddItemModal && activeSession && (
        <AddItemToSessionModal
          session={activeSession}
          items={items}
          onSubmit={async (data) => {
            try {
              await apiClient.addSessionLine(activeSession.id, data);
              // Reload data to get updated session
              await loadData();
              setShowAddItemModal(false);
            } catch (err) {
              console.error('Error adding item to session:', err);
              setError('Failed to add item to session');
            }
          }}
          onCancel={() => setShowAddItemModal(false)}
        />
      )}

      {/* Close Session Confirmation */}
      <ConfirmationModal
        isOpen={!!closingSession}
        title="Close Session"
        message={`Close this inventory session for ${closingSession ? getLocationName(closingSession.locationId) : ''}? This will finalize all counts and update stock levels.`}
        confirmLabel="Close Session"
        onConfirm={() => closingSession && handleCloseSession(closingSession.id)}
        onCancel={() => setClosingSession(null)}
      />
    </div>
  );
}
// Add Item to Session Modal Component
interface AddItemToSessionModalProps {
  session: InventorySession;
  items: InventoryItem[];
  onSubmit: (data: AddSessionLineRequest) => void;
  onCancel: () => void;
}

function AddItemToSessionModal({ session, items, onSubmit, onCancel }: AddItemToSessionModalProps) {
  const [formData, setFormData] = useState<AddSessionLineRequest>({
    itemId: '',
    count: 0,
    unit: 'units',
    note: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof AddSessionLineRequest, value: any) => {
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemId) {
      newErrors.itemId = 'Item is required';
    }

    if (formData.count < 0) {
      newErrors.count = 'Count cannot be negative';
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
  const alreadyCounted = session.lines.some(line => line.itemId === formData.itemId);

  return (
    <div className={`${globals.fixed} ${globals.inset0} ${globals.bgBlackOpacity50} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.p4} ${globals.zIndex50}`}>
      <div className={`${globals.bgPrimary} ${globals.rounded} ${globals.p6} ${globals.maxWLg} ${globals.wFull} ${globals.maxHScreen} ${globals.overflowYAuto}`}>
        <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb6}`}>
          <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>Add Item Count</h2>
          <button 
            onClick={onCancel}
            className={`${globals.p2} ${globals.textMuted} ${globals.rounded} ${globals.transition}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${globals.spaceY4}`}>
          {/* Item Selection */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Inventory Item *
            </label>
            <select
              value={formData.itemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.itemId ? globals.borderDanger : ''}`}
            >
              <option value="">Select item to count...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id} disabled={session.lines.some(line => line.itemId === item.id)}>
                  {item.name} ({item.category}) {session.lines.some(line => line.itemId === item.id) ? '- Already counted' : ''}
                </option>
              ))}
            </select>
            {errors.itemId && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.itemId}</p>}
            {alreadyCounted && (
              <p className={`${globals.textWarning} ${globals.textSm} ${globals.mt1}`}>
                This item has already been counted in this session.
              </p>
            )}
          </div>

          {/* Count & Unit */}
          <div className={`${globals.grid} ${globals.gridCols2} ${globals.gap4}`}>
            <div>
              <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
                Count *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.count}
                onChange={(e) => handleChange('count', parseFloat(e.target.value) || 0)}
                className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded} ${errors.count ? globals.borderDanger : ''}`}
                placeholder="0"
              />
              {errors.count && <p className={`${globals.textDanger} ${globals.textSm} ${globals.mt1}`}>{errors.count}</p>}
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

          {/* Notes */}
          <div>
            <label className={`${globals.block} ${globals.textSm} ${globals.fontMedium} ${globals.mb2}`}>
              Notes
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              rows={2}
              className={`${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded}`}
              placeholder="Optional notes about this count..."
            />
          </div>

          {/* Selected Item Info */}
          {selectedItem && (
            <div className={`${globals.p4} ${globals.bgSecondary} ${globals.border} ${globals.rounded}`}>
              <h3 className={`${globals.fontMedium} ${globals.mb2}`}>Item Details</h3>
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
              disabled={alreadyCounted}
              className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py2} ${globals.bgPrimary} ${globals.textPrimary} ${globals.rounded} ${alreadyCounted ? globals.opacity50 : ''}`}
            >
              <Package size={16} />
              Add Count
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}