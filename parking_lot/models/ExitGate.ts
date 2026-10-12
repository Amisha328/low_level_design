import { ParkingLot } from "../services/ParkingLot";
import { Gate } from "./Gate";
import { ParkingTicket } from "./ParkingTicket";
import { GateType } from "../enums/GateType";
import { PaymentMode } from "../enums/PaymentMode";

export class ExitGate extends Gate {
    constructor(gateId: string){
        super(gateId, GateType.EXIT);
    }

    public unparkVehicle(parkingTicket: ParkingTicket, exitTime: Date, paymentMode: PaymentMode): void {
         return ParkingLot.getInstance().unparkVehicle(parkingTicket.getId(), exitTime, paymentMode);
    }
}