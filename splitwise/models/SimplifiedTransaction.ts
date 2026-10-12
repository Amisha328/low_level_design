import { User } from "./User";

// structure representing a suggested settlement payment between two users.
export interface SimplifiedTransaction {
    from: string, // Debtor (the user who pays)
    to: string, // Creditor (the user who receives payment)
    amount: number
}