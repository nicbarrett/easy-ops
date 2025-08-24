import React, { useEffect, useState } from 'react';
import { Factory, Plus, Calendar, Clock, CheckCircle, AlertCircle, User, MapPin } from 'lucide-react';
import apiClient from '../../services/api';
import { ProductionRequest, ProductionBatch, ProductionRequestStatus, ProductionBatchStatus, InventoryItem, Location, CreateProductionRequestRequest, CreateBatchRequest } from '../../types/api';
import ProductionRequestForm from '../../components/production/ProductionRequestForm';
import ProductionBatchForm from '../../components/production/ProductionBatchForm';
import { format } from 'date-fns';
import globals from '../../styles/globals.module.css';

export default function ProductionPage() {
  const [requests, setRequests] = useState<ProductionRequest[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, batchesData, itemsData, locationsData] = await Promise.all([
        apiClient.getProductionRequests(),
        apiClient.getProductionBatches(),
        apiClient.getInventoryItems(),
        apiClient.getLocations()
      ]);
      setRequests(requestsData);
      setBatches(batchesData);
      setItems(itemsData);
      setLocations(locationsData);
      setError(null);
    } catch (err) {
      setError('Failed to load production data');
      console.error('Error loading production data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (data: CreateProductionRequestRequest) => {
    try {
      const newRequest = await apiClient.createProductionRequest(data);
      setRequests(prev => [newRequest, ...prev]);
      setShowRequestForm(false);
    } catch (err) {
      console.error('Error creating request:', err);
      setError('Failed to create production request');
    }
  };

  const handleCreateBatch = async (data: CreateBatchRequest) => {
    try {
      const newBatch = await apiClient.createProductionBatch(data);
      setBatches(prev => [newBatch, ...prev]);
      setShowBatchForm(false);
    } catch (err) {
      console.error('Error creating batch:', err);
      setError('Failed to record production batch');
    }
  };

  const getStatusColor = (status: ProductionRequestStatus | ProductionBatchStatus) => {
    const colors = {
      OPEN: `${globals.bgBlue} ${globals.textBlue}`,
      IN_PROGRESS: `${globals.bgYellow} ${globals.textYellow}`,
      COMPLETED: `${globals.bgGreen} ${globals.textGreen}`,
      ARCHIVED: `${globals.bgGray} ${globals.textGray}`,
      RUN_OUT: `${globals.bgRed} ${globals.textRed}`
    };
    return colors[status] || `${globals.bgGray} ${globals.textGray}`;
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'HIGH' ? `${globals.bgRed} ${globals.textRed}` : `${globals.bgGray} ${globals.textGray}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, h:mm a');
  };

  const requestsByStatus = {
    OPEN: requests.filter(r => r.status === 'OPEN'),
    IN_PROGRESS: requests.filter(r => r.status === 'IN_PROGRESS'),
    COMPLETED: requests.filter(r => r.status === 'COMPLETED')
  };

  const batchesByStatus = {
    IN_PROGRESS: batches.filter(b => b.status === 'IN_PROGRESS'),
    COMPLETED: batches.filter(b => b.status === 'COMPLETED'),
    RUN_OUT: batches.filter(b => b.status === 'RUN_OUT')
  };

  if (loading) {
    return (
      <div className={`${globals.container} ${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.py16}`}>
        <div className={`${globals.textCenter}`}>
          <Factory size={48} className={`${globals.mb4} ${globals.textMuted}`} />
          <p className={`${globals.textLg} ${globals.textMuted}`}>Loading production data...</p>
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
            Production Management
          </h1>
          <p className={`${globals.textLg} ${globals.textSecondary}`}>
            Track production requests and batches ({requests.length} requests, {batches.length} batches)
          </p>
        </div>
        <div className={`${globals.flex} ${globals.gap2}`}>
          <button 
            onClick={() => setShowRequestForm(true)}
            className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py3} ${globals.bgPrimary} ${globals.textPrimary} ${globals.border} ${globals.rounded} ${globals.shadowSm}`}
          >
            <Plus size={20} />
            New Request
          </button>
          <button 
            onClick={() => setShowBatchForm(true)}
            className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py3} ${globals.bgSecondary} ${globals.textPrimary} ${globals.border} ${globals.rounded} ${globals.shadowSm}`}
          >
            <Factory size={20} />
            Record Batch
          </button>
        </div>
      </div>

      {/* Production Requests Kanban */}
      <div className={`${globals.mb8}`}>
        <h2 className={`${globals.text2xl} ${globals.fontSemibold} ${globals.mb6} ${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
          <Calendar size={24} />
          Production Requests
        </h2>
        
        <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridMd3} ${globals.gap6}`}>
          {/* Open Requests */}
          <div className={`${globals.bgSecondary} ${globals.border} ${globals.rounded} ${globals.p4}`}>
            <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb4}`}>
              <h3 className={`${globals.textLg} ${globals.fontMedium}`}>Open</h3>
              <span className={`${globals.px2} ${globals.py1} ${globals.bgBlue} ${globals.textBlue} ${globals.rounded} ${globals.textSm} ${globals.fontMedium}`}>
                {requestsByStatus.OPEN.length}
              </span>
            </div>
            
            <div className={`${globals.spaceY3}`}>
              {requestsByStatus.OPEN.length === 0 ? (
                <div className={`${globals.textCenter} ${globals.py6} ${globals.textMuted}`}>
                  <Calendar size={32} className={`${globals.mb2}`} />
                  <p className={`${globals.textSm}`}>No open requests</p>
                </div>
              ) : (
                requestsByStatus.OPEN.map((request) => (
                  <div key={request.id} className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p4} ${globals.shadowSm}`}>
                    <div className={`${globals.flex} ${globals.itemsStart} ${globals.justifyBetween} ${globals.mb2}`}>
                      <h4 className={`${globals.fontSemibold}`}>{request.productItem?.name || 'Unknown Item'}</h4>
                      <span className={`${globals.px2} ${globals.py1} ${getPriorityColor(request.priority)} ${globals.rounded} ${globals.textXs} ${globals.fontMedium}`}>
                        {request.priority}
                      </span>
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm} ${globals.textMuted}`}>
                      <MapPin size={14} />
                      <span>{request.location?.name || 'Unknown Location'}</span>
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm} ${globals.textMuted}`}>
                      <User size={14} />
                      <span>{request.requestedByUser?.name || 'Unknown User'}</span>
                    </div>
                    
                    <p className={`${globals.textSm} ${globals.mb2}`}>{request.reason}</p>
                    
                    <div className={`${globals.textXs} ${globals.textMuted}`}>
                      <p>Needed: {formatDate(request.neededBy)}</p>
                      <p>Created: {formatDate(request.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* In Progress Requests */}
          <div className={`${globals.bgSecondary} ${globals.border} ${globals.rounded} ${globals.p4}`}>
            <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb4}`}>
              <h3 className={`${globals.textLg} ${globals.fontMedium}`}>In Progress</h3>
              <span className={`${globals.px2} ${globals.py1} ${globals.bgYellow} ${globals.textYellow} ${globals.rounded} ${globals.textSm} ${globals.fontMedium}`}>
                {requestsByStatus.IN_PROGRESS.length}
              </span>
            </div>
            
            <div className={`${globals.spaceY3}`}>
              {requestsByStatus.IN_PROGRESS.length === 0 ? (
                <div className={`${globals.textCenter} ${globals.py6} ${globals.textMuted}`}>
                  <Clock size={32} className={`${globals.mb2}`} />
                  <p className={`${globals.textSm}`}>No requests in progress</p>
                </div>
              ) : (
                requestsByStatus.IN_PROGRESS.map((request) => (
                  <div key={request.id} className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p4} ${globals.shadowSm}`}>
                    <div className={`${globals.flex} ${globals.itemsStart} ${globals.justifyBetween} ${globals.mb2}`}>
                      <h4 className={`${globals.fontSemibold}`}>{request.productItem?.name || 'Unknown Item'}</h4>
                      <span className={`${globals.px2} ${globals.py1} ${getPriorityColor(request.priority)} ${globals.rounded} ${globals.textXs} ${globals.fontMedium}`}>
                        {request.priority}
                      </span>
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm} ${globals.textMuted}`}>
                      <MapPin size={14} />
                      <span>{request.location?.name || 'Unknown Location'}</span>
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm} ${globals.textMuted}`}>
                      <User size={14} />
                      <span>{request.requestedByUser?.name || 'Unknown User'}</span>
                    </div>
                    
                    <p className={`${globals.textSm} ${globals.mb2}`}>{request.reason}</p>
                    
                    <div className={`${globals.textXs} ${globals.textMuted}`}>
                      <p>Needed: {formatDate(request.neededBy)}</p>
                      <p>Started: {formatDate(request.updatedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Requests */}
          <div className={`${globals.bgSecondary} ${globals.border} ${globals.rounded} ${globals.p4}`}>
            <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb4}`}>
              <h3 className={`${globals.textLg} ${globals.fontMedium}`}>Completed</h3>
              <span className={`${globals.px2} ${globals.py1} ${globals.bgGreen} ${globals.textGreen} ${globals.rounded} ${globals.textSm} ${globals.fontMedium}`}>
                {requestsByStatus.COMPLETED.length}
              </span>
            </div>
            
            <div className={`${globals.spaceY3}`}>
              {requestsByStatus.COMPLETED.length === 0 ? (
                <div className={`${globals.textCenter} ${globals.py6} ${globals.textMuted}`}>
                  <CheckCircle size={32} className={`${globals.mb2}`} />
                  <p className={`${globals.textSm}`}>No completed requests</p>
                </div>
              ) : (
                requestsByStatus.COMPLETED.map((request) => (
                  <div key={request.id} className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p4} ${globals.shadowSm} ${globals.opacity75}`}>
                    <div className={`${globals.flex} ${globals.itemsStart} ${globals.justifyBetween} ${globals.mb2}`}>
                      <h4 className={`${globals.fontSemibold}`}>{request.productItem?.name || 'Unknown Item'}</h4>
                      <CheckCircle size={16} className={`${globals.textGreen}`} />
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm} ${globals.textMuted}`}>
                      <MapPin size={14} />
                      <span>{request.location?.name || 'Unknown Location'}</span>
                    </div>
                    
                    <div className={`${globals.textXs} ${globals.textMuted}`}>
                      <p>Completed: {formatDate(request.updatedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Production Batches Kanban */}
      <div>
        <h2 className={`${globals.text2xl} ${globals.fontSemibold} ${globals.mb6} ${globals.flex} ${globals.itemsCenter} ${globals.gap2}`}>
          <Factory size={24} />
          Production Batches
        </h2>
        
        <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridMd3} ${globals.gap6}`}>
          {/* In Progress Batches */}
          <div className={`${globals.bgSecondary} ${globals.border} ${globals.rounded} ${globals.p4}`}>
            <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb4}`}>
              <h3 className={`${globals.textLg} ${globals.fontMedium}`}>In Progress</h3>
              <span className={`${globals.px2} ${globals.py1} ${globals.bgYellow} ${globals.textYellow} ${globals.rounded} ${globals.textSm} ${globals.fontMedium}`}>
                {batchesByStatus.IN_PROGRESS.length}
              </span>
            </div>
            
            <div className={`${globals.spaceY3}`}>
              {batchesByStatus.IN_PROGRESS.length === 0 ? (
                <div className={`${globals.textCenter} ${globals.py6} ${globals.textMuted}`}>
                  <Clock size={32} className={`${globals.mb2}`} />
                  <p className={`${globals.textSm}`}>No batches in progress</p>
                </div>
              ) : (
                batchesByStatus.IN_PROGRESS.map((batch) => (
                  <div key={batch.id} className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p4} ${globals.shadowSm} ${globals.borderL4} ${globals.borderYellow}`}>
                    <div className={`${globals.flex} ${globals.itemsStart} ${globals.justifyBetween} ${globals.mb2}`}>
                      <h4 className={`${globals.fontSemibold}`}>{batch.productItem?.name || 'Unknown Item'}</h4>
                      <span className={`${globals.px2} ${globals.py1} ${getStatusColor(batch.status)} ${globals.rounded} ${globals.textXs} ${globals.fontMedium}`}>
                        {batch.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm}`}>
                      <span className={`${globals.fontMedium}`}>{batch.quantityMade} {batch.unit}</span>
                      <span className={`${globals.textMuted}`}>Lot: {batch.lotCode}</span>
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm} ${globals.textMuted}`}>
                      <User size={14} />
                      <span>{batch.madeByUser?.name || 'Unknown User'}</span>
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm} ${globals.textMuted}`}>
                      <MapPin size={14} />
                      <span>{batch.storageLocation?.name || 'Unknown Location'}</span>
                    </div>
                    
                    {batch.startedAt && (
                      <div className={`${globals.textXs} ${globals.textMuted}`}>
                        <p>Started: {formatDate(batch.startedAt)}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Batches */}
          <div className={`${globals.bgSecondary} ${globals.border} ${globals.rounded} ${globals.p4}`}>
            <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb4}`}>
              <h3 className={`${globals.textLg} ${globals.fontMedium}`}>Completed</h3>
              <span className={`${globals.px2} ${globals.py1} ${globals.bgGreen} ${globals.textGreen} ${globals.rounded} ${globals.textSm} ${globals.fontMedium}`}>
                {batchesByStatus.COMPLETED.length}
              </span>
            </div>
            
            <div className={`${globals.spaceY3}`}>
              {batchesByStatus.COMPLETED.length === 0 ? (
                <div className={`${globals.textCenter} ${globals.py6} ${globals.textMuted}`}>
                  <CheckCircle size={32} className={`${globals.mb2}`} />
                  <p className={`${globals.textSm}`}>No completed batches</p>
                </div>
              ) : (
                batchesByStatus.COMPLETED.map((batch) => (
                  <div key={batch.id} className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p4} ${globals.shadowSm} ${globals.borderL4} ${globals.borderGreen} ${globals.opacity75}`}>
                    <div className={`${globals.flex} ${globals.itemsStart} ${globals.justifyBetween} ${globals.mb2}`}>
                      <h4 className={`${globals.fontSemibold}`}>{batch.productItem?.name || 'Unknown Item'}</h4>
                      <CheckCircle size={16} className={`${globals.textGreen}`} />
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm}`}>
                      <span className={`${globals.fontMedium} ${globals.textGreen}`}>{batch.quantityMade} {batch.unit}</span>
                      <span className={`${globals.textMuted}`}>Lot: {batch.lotCode}</span>
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm} ${globals.textMuted}`}>
                      <MapPin size={14} />
                      <span>{batch.storageLocation?.name || 'Unknown Location'}</span>
                    </div>
                    
                    {batch.finishedAt && (
                      <div className={`${globals.textXs} ${globals.textMuted}`}>
                        <p>Completed: {formatDate(batch.finishedAt)}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Run Out / Depleted Batches */}
          <div className={`${globals.bgSecondary} ${globals.border} ${globals.rounded} ${globals.p4}`}>
            <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb4}`}>
              <h3 className={`${globals.textLg} ${globals.fontMedium}`}>Run Out</h3>
              <span className={`${globals.px2} ${globals.py1} ${globals.bgRed} ${globals.textRed} ${globals.rounded} ${globals.textSm} ${globals.fontMedium}`}>
                {batchesByStatus.RUN_OUT.length}
              </span>
            </div>
            
            <div className={`${globals.spaceY3}`}>
              {batchesByStatus.RUN_OUT.length === 0 ? (
                <div className={`${globals.textCenter} ${globals.py6} ${globals.textMuted}`}>
                  <AlertCircle size={32} className={`${globals.mb2}`} />
                  <p className={`${globals.textSm}`}>No run out batches</p>
                </div>
              ) : (
                batchesByStatus.RUN_OUT.map((batch) => (
                  <div key={batch.id} className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p4} ${globals.shadowSm} ${globals.borderL4} ${globals.borderRed} ${globals.opacity60}`}>
                    <div className={`${globals.flex} ${globals.itemsStart} ${globals.justifyBetween} ${globals.mb2}`}>
                      <h4 className={`${globals.fontSemibold}`}>{batch.productItem?.name || 'Unknown Item'}</h4>
                      <AlertCircle size={16} className={`${globals.textRed}`} />
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm}`}>
                      <span className={`${globals.fontMedium} ${globals.textRed}`}>{batch.quantityMade} {batch.unit}</span>
                      <span className={`${globals.textMuted}`}>Lot: {batch.lotCode}</span>
                    </div>
                    
                    <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb2} ${globals.textSm} ${globals.textMuted}`}>
                      <MapPin size={14} />
                      <span>{batch.storageLocation?.name || 'Unknown Location'}</span>
                    </div>
                    
                    <div className={`${globals.textXs} ${globals.textMuted}`}>
                      <p>Run out: {formatDate(batch.updatedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Production Request Form */}
      {showRequestForm && (
        <ProductionRequestForm
          items={items}
          locations={locations}
          onSubmit={handleCreateRequest}
          onCancel={() => setShowRequestForm(false)}
        />
      )}

      {/* Production Batch Form */}
      {showBatchForm && (
        <ProductionBatchForm
          items={items}
          locations={locations}
          onSubmit={handleCreateBatch}
          onCancel={() => setShowBatchForm(false)}
        />
      )}
    </div>
  );
}