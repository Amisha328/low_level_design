import { Split } from "../../models/Split";
import { SplitData } from "./SplitData";
import { SplitStrategy } from "./SplitStrategy";

export class PercentageSplitStrategy implements SplitStrategy {
    split(amount: number, splitData: SplitData[]): Split[] {
        let totalPercentage = splitData.reduce((sum, curr) => sum + (curr.value ?? 0), 0);

        // catches percentages summing to less or more than 100
        if(Math.abs(totalPercentage - 100) > 0.01) throw new Error(`Total percentage must equal 100%. Given: ${totalPercentage}%`)

        return splitData.map((data) => {
            let splitAmount = (amount * (data.value! / 100));
            return new Split(data.user, Number(splitAmount.toFixed(2)));
        })
    }
}