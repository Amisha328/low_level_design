import { VehicleType } from "../enums/VehicleType";

export class ParkingSpots {
    private spotId: string;
    private allowedVehicleType: VehicleType;
    private occupied: boolean = false; // State flag

    constructor(spotId: string, allowedVehicleType: VehicleType) {
        this.spotId = spotId;
        this.allowedVehicleType = allowedVehicleType;
    }

    public getSpotId(): string {
        return this.spotId;
    }

    public tryOccupy(): boolean {
        if(this.occupied) return false; // Already taken by another request
        this.occupied = true; // Synchronously set in the same turn of event loop
        return true;
    }

    public isOccupied(): boolean {
        return this.occupied;
    }

    public vacate(): void {
        this.occupied = false;
    }

    public getAllowedVehicle(): VehicleType {
        return this.allowedVehicleType;
    }
}