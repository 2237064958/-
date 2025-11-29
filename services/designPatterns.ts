import { AccountType, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ==========================================
// 1. Strategy Pattern: Interest Calculation
// ==========================================

export interface InterestStrategy {
  calculateInterest(balance: number): number;
  getDescription(): string;
}

export class SavingsInterestStrategy implements InterestStrategy {
  private rate: number = 0.03; // 3% interest

  calculateInterest(balance: number): number {
    return balance * this.rate;
  }

  getDescription(): string {
    return `Savings Strategy (${this.rate * 100}%)`;
  }
}

export class CheckingInterestStrategy implements InterestStrategy {
  calculateInterest(balance: number): number {
    return 0; // No interest
  }

  getDescription(): string {
    return "Checking Strategy (0%)";
  }
}

// ==========================================
// Domain Entity: Bank Account
// ==========================================

export class BankAccount {
  public readonly id: string;
  public name: string;
  public readonly type: AccountType;
  private balance: number;
  private interestStrategy: InterestStrategy;
  private transactions: Transaction[];

  constructor(name: string, type: AccountType, initialBalance: number = 0) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.balance = initialBalance;
    this.transactions = [];
    
    // Assign Strategy based on type
    if (type === AccountType.SAVINGS) {
      this.interestStrategy = new SavingsInterestStrategy();
    } else {
      this.interestStrategy = new CheckingInterestStrategy();
    }
  }

  deposit(amount: number, description: string = 'Deposit') {
    if (amount <= 0) throw new Error("Deposit amount must be positive");
    this.balance += amount;
    this.addTransaction('DEPOSIT', amount, description);
  }

  withdraw(amount: number, description: string = 'Withdraw') {
    if (amount <= 0) throw new Error("Withdraw amount must be positive");
    if (amount > this.balance) {
      throw new Error(`Insufficient funds. Balance: ${this.balance}, Requested: ${amount}`);
    }
    this.balance -= amount;
    this.addTransaction('WITHDRAW', amount, description);
  }

  applyInterest() {
    const interest = this.interestStrategy.calculateInterest(this.balance);
    if (interest > 0) {
      this.balance += interest;
      this.addTransaction('INTEREST', interest, 'Interest Credited');
    }
    return interest;
  }

  getBalance(): number {
    return this.balance;
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getStrategyName(): string {
    return this.interestStrategy.getDescription();
  }

  // Helper for internal use to bypass balance checks during Undo operations if necessary
  // In a real system, Undo is complex. Here we simplify by using inverse operations.
  forceBalanceChange(amount: number) {
      this.balance += amount;
  }

  private addTransaction(type: Transaction['type'], amount: number, description: string) {
    this.transactions.push({
      id: uuidv4(),
      accountId: this.id,
      type,
      amount,
      timestamp: new Date(),
      description
    });
  }
}

// ==========================================
// 2. Command Pattern: Operations
// ==========================================

export interface BankCommand {
  execute(): void;
  undo(): void;
  getDescription(): string;
}

export class DepositCommand implements BankCommand {
  constructor(private account: BankAccount, private amount: number) {}

  execute() {
    this.account.deposit(this.amount);
  }

  undo() {
    // Undo deposit is a withdrawal (ignoring limits for simplicity of undo logic, or using force)
    this.account.withdraw(this.amount, "UNDO: Revert Deposit");
  }

  getDescription() {
    return `Deposit $${this.amount} to ${this.account.name}`;
  }
}

export class WithdrawCommand implements BankCommand {
  constructor(private account: BankAccount, private amount: number) {}

  execute() {
    this.account.withdraw(this.amount);
  }

  undo() {
    // Undo withdraw is a deposit
    this.account.deposit(this.amount, "UNDO: Revert Withdraw");
  }

  getDescription() {
    return `Withdraw $${this.amount} from ${this.account.name}`;
  }
}

export class TransferCommand implements BankCommand {
  constructor(
    private fromAccount: BankAccount,
    private toAccount: BankAccount,
    private amount: number
  ) {}

  execute() {
    this.fromAccount.withdraw(this.amount, `Transfer to ${this.toAccount.name}`);
    this.toAccount.deposit(this.amount, `Transfer from ${this.fromAccount.name}`);
  }

  undo() {
    // Reverse the transfer
    this.toAccount.withdraw(this.amount, `UNDO: Revert Transfer from ${this.fromAccount.name}`);
    this.fromAccount.deposit(this.amount, `UNDO: Revert Transfer to ${this.toAccount.name}`);
  }

  getDescription() {
    return `Transfer $${this.amount} from ${this.fromAccount.name} to ${this.toAccount.name}`;
  }
}

// ==========================================
// Invoker (The Bank Manager)
// ==========================================

export class BankInvoker {
  private accounts: Map<string, BankAccount> = new Map();
  private history: BankCommand[] = [];

  createAccount(name: string, type: AccountType, initialBalance: number): BankAccount {
    const account = new BankAccount(name, type, initialBalance);
    this.accounts.set(account.id, account);
    return account;
  }

  getAccount(id: string): BankAccount | undefined {
    return this.accounts.get(id);
  }

  getAllAccounts(): BankAccount[] {
    return Array.from(this.accounts.values());
  }

  executeCommand(command: BankCommand) {
    try {
      command.execute();
      this.history.push(command);
    } catch (e: any) {
      console.error("Command Execution Failed:", e.message);
      throw e; // Re-throw to UI
    }
  }

  undoLastCommand() {
    const command = this.history.pop();
    if (command) {
      try {
        command.undo();
      } catch (e) {
        console.error("Undo Failed:", e);
        // Put it back if undo fails? In this simple model, we just log.
        this.history.push(command); 
        throw e;
      }
    }
  }

  getHistory(): BankCommand[] {
    return [...this.history];
  }

  // Simulate passing of time for interest calculation
  applyInterestToAll() {
    this.accounts.forEach(acc => acc.applyInterest());
  }
}
