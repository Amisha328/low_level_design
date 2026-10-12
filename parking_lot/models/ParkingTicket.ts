import { Vehicle } from "./Vehicle";
import { ParkingSpots } from "./ParkingSpots";
import { TicketBuilder } from "./TicketBuilder";

export class ParkingTicket {
    // Immutable — fixed at creation, never change over the ticket's life
    readonly ticketId: string;
    readonly vehicle: Vehicle;
    readonly floorId: string;
    readonly spot: ParkingSpots;
    readonly entryTime: Date;

    // Mutable — only change once, at the moment of payment/exit
    private _exitTime?: Date;
    private _amount?: number;
    private _isPaid: boolean;

    constructor(builder: TicketBuilder){
        this.ticketId = builder.ticketId;
        this.vehicle = builder.vehicle;
        this.floorId = builder.floorId;
        this.spot = builder.spot;
        this.entryTime = builder.entryTime;
        this._exitTime = builder.exitTime;
        this._amount = builder.amount;
        this._isPaid = builder.isPaid;
    }

    public getId(): string { return this.ticketId; }
    public getVehicle(): Vehicle { return this.vehicle; }
    public getEntryTime(): Date { return this.entryTime; }
    public getSpot(): ParkingSpots { return this.spot; }
    public getExitTime(): Date | undefined { return this._exitTime; }
    public getAmount(): number | undefined { return this._amount; }
    public getIsPaid(): boolean { return this._isPaid; }

    public markAsPaid(amount: number, exitTime: Date) {
        if(this._isPaid) throw new Error("Ticket is already paid"); 
        this._isPaid = true;
        this._amount = amount;
        this._exitTime = exitTime;
    }
}