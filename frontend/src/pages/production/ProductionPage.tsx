import React from 'react';
import { Factory, Plus, Calendar } from 'lucide-react';
import globals from '../../styles/globals.module.css';

export default function ProductionPage() {
  return (
    <div className={`${globals.container}`}>
      <div className={`${globals.flex} ${globals.itemsCenter} ${globals.justifyBetween} ${globals.mb8}`}>
        <div>
          <h1 className={`${globals.text3xl} ${globals.fontBold} ${globals.textPrimary} ${globals.mb2}`}>
            Production Management
          </h1>
          <p className={`${globals.textLg} ${globals.textSecondary}`}>
            Track production requests, batches, and waste events
          </p>
        </div>
        <button className={`${globals.flex} ${globals.itemsCenter} ${globals.gap2} ${globals.px4} ${globals.py3} ${globals.bgPrimary} ${globals.textPrimary} ${globals.border} ${globals.rounded} ${globals.shadowSm}`}>
          <Plus size={20} />
          New Request
        </button>
      </div>

      <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridMd2} ${globals.gap6}`}>
        {/* Production Requests */}
        <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3} ${globals.mb4}`}>
            <Calendar size={24} className={`${globals.textInfo}`} />
            <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>Production Requests</h2>
          </div>
          <p className={`${globals.textSecondary} ${globals.mb4}`}>
            Manage production requests and priorities
          </p>
          <div className={`${globals.textCenter} ${globals.py8} ${globals.textMuted}`}>
            <Calendar size={48} className={`${globals.mb4}`} />
            <p>No production requests. Create a request to start production planning.</p>
          </div>
        </div>

        {/* Production Batches */}
        <div className={`${globals.bgPrimary} ${globals.border} ${globals.rounded} ${globals.p6} ${globals.shadowSm}`}>
          <div className={`${globals.flex} ${globals.itemsCenter} ${globals.gap3} ${globals.mb4}`}>
            <Factory size={24} className={`${globals.textSuccess}`} />
            <h2 className={`${globals.textXl} ${globals.fontSemibold}`}>Production Batches</h2>
          </div>
          <p className={`${globals.textSecondary} ${globals.mb4}`}>
            Track completed and in-progress batches
          </p>
          <div className={`${globals.textCenter} ${globals.py8} ${globals.textMuted}`}>
            <Factory size={48} className={`${globals.mb4}`} />
            <p>No batches recorded. Start recording production to track output.</p>
          </div>
        </div>
      </div>

      {/* Kanban Board Placeholder */}
      <div className={`${globals.mt8}`}>
        <h2 className={`${globals.text2xl} ${globals.fontSemibold} ${globals.mb6}`}>Production Board</h2>
        <div className={`${globals.grid} ${globals.gridCols1} ${globals.gridMd3} ${globals.gap4}`}>
          {['Open', 'In Progress', 'Completed'].map((status) => (
            <div key={status} className={`${globals.bgSecondary} ${globals.border} ${globals.rounded} ${globals.p4}`}>
              <h3 className={`${globals.textLg} ${globals.fontMedium} ${globals.mb4} ${globals.textCenter}`}>
                {status}
              </h3>
              <div className={`${globals.textCenter} ${globals.py8} ${globals.textMuted}`}>
                <Factory size={32} className={`${globals.mb2}`} />
                <p className={`${globals.textSm}`}>No items</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}