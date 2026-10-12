
import { Vehicle } from "./Vehicle";
import { ParkingSpots } from "./ParkingSpots";
import { ParkingTicket } from "./ParkingTicket";

export class TicketBuilder {
    ticketId!: string;
    vehicle!: Vehicle;
    floorId!: string;
    spot!: ParkingSpots;
    entryTime: Date = new Date();
    exitTime?: Date;
    amount?: number;
    isPaid: boolean = false;

    setTicketId(ticketId: string): this {
        this.ticketId = ticketId;
        return this;
    }

    setVehicle(vehicle: Vehicle): this {
        this.vehicle = vehicle;
        return this;
    }

    setFloorId(floorId: string): this {
        this.floorId = floorId;
        return this;
    }

    setSpot(spot: ParkingSpots): this { this.spot = spot; return this; }
    setEntryTime(time: Date): this { this.entryTime = time; return this; }
    setExitTime(time: Date): this { this.exitTime = time; return this; }
    setAmount(amount: number): this { this.amount = amount; return this; }
    setPaid(status: boolean): this { this.isPaid = status; return this; }

    build(): ParkingTicket {
        if (!this.ticketId || !this.vehicle || !this.floorId || !this.spot) {
            throw new Error("Missing required fields for ticket creation.");
        }
        return new ParkingTicket(this);
    }
}