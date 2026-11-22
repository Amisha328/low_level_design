// ExpenseService manages expense calculation and atomicity using an AsyncMutex per group 
// to prevent concurrent updates from corrupting group balances.

import { Mutex } from "async-mutex";
import { GroupRepo } from "../repository/GroupRepo";
import { User } from "../models/User";
import { SplitType } from "../enums/SplitType";
import { SplitData } from "../strategy/split/SplitData";
import { Expenses } from "../models/Expenses";
import { SplitStrategyFactory } from "../factory/SplitStrategyFactory";
import { BalanceSheetService } from "./BalanceSheetService";
import { Split } from "../models/Split";
import { DebtSimplificationService } from "./DebtSimplificationService";

export class ExpenseService {
    private groupLocks: Map<string, Mutex> = new Map(); // groupId -> Mutex

    constructor(
        private groupRepo: GroupRepo,
        private balanceSheetService: BalanceSheetService,
        private debtSimplifier: DebtSimplificationService
    ){}

    public getGroupLock(groupId: string){
        if(!this.groupLocks.has(groupId)){
            this.groupLocks.set(groupId, new Mutex());
        }

        return this.groupLocks.get(groupId);
    }

    public async addExpense(groupId: string, description: string, totalAmount: number, paidBy: User, splitType: SplitType, splitData: SplitData[]): Promise<Expenses>{
        if (totalAmount <= 0) throw new Error(`totalAmount is <= 0`)

        const lock = this.getGroupLock(groupId);
        if(!lock) throw new Error(`can't acquire the lock for the groupId ${groupId}`);

        // Acquire lock for this specific group
        const release = await lock.acquire();

        try{
            // Retrieve group
            const group = this.groupRepo.findById(groupId);
            if(!group){
                throw new Error(`Group with ID ${groupId} not found.`);
            }

            // Validate payer is in group
            if(!group.members.has(paidBy.userId)){
                throw new Error(`Payer ${paidBy.name} is not a member of this group.`);
            }

            // Validate participants are in the group
            splitData.forEach((participant) => {
                if(!group.members.has(participant.user.userId)){
                    throw new Error(`Participant ${participant.user.name} is not a member of this group.`);
                }
            })

            // Resolve Strategy & Calculate Splits
            const strategy = SplitStrategyFactory.getSplitStrategy(splitType);
            const splits = strategy.split(totalAmount, splitData);

            // Create Expense Instance
            const expense = new Expenses(
                crypto.randomUUID(),
                description,
                totalAmount,
                paidBy,
                splits,
                splitType
            );

            // Update Group Balance Sheets
            this.balanceSheetService.updateBalances(group, paidBy, totalAmount, splits);

            // save state
            group.expenses.push(expense);

            // Auto-simplify pairwise balances if the group has simplification enabled
            if (group.isSimplifyDebtsEnabled()) {
                const simplified = this.debtSimplifier.simplifyDebts(group);
                this.debtSimplifier.applySimplifiedBalances(group, simplified);
            }

            this.groupRepo.save(group);

            return expense;
        } finally {
            release(); // release lock
        }
    }

    /*
    Acquire the group lock & save:
        Use the same this.getGroupLock(groupId) mutex so a settlement and an expense on the same group don't race
    */
    public async settleUp(groupId: string, fromUser: User, toUser: User, amount: number): Promise<void> {
        if(amount <= 0) throw new Error("Settlement amount must be greater than 0");
        if(fromUser.userId === toUser.userId) throw new Error("Cannot settle up with yourself");

        const lock = this.getGroupLock(groupId);
        if(!lock) throw new Error(`can't acquire the lock for the groupId ${groupId}`);

        const release = await lock.acquire();

        try {
            let group = this.groupRepo.findById(groupId);
            if (!group) throw new Error(`Group with ID ${groupId} not found.`);

            if (!group.members.has(fromUser.userId) || !group.members.has(toUser.userId)) {
                throw new Error("Both users must be members of the group.");
            }

            // fromUser pays toUser -> fromUser's balance with toUser increases by +amount,
            // and toUser's balance with fromUser decreases by -amount.
            this.balanceSheetService.updateBalances(
                group,
                fromUser,
                amount,
                [new Split(toUser, amount)],
                true
            )

            this.groupRepo.save(group);

        } finally {
            release();
        }
    }
}