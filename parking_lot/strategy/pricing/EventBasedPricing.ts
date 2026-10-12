import { PricingStrategy } from "./PricingStrategy";
import { VehicleType } from "../../enums/VehicleType";

export class EventBasedPricing implements PricingStrategy {
    // Inside a class, do not use 'const' to declare fields.
    // Add 'private readonly' so it is protected and cannot be changed accidentally.
    private readonly rates = new Map<VehicleType, number>([
        [VehicleType.BIKE, 30.0],
        [VehicleType.CAR, 70.0],
        [VehicleType.BUS, 120.0]
    ]);


    public computeFee(vehicleType: VehicleType, entryTime: Date, exitTime: Date): number {
        const durationInMills = exitTime.getTime() - entryTime.getTime();
        const hours = Math.floor(durationInMills / 1000 * 60 * 60 );

        return hours * (this.rates.get(vehicleType) ?? 0.0);
    }
}