import React from 'react';
import { AccountType, AccountSnapshot } from '../types';

interface Props {
  account: AccountSnapshot;
  strategyName: string;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const AccountCard: React.FC<Props> = ({ account, strategyName, onSelect, isSelected }) => {
  const isSavings = account.type === AccountType.SAVINGS;
  
  return (
    <div 
      onClick={() => onSelect(account.id)}
      className={`
        relative p-6 rounded-2xl transition-all duration-300 cursor-pointer border-2
        ${isSelected 
          ? 'border-indigo-600 shadow-xl scale-[1.02]' 
          : 'border-transparent bg-white shadow-md hover:shadow-lg hover:border-gray-200'}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{account.name}</h3>
          <span className={`
            inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1
            ${isSavings ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
          `}>
            {account.type === AccountType.SAVINGS ? '储蓄账户' : '支票账户'}
          </span>
        </div>
        <div className={`p-2 rounded-lg ${isSavings ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
            {isSavings ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-gray-500">当前余额</p>
        <p className="text-3xl font-extrabold text-gray-800">
          ${account.balance.toFixed(2)}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        策略: {strategyName}
      </div>
    </div>
  );
};
