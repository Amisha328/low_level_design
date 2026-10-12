import { Vehicle } from "./Vehicle";
import { VehicleType } from "../enums/VehicleType";

export class Bus extends Vehicle {
    constructor(vehicleNumber: string) {
        super(vehicleNumber, VehicleType.BUS);
    }
}