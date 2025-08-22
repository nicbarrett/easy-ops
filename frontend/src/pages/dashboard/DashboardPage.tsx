import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Factory,
  Clock,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api';
import { CurrentStock, ProductionRequest, ProductionBatch, WasteEvent } from '../../types/api';
import styles from './DashboardPage.module.css';
import globals from '../../styles/globals.module.css';

interface DashboardData {
  lowStockItems: CurrentStock[];
  openRequests: ProductionRequest[];
  todaysBatches: ProductionBatch[];
  recentWaste: WasteEvent[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await apiClient.getDashboardData();
      setData(dashboardData);
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyCenter} ${globals.py8}`}>
        <div className={`${globals.textLg} ${globals.textMuted}`}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <AlertTriangle size={48} />
        <h2>Failed to Load Dashboard</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            {getGreeting()}, {user?.name}!
          </h1>
          <p className={styles.subtitle}>
            Here's what's happening at Sweet Swirls today
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatsCard
          title="Low Stock Items"
          value={data?.lowStockItems.length || 0}
          icon={AlertTriangle}
          color="warning"
          subtitle="Need attention"
        />
        <StatsCard
          title="Open Requests"
          value={data?.openRequests.length || 0}
          icon={Clock}
          color="info"
          subtitle="Production pending"
        />
        <StatsCard
          title="Today's Batches"
          value={data?.todaysBatches.length || 0}
          icon={Factory}
          color="success"
          subtitle="Completed today"
        />
        <StatsCard
          title="Recent Waste"
          value={data?.recentWaste.length || 0}
          icon={Package}
          color="danger"
          subtitle="This week"
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Low Stock Alert */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Low Stock Items</h3>
            <AlertTriangle size={20} className={styles.warningIcon} />
          </div>
          <div className={styles.cardContent}>
            {data?.lowStockItems.length === 0 ? (
              <div className={styles.emptyState}>
                <Package size={32} />
                <p>All items are well stocked!</p>
              </div>
            ) : (
              <div className={styles.itemList}>
                {data?.lowStockItems.slice(0, 5).map((stock) => (
                  <div key={stock.id} className={styles.stockItem}>
                    <div className={styles.stockInfo}>
                      <span className={styles.itemName}>
                        {stock.item?.name || 'Unknown Item'}
                      </span>
                      <span className={styles.stockLevel}>
                        {stock.quantity} {stock.item?.unit}
                      </span>
                    </div>
                    <div className={styles.parLevel}>
                      Par: {stock.item?.parStockLevel}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Open Production Requests */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Open Production Requests</h3>
            <Clock size={20} className={styles.infoIcon} />
          </div>
          <div className={styles.cardContent}>
            {data?.openRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <Factory size={32} />
                <p>No pending production requests</p>
              </div>
            ) : (
              <div className={styles.itemList}>
                {data?.openRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className={styles.requestItem}>
                    <div className={styles.requestInfo}>
                      <span className={styles.itemName}>
                        {request.productItem?.name || 'Unknown Product'}
                      </span>
                      <span className={styles.requestPriority}>
                        {request.priority}
                      </span>
                    </div>
                    <div className={styles.requestDate}>
                      Due: {new Date(request.neededBy).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Production */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Today's Production</h3>
            <TrendingUp size={20} className={styles.successIcon} />
          </div>
          <div className={styles.cardContent}>
            {data?.todaysBatches.length === 0 ? (
              <div className={styles.emptyState}>
                <Factory size={32} />
                <p>No batches completed today</p>
              </div>
            ) : (
              <div className={styles.itemList}>
                {data?.todaysBatches.slice(0, 5).map((batch) => (
                  <div key={batch.id} className={styles.batchItem}>
                    <div className={styles.batchInfo}>
                      <span className={styles.itemName}>
                        {batch.productItem?.name || 'Unknown Product'}
                      </span>
                      <span className={styles.batchQuantity}>
                        {batch.quantityMade} {batch.unit}
                      </span>
                    </div>
                    <div className={styles.batchStatus}>
                      {batch.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'success' | 'warning' | 'danger' | 'info';
  subtitle: string;
}

function StatsCard({ title, value, icon: Icon, color, subtitle }: StatsCardProps) {
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsContent}>
        <div className={styles.statsText}>
          <h3 className={styles.statsTitle}>{title}</h3>
          <div className={styles.statsValue}>{value}</div>
          <p className={styles.statsSubtitle}>{subtitle}</p>
        </div>
        <div className={`${styles.statsIcon} ${styles[`icon${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}