import { SimplifiedTransaction } from './../models/SimplifiedTransaction';
import { Group } from "../models/Group";

/**
 * While finding the theoretical absolute minimum transactions for general graphs is NP-Hard,
 * this greedy O(N log N) strategy produces an optimal or near-optimal result in O(N) settlement steps, making it the standard industry choice for Splitwise.
 * 
 * Time Complexity: O(N log N) where N is the number of members in the group.
 * Space Complexity: O(N)
 */
export class DebtSimplificationService {
    /**
    * Calculates the minimum cash flow required to settle all debts in a group.
    */
    
    public simplifyDebts(group: Group): SimplifiedTransaction[] {
        const allBalanceSheets = group.getAllBalanceSheets();
        const netBalances: Map<string, number> = new Map();

        // Calculate Net Balance for each user in the group
        // Net Balance = totalPaid - totalExpense (or sum of relative balances)

        allBalanceSheets.forEach((sheet, userId) => {
            const net = sheet.getTotalPaid() - sheet.getTotalExpense();
            if(Math.abs(net) >= 0.01){
                netBalances.set(userId, Number(net.toFixed(2)));
            }
        });

        // Seperate memeber into Debtors (net -ve) and creditors (net +ve) 
        const debtors: { userId: string, amount: number } [] = [];
        const creditors: { userId: string, amount: number } [] = [];

        netBalances.forEach((netAmount, userId) => {
            if(netAmount < -0.01){
                debtors.push({ userId, amount: Math.abs(netAmount)}); // Store positive debt value
            } else if(netAmount > 0.01) {
                creditors.push({ userId, amount: netAmount});
            }
        })

        // Sort both lists in descending order to settle maximum debt first
        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const transactions: SimplifiedTransaction[] = [];

        let i = 0; // Pointer for debtors
        let j = 0; // Pointer for creditors

        while(i < debtors.length && j < creditors.length){
            // Settlement amount is the minimum of what debtor owes and creditor is owed
            const settledAmount = Math.min(debtors[i].amount, creditors[j].amount);

            transactions.push({
                from: debtors[i].userId,
                to: creditors[j].userId,
                amount: Number(settledAmount.toFixed(2))
            });

            // Debuct the settled amount from both parties
            debtors[i].amount -= settledAmount;
            creditors[j].amount -= settledAmount;

            // Move pointers when balances clear
            if(debtors[i].amount < 0.01) i++;
            if(creditors[j].amount < 0.01) j++;
        }
        return transactions;
    }
}