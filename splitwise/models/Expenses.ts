import { SplitType } from "../enums/SplitType";
import { Split } from "./Split";
import { User } from "./User";

export class Expenses {
    constructor(
        public expenseId: string, 
        public description: string, 
        public amount: number, 
        public paidBy: User, 
        public split: Split[], 
        public splitType: SplitType
    ) {}
}