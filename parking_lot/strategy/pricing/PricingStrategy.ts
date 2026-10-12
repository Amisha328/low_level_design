import { VehicleType } from "../../enums/VehicleType";

export interface PricingStrategy {
    computeFee(vehicleType: VehicleType, entryTime: Date, exitTime: Date): number;
}