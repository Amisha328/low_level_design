import { ParkingLot } from "../services/ParkingLot";
import { Gate } from "./Gate";
import { ParkingTicket } from "./ParkingTicket";
import { Vehicle } from "./Vehicle";
import { GateType } from "../enums/GateType";

export class EntryGate extends Gate {
    constructor(gateId: string) {
        super(gateId, GateType.ENTRY);
    }

    public parkVehicle(vehicle: Vehicle, entryTime: Date): ParkingTicket | null {
        return ParkingLot.getInstance().parkVehicle(vehicle, entryTime);
    }
}