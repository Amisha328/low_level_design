import { TicketBuilder } from './../models/TicketBuilder';
import { PaymentStrategy } from "../strategy/payment/PaymentStrategy";
import { ParkingTicket } from "../models/ParkingTicket";

export class PaymentProcessor{
    constructor(private paymentStrategy: PaymentStrategy) {}

    public processPayment(parkingTicket: ParkingTicket, amount: number): boolean {
        const status: boolean = this.paymentStrategy.pay(parkingTicket, amount);

        if(status){
            const parkingTicket = new TicketBuilder()
                .setPaid(true);
        } else {
            const parkingTicket = new TicketBuilder()
                .setPaid(false);
            console.log("Unknown error occured");
        }
        return status;
    }
}