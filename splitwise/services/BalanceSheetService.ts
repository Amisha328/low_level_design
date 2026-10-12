import { BalanceSheet } from "../models/BalanceSheet";
import { Group } from "../models/Group";
import { Split } from "../models/Split";
import { User } from "../models/User";

export class BalanceSheetService {

    // Orchestrates the bi-directional balance sheet updates for an expense
    public updateBalances(group: Group, paidBy: User, totalAmount: number, splits: Split[]): void {
        const payerSheet = group.getBalanceSheetForUser(paidBy.userId);

        // Update Payer's total out-of-pocket payment
        payerSheet.addTotalPaid(totalAmount);

        // Process each participant's share
        for(let split of splits){
            const debtorId = split.user.userId;
            const splitAmount = split.amount;

            // Update participant's overall expense obligation
            const debtorSheet = group.getBalanceSheetForUser(debtorId);
            // Every participant's share counts toward their totalExpense — including the payer's own share
            debtorSheet.addTotalExpense(splitAmount);

            // Skip self-balance (Payer owing themselves)
            // But only create a ledger entry between payer and debtor if they're different people
            if (debtorId === paidBy.userId) continue;

            // Bi-directional update of BalanceSheet
            
            // Payer's view - debtor owes payer (+splitAmount)
            payerSheet.updateBalanceSheetForUser(debtorId, splitAmount);

            // Debtor's view - debtor owes payer (-splitAmount)
            debtorSheet.updateBalanceSheetForUser(paidBy.userId, -splitAmount);
        }
    }

    public printGroupBalanceSheets(group: Group): void {
        console.log(`\n========================================`);
        console.log(`     BALANCE SHEET FOR GROUP: ${group.name}`);
        console.log(`========================================`);

        const allSheets = group.getAllBalanceSheets();

        allSheets.forEach((sheet, userId) => {
            const user = group.members.get(userId);
            const userName = user ? user.name : userId;

            console.log(`\n👤 User: ${userName} (${userId})`);
            console.log(`   - Total Paid upfront:  ₹${sheet.getTotalPaid()}`);
            console.log(`   - Total Share cost:    ₹${sheet.getTotalExpense()}`);
            console.log(`   - Total Owed:          ₹${sheet.getTotalOwed()}`);
            console.log(`   - Total to Get Back:   ₹${sheet.getTotalGetBack()}`);
            console.log(`   Ledger Details:`);

            const balances = sheet.getBalances();
            if(balances.size === 0) console.log(`   (No active debts)`)
            else {
                balances.forEach((amount, otherUserId) => {
                    const otherUser = group.members.get(otherUserId);
                    const otherUserName = otherUser ? otherUser.name : otherUserId;

                    if (amount > 0) {
                        console.log(`     🟢 ${otherUserName} owes ${userName}: ₹${amount}`);
                    } else {
                        console.log(`     🔴 ${userName} owes ${otherUserName}: ₹${Math.abs(amount)}`);
                    }
                })
            }
        })
        console.log(`========================================\n`);
    }
}