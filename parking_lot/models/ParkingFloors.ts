import { ParkingSpots } from "./ParkingSpots";
import { VehicleType } from "../enums/VehicleType";

export class ParkingFloors {
    private spots = new Map<string, ParkingSpots>;

    constructor(private floorId: string) {}

    public addSpot(spot: ParkingSpots) {
        this.spots.set(spot.getSpotId(), spot);
    }


    public getAvailableSpots(vehicleType: VehicleType) {
        let availableSpots = [];
        for(const spot of this.spots.values()){
            if(spot.getAllowedVehicle() === vehicleType && !spot.isOccupied()) {
                availableSpots.push(spot);
            }
        }
        return availableSpots;
    }

    public getFloorId(): string{
        return this.floorId;
    }

    public getSpots() {
        return this.spots;
    }
}