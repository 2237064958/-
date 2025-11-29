export enum AccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING',
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'INTEREST';
  amount: number;
  timestamp: Date;
  description: string;
}

export interface AccountSnapshot {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
}
