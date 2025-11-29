import React from 'react';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<Props> = ({ transactions }) => {
  // Sort descending by date
  const sorted = [...transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (sorted.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        暂无交易记录
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {sorted.map((t) => (
          <li key={t.id} className="py-4 hover:bg-gray-50 px-2 rounded-lg transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`
                  p-2 rounded-full 
                  ${t.type === 'DEPOSIT' || t.type === 'INTEREST' || t.type === 'TRANSFER_IN' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'}
                `}>
                  {t.type === 'DEPOSIT' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                  {t.type === 'WITHDRAW' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                  {(t.type === 'TRANSFER_IN' || t.type === 'TRANSFER_OUT') && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                  {t.type === 'INTEREST' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.description}</p>
                  <p className="text-xs text-gray-500">{t.timestamp.toLocaleString()}</p>
                </div>
              </div>
              <div className={`text-sm font-bold ${
                 t.type === 'DEPOSIT' || t.type === 'INTEREST' || t.type === 'TRANSFER_IN'
                  ? 'text-green-600' 
                  : 'text-gray-900'
              }`}>
                {t.type === 'WITHDRAW' || t.type === 'TRANSFER_OUT' ? '-' : '+'}${t.amount.toFixed(2)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
