import { Vehicle } from "../models/Vehicle";
import { Bike } from "../models/Bike";
import { Car } from "../models/Car";
import { Bus } from "../models/Bus";
import { VehicleType } from "../enums/VehicleType";

export class VehicleFactory {
    public static createVehicle(vehicleNumber: string, vehicleType: VehicleType): Vehicle{
        switch (vehicleType) {
            case VehicleType.BIKE:
                return new Bike(vehicleNumber);
            case VehicleType.CAR:
                return new Car(vehicleNumber);
            case VehicleType.BUS:
                return new Bus(vehicleNumber);
            default:
                throw new Error(`Invalid vehicle type: ${vehicleType}`);
        }
    }
}