import { ParkingTicket } from "../../models/ParkingTicket";

export interface PaymentStrategy {
    pay(parkingTicket: ParkingTicket, amount: number): boolean;
}