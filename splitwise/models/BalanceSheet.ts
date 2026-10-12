export class BalanceSheet {
    private userId: string;
    private totalOwed: number = 0; // total amount I owe to others
    private totalGetBack: number = 0; // total amount others owe me

    // aggregate tracking across expense
    private totalPaid: number = 0; // total out-of-money paid upfront
    private totalExpense: number = 0; // total financial obligation/share across all expenses

    // Positive = otherUser owes me, Negative = I owe otherUser
    private balances: Map<string, number> = new Map(); // Others users balance relative to me Map<userId, netAmount>
    
    constructor(userId: string) {
        this.userId = userId;
    }

    public addTotalPaid(amount: number) : void {
        this.totalPaid = Number((this.totalPaid + amount).toFixed(2));
    }

    public addTotalExpense(amount: number): void {
        this.totalExpense = Number((this.totalExpense + amount).toFixed(2));
    }

    // Updates the balance relationship between this user and another user.
    public updateBalanceSheetForUser(otherUserId: string, deltaAmount: number): void{
        let currAmount = this.balances.get(otherUserId) ?? 0;
        let newAmount = currAmount + deltaAmount;

        if(Math.abs(newAmount) < 0.01) {
            // clear up this balance - it is settled
            this.balances.delete(otherUserId);
        } else {
            this.balances.set(otherUserId, Number(newAmount.toFixed(2)));
        }

        this.recalculateTotals();
    }

    /**
    * I am caching totalOwed and totalGetBack to serve O(1) read queries for UI summary widgets, 
    * trading a tiny bit of write-time recalculation for faster read performance.
    */
    private recalculateTotals(): void {
        let owed = 0;
        let getBack = 0;

        this.balances.forEach((amount) => {
            if(amount > 0){
                getBack += amount;
            } else {
                owed += Math.abs(amount);
            }
        });

        this.totalOwed = Number(owed.toFixed(2));
        this.totalGetBack = Number(getBack.toFixed(2));
    }

    public getTotalPaid(): number { return this.totalPaid; }
    public getTotalExpense(): number { return this.totalExpense; }
    public getTotalOwed(): number { return this.totalOwed; }
    public getTotalGetBack(): number { return this.totalGetBack; }
    public getBalances(): Map<string, number> { return this.balances; }
}