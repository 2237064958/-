import React, { useState } from 'react';
import { AccountSnapshot } from '../types';

interface Props {
  accounts: AccountSnapshot[];
  selectedAccountId: string | null;
  onDeposit: (accountId: string, amount: number) => void;
  onWithdraw: (accountId: string, amount: number) => void;
  onTransfer: (fromId: string, toId: string, amount: number) => void;
}

enum OperationType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
}

export const OperationsPanel: React.FC<Props> = ({ 
  accounts, 
  selectedAccountId, 
  onDeposit, 
  onWithdraw, 
  onTransfer 
}) => {
  const [type, setType] = useState<OperationType>(OperationType.DEPOSIT);
  const [amount, setAmount] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;
    
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert("请输入有效的金额");
      return;
    }

    try {
      if (type === OperationType.DEPOSIT) {
        onDeposit(selectedAccountId, val);
      } else if (type === OperationType.WITHDRAW) {
        onWithdraw(selectedAccountId, val);
      } else if (type === OperationType.TRANSFER) {
        if (!targetId) {
            alert("请选择收款账户");
            return;
        }
        onTransfer(selectedAccountId, targetId, val);
      }
      setAmount('');
    } catch (err) {
      // Error handled by parent mostly, but safety here
      console.error(err);
    }
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  // Filter out the selected account for transfer targets
  const targetAccounts = accounts.filter(a => a.id !== selectedAccountId);

  if (!selectedAccountId || !selectedAccount) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-dashed border-gray-300">
        <p className="text-gray-500">请先在左侧选择一个账户以进行操作</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="bg-indigo-600 w-2 h-6 rounded mr-3"></span>
        资金操作: <span className="text-indigo-600 ml-2">{selectedAccount.name}</span>
      </h2>

      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {[
          { id: OperationType.DEPOSIT, label: '存款' },
          { id: OperationType.WITHDRAW, label: '取款' },
          { id: OperationType.TRANSFER, label: '转账' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setType(tab.id)}
            className={`
              flex-1 py-2 text-sm font-medium rounded-lg transition-all
              ${type === tab.id 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">金额</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {type === OperationType.TRANSFER && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">转入账户</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              required
            >
              <option value="">-- 选择收款人 --</option>
              {targetAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (${acc.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className={`
            w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95
            ${type === OperationType.DEPOSIT ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200' : ''}
            ${type === OperationType.WITHDRAW ? 'bg-gradient-to-r from-orange-500 to-red-600 shadow-red-200' : ''}
            ${type === OperationType.TRANSFER ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-indigo-200' : ''}
          `}
        >
          {type === OperationType.DEPOSIT && '确认存款'}
          {type === OperationType.WITHDRAW && '确认取款'}
          {type === OperationType.TRANSFER && '确认转账'}
        </button>
      </form>
    </div>
  );
};
