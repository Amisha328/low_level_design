import { BalanceSheet } from "./BalanceSheet";
import { Expenses } from "./Expenses";
import { User } from "./User";

export class Group {
    // Map of userId -> BalanceSheet for each user in the group
    private userBalanceSheets: Map<string, BalanceSheet> = new Map();
    
    constructor(
        public groupId: string, 
        public name: string, 
        public members: Map<string, User> = new Map(), // Default empty Map
        public expenses: Expenses[] = [] // Default empty array
    ) {}

    public getAllBalanceSheets(): Map<string, BalanceSheet> {
        return this.userBalanceSheets;
    }

    public addMembers(user: User) : void {
        this.members.set(user.userId, user);
    }

    public addExpense(expense: Expenses): void {
        this.expenses.push(expense);
    }

    // Retrieves an existing BalanceSheet for a user in the group or creates a new one.
    public getBalanceSheetForUser(userId: string): BalanceSheet {
        let sheet = this.userBalanceSheets.get(userId);
        if (!sheet) {
            sheet = new BalanceSheet(userId);
            this.userBalanceSheets.set(userId, sheet);
        }
        return sheet;
    }

    public setBalanceSheetForUser(userId: string): void {
        this.userBalanceSheets.set(userId, new BalanceSheet(userId));
    }
}