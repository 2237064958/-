import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BankInvoker, 
  DepositCommand, 
  WithdrawCommand, 
  TransferCommand,
  BankAccount 
} from './services/designPatterns';
import { AccountType, AccountSnapshot, Transaction } from './types';
import { AccountCard } from './components/AccountCard';
import { OperationsPanel } from './components/OperationsPanel';
import { TransactionHistory } from './components/TransactionHistory';
import { analyzeFinances } from './services/geminiService';

// Initialize the Logic Layer (Singleton-ish for this App)
const bankSystem = new BankInvoker();

// Pre-populate with some data for demo
const acc1 = bankSystem.createAccount("John's Savings", AccountType.SAVINGS, 1000);
const acc2 = bankSystem.createAccount("John's Checking", AccountType.CHECKING, 500);
const acc3 = bankSystem.createAccount("Business Ops", AccountType.CHECKING, 2500);

export default function App() {
  // --- React State to Mirror Logic State ---
  // Since our logic is in a TS class, we need to force re-renders when data changes.
  const [version, setVersion] = useState(0); 
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(acc1.id);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Helper to sync React state with Logic state
  const refresh = () => setVersion(v => v + 1);

  // --- Derived State ---
  const accounts: AccountSnapshot[] = useMemo(() => {
    return bankSystem.getAllAccounts().map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: a.getBalance(),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]); // Re-calculate when version changes

  const selectedAccountObject = useMemo(() => {
      if(!selectedAccountId) return null;
      return bankSystem.getAccount(selectedAccountId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId, version]);

  const transactions: Transaction[] = useMemo(() => {
    if (!selectedAccountObject) return [];
    return selectedAccountObject.getTransactions();
  }, [selectedAccountObject, version]);

  // --- Handlers (Interfacing with Command Pattern) ---

  const handleDeposit = (accountId: string, amount: number) => {
    try {
      const acc = bankSystem.getAccount(accountId);
      if (acc) {
        const cmd = new DepositCommand(acc, amount);
        bankSystem.executeCommand(cmd);
        refresh();
        setErrorMsg(null);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleWithdraw = (accountId: string, amount: number) => {
    try {
      const acc = bankSystem.getAccount(accountId);
      if (acc) {
        const cmd = new WithdrawCommand(acc, amount);
        bankSystem.executeCommand(cmd);
        refresh();
        setErrorMsg(null);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleTransfer = (fromId: string, toId: string, amount: number) => {
    try {
      const from = bankSystem.getAccount(fromId);
      const to = bankSystem.getAccount(toId);
      if (from && to) {
        const cmd = new TransferCommand(from, to, amount);
        bankSystem.executeCommand(cmd);
        refresh();
        setErrorMsg(null);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleUndo = () => {
    try {
      bankSystem.undoLastCommand();
      refresh();
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleSimulateInterest = () => {
    bankSystem.applyInterestToAll();
    refresh();
  };

  const handleGetAiAdvice = async () => {
    setIsAiLoading(true);
    // Gather all transactions for context
    const allTransactions = bankSystem.getAllAccounts().flatMap(a => a.getTransactions());
    const advice = await analyzeFinances(accounts, allTransactions);
    setAiAdvice(advice);
    setIsAiLoading(false);
  };

  // Auto clear error
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                 <span className="text-white font-bold text-lg">B</span>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                DesignPattern Bank Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
               <button 
                onClick={handleUndo}
                disabled={bankSystem.getHistory().length === 0}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                 </svg>
                 撤销操作 ({bankSystem.getHistory().length})
               </button>
               <button 
                onClick={handleSimulateInterest}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 shadow-md shadow-emerald-200 transition-colors"
               >
                 模拟利息结算
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-20 right-5 z-50 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-xl animate-bounce">
          <div className="flex">
            <div className="py-1"><svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <div>
              <p className="font-bold">操作失败</p>
              <p className="text-sm">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Stats / Accounts Grid */}
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">我的账户</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(acc => {
                    const strategyName = bankSystem.getAccount(acc.id)?.getStrategyName() || '';
                    return (
                        <AccountCard 
                            key={acc.id}
                            account={acc}
                            strategyName={strategyName}
                            onSelect={setSelectedAccountId}
                            isSelected={selectedAccountId === acc.id}
                        />
                    );
                })}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Operations */}
            <div className="lg:col-span-1 space-y-8">
                <OperationsPanel 
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                    onDeposit={handleDeposit}
                    onWithdraw={handleWithdraw}
                    onTransfer={handleTransfer}
                />

                {/* AI Assistant Widget */}
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                    
                    <div className="flex items-center mb-4">
                        <span className="text-2xl mr-2">✨</span>
                        <h3 className="text-lg font-bold">Gemini 财务顾问</h3>
                    </div>
                    
                    <p className="text-indigo-200 text-sm mb-4">
                        基于您的交易历史和当前余额，获取智能投资建议和风险评估。
                    </p>

                    {aiAdvice && (
                         <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-4 text-sm leading-relaxed border border-white/10">
                            {aiAdvice.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                         </div>
                    )}

                    <button 
                        onClick={handleGetAiAdvice}
                        disabled={isAiLoading}
                        className="w-full py-2 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-70 flex justify-center items-center"
                    >
                        {isAiLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                分析中...
                            </>
                        ) : '获取建议'}
                    </button>
                </div>
            </div>

            {/* Right Column: Transaction History */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">交易记录</h3>
                        {selectedAccountObject && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {selectedAccountObject.name}
                            </span>
                        )}
                    </div>
                    <div className="p-2">
                        <TransactionHistory transactions={transactions} />
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}
