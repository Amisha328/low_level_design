import { Split } from "../../models/Split";
import { SplitData } from "./SplitData";
import { SplitStrategy } from "./SplitStrategy";

export class ExactSplitStrategy implements SplitStrategy {
    split(amount: number, splitData: SplitData[]): Split[] {
        let totalAmount = splitData.reduce((sum, curr) => sum + (curr.value ?? 0), 0);

        // Floating-point arithmetic can produce things like 99.99999999999999 !== 100 
        // even when they're "logically" equal (classic JS float issue). So, dons't do exact !== 100
        // if(totalAmount !== amount) throw new Error(`Total amount ${totalAmount} must be equal to ${amount}`)

        if(Math.abs(totalAmount - amount) > 0.01) throw new Error(`Total amount ${totalAmount} must be equal to ${amount}`)

        return splitData.map((data) => {
            return new Split(data.user, data.value ?? 0);
        })
    }
}