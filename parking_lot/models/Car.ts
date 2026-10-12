import { Vehicle } from "./Vehicle";
import { VehicleType } from "../enums/VehicleType";

export class Car extends Vehicle {
    constructor(vehicleNumber: string) {
        super(vehicleNumber, VehicleType.CAR);
    }
}