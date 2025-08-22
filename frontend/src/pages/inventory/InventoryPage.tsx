import React from 'react';
import { Package, Plus, Search } from 'lucide-react';
import globals from '../../styles/globals.module.css';

export default function InventoryPage() {
  return (
    <div className={`${globals.container}`}>
      <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb8}`}>
        <div>
          <h1 className={`${globals.text3xl} ${globals.fontBold} ${globals.textPrimary} ${globals.mb2}`}>
            Inventory Management
          </h1>
          <p className={`${globals.textLg} ${globals.textSecondary}`}>
            Manage your ice cream ingredients and supplies
          </p>
        </div>
        <button className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py3} ${globals.bgPrimary} ${globals.textPrimary} ${globals.border} ${globals.rounded} ${globals.shadowSm}`}>
          <Plus size={20} />
          Add Item
        </button>
      </div>

      <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridMd3} ${globals.gap6}`}>
        {/* Items Library */}
        <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3} ${globals.mb4}`}>
            <Package size={24} className={`${globals.textPrimary}`} />
            <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>Items Library</h2>
          </div>
          <p className={`${globals.textSecondary} ${globals.mb4}`}>
            Manage your inventory items and set par levels
          </p>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.mb4}`}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search items..." 
              className={`${globals.flex} ${globals.wFull} ${globals.px3} ${globals.py2} ${globals.border} ${globals.rounded}`}
            />
          </div>
          <div className={`${globals.textCenter} ${globals.py8} ${globals.textMuted}`}>
            <Package size={48} className={`${globals.mb4}`} />
            <p>No items found. Add your first inventory item to get started.</p>
          </div>
        </div>

        {/* Current Stock */}
        <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
          <h2 className={`${globals.textXl} ${globals.fontSemibold} ${globals.mb4}`}>Current Stock</h2>
          <p className={`${globals.textSecondary} ${globals.mb4}`}>
            Real-time inventory levels and alerts
          </p>
          <div className={`${globals.textCenter} ${globals.py8} ${globals.textMuted}`}>
            <Package size={48} className={`${globals.mb4}`} />
            <p>No stock data available. Take inventory to see current levels.</p>
          </div>
        </div>

        {/* Inventory Sessions */}
        <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
          <h2 className={`${globals.textXl} ${globals.fontSemibold} ${globals.mb4}`}>Recent Sessions</h2>
          <p className={`${globals.textSecondary} ${globals.mb4}`}>
            Track inventory counting sessions
          </p>
          <div className={`${globals.textCenter} ${globals.py8} ${globals.textMuted}`}>
            <Package size={48} className={`${globals.mb4}`} />
            <p>No sessions yet. Start taking inventory to track stock levels.</p>
          </div>
        </div>
      </div>
    </div>
  );
}