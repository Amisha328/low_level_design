import { Split } from "../../models/Split";
import { SplitData } from "./SplitData";
import { SplitStrategy } from "./SplitStrategy";

export class EqualSplitStrategy implements SplitStrategy {
    split(amount: number, splitData: SplitData[]): Split[] {
        const totalUsers = splitData.length;

        if (totalUsers === 0) throw new Error("At least one user required for split.");

        /*
        amount = 100 (rupees) → totalCents = Math.round(100 * 100) = 10000 (cents)
        totalUsers = 3
        baseCents = Math.floor(10000 / 3) = 3333 (cents each, = ₹33.33)
        remainderCents = 10000 % 3 = 1 (one leftover cent to distribute)
        Give one participant 3333 + 1 = 3334 cents (₹33.34), the other two get 3333 cents (₹33.33) each
        Total: 3334 + 3333 + 3333 = 10000 cents = exactly ₹100.00 ✓ — no drift at all
        */
        const totalCents = Math.round(amount * 100);
        const baseCents = Math.floor(totalCents / totalUsers);
        const remainderCents = totalCents - (baseCents * totalUsers);

        // console.log(`EQUAL SPLIT for ${amount} for number of users ${totalUsers} is ${Math.floor(baseCents /100)} each`);

        return splitData.map((data, index) => {
            // distribute the leftover 1-cent remainders to the first `remainderCents` participants
            const cents = baseCents + (index < remainderCents ? 1 : 0);
            return new Split(data.user, cents / 100);
        });
    }
    
}