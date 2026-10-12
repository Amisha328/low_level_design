import { Vehicle } from "./Vehicle";
import { VehicleType } from "../enums/VehicleType";

export class Bike extends Vehicle{
    constructor(vehicleNumber: string) {
        super(vehicleNumber, VehicleType.BIKE);
    }
}