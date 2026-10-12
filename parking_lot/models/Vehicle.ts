import { VehicleType } from "../enums/VehicleType";

export abstract class Vehicle {
   constructor(protected vehicleNumber: string, protected vehicleType: VehicleType) {}

   public getVehicleNumber(): string {
        return this.vehicleNumber;
   }

   public getVehicleType(): VehicleType {
        return this.vehicleType;
   }
}