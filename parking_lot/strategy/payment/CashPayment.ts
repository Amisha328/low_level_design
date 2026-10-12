import { ParkingTicket } from "../../models/ParkingTicket";
import { PaymentStrategy } from "./PaymentStrategy";

export class CashPayment implements PaymentStrategy {
    public pay(ParkingTicket: ParkingTicket, amount: number): boolean {
        console.log(`Payment sucessful! For ParkingTicket ${ParkingTicket.getId()} of amount ₹${amount} via Cash`);
        return true;
    }
}