import { SplitType } from "../enums/SplitType";
import { Expenses } from "../models/Expenses";
import { Group } from "../models/Group";
import { SimplifiedTransaction } from "../models/SimplifiedTransaction";
import { User } from "../models/User";
import { GroupRepo } from "../repository/GroupRepo";
import { SplitData } from "../strategy/split/SplitData";
import { DebtSimplificationService } from "./DebtSimplificationService";
import { ExpenseService } from "./ExpenseService";

export class GroupService {

    constructor(
        private groupRepo: GroupRepo,
        private expenseService: ExpenseService,
        private simplifier: DebtSimplificationService
    ) {};

    /**
     * Orchestrates Group Creation & Persistence
    */
    public createGroup(groupName: string, initialMembers: User[]){
        const groupId = crypto.randomUUID();
        const group: Group = new Group(groupId, groupName);

        initialMembers.forEach((user) => group.addMembers(user));

        this.groupRepo.save(group);
        return group;
    }

    /**
    * Retrieval query method
    */
    public getGroup(groupId: string): Group {
        const group = this.groupRepo.findById(groupId);
        if(!group){
            throw new Error(`Group with ID ${groupId} not found.`);
        }
        return group;
    }

    /**
     * Orchestrates Adding a Member to an existing Group
    */
    public addMember(groupId: string, user: User): void {
        const group = this.groupRepo.findById(groupId);
        if(!group){
            throw new Error(`Group with ID ${groupId} not found.`);
        }

        group.addMembers(user);
        this.groupRepo.save(group);
    }

    /**
     * Delegates expense processing to ExpenseService
    */
    public async addExpense(groupId: string, description: string, amount: number, paidBy: User, splitData: SplitData[], splitType: SplitType): Promise<Expenses> {
        return await this.expenseService.addExpense(
            groupId,
            description,
            amount,
            paidBy,
            splitType,
            splitData
        )
    }

    /**
    * Delegates debt simplification calculation
   */
    public simplifyDebts(groupId: string): SimplifiedTransaction[] {
        const group = this.groupRepo.findById(groupId);
        if (!group) {
            throw new Error(`Group with ID ${groupId} not found.`);
        }
        return this.simplifier.simplifyDebts(group);
    }
}