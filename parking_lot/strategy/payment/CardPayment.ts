import { PaymentStrategy } from "./PaymentStrategy";
import { ParkingTicket } from "../../models/ParkingTicket";

export class CardPayment implements PaymentStrategy {
    public pay(ParkingTicket: ParkingTicket, amount: number): boolean {
        console.log(`Payment sucessful! For ParkingTicket ${ParkingTicket.getId()} of amount ₹${amount} via Card`);
        return true;
    }
}