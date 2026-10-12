import { ParkingTicket } from "../models/ParkingTicket";
import { ParkingFloors } from "../models/ParkingFloors";
import { PricingStrategy } from "../strategy/pricing/PricingStrategy";
import { PricingStrategyFactory } from "../factory/PricingStrategyFactory";
import { Vehicle } from "../models/Vehicle";
import { TicketBuilder } from "../models/TicketBuilder";
import { PaymentProcessor } from "./PaymentProcessor";
import { PaymentStrategyFactory } from "../factory/PaymentStrategyFactory";
import { ParkingSpots } from "../models/ParkingSpots";
import { PricingStrategyType } from "../enums/PricingStrategyType";
import { PaymentMode } from "../enums/PaymentMode";

export class ParkingLot {
    private floors = new Map<string, ParkingFloors>();
    private activeParkingTickets = new Map<string, ParkingTicket>();

    private static INSTANCE: ParkingLot = new ParkingLot();

    pricingStrategy: PricingStrategy = PricingStrategyFactory.chooseAlgo(PricingStrategyType.TIME_BASED);

    // enforce Singleton
    private constructor() {}

    public static getInstance() {
        return this.INSTANCE;
    }

    public addFloor(floor: ParkingFloors){
        this.floors.set(floor.getFloorId(), floor);
    }

    public parkVehicle(vehicle: Vehicle, entryTime: Date): ParkingTicket | null {
        
        for(const floor of this.floors.values()){
            const availableSpots = floor.getAvailableSpots(vehicle.getVehicleType());
            if(availableSpots.length === 0) continue;
            
            for(let spot of availableSpots){
                // 1. MUTATE SPOT STATE: Mark spot as occupied!
                const occupiedSuccess = spot.tryOccupy();
                if(!occupiedSuccess) continue;

                 const ticketId: string = crypto.randomUUID();
                    const parkingTicket = new TicketBuilder()
                    .setTicketId(ticketId)
                    .setVehicle(vehicle)
                    .setFloorId(floor.getFloorId())
                    .setSpot(spot)
                    .setEntryTime(entryTime)
                    .setPaid(false)
                    .build();

                this.activeParkingTickets.set(ticketId, parkingTicket);
                console.log("Vehicle Parked!! Parking Ticket Generated: "+ ticketId);
                return parkingTicket;
            }
        }
        throw new Error("No available Spot for vehicleType: " + vehicle.getVehicleType());
    }

    public unparkVehicle(ticketId: string, exitTime: Date, paymentMode: PaymentMode){
        const ticket = this.activeParkingTickets.get(ticketId) ?? null;

        if(ticket === null) {
            throw new Error("Ticket does not exist");
        }

        const amount: number = this.pricingStrategy.computeFee(ticket.getVehicle().getVehicleType(), ticket.getEntryTime(), exitTime);

        const processor: PaymentProcessor = new PaymentProcessor(PaymentStrategyFactory.choosePayment(paymentMode));

        const paid: boolean = processor.processPayment(ticket, amount);

        if(!paid){
            throw new Error("Vehicle cannot exit. Payment unsuccessful.");
        }
        ticket.markAsPaid(amount, exitTime);
        
        const spot: ParkingSpots = ticket.getSpot();
        spot.vacate();
        this.activeParkingTickets.delete(ticketId);

        console.log("Vehicle exited. Fee charged: ₹" + amount);
    }

    public printStatus(): void {
        this.floors.forEach((floor, floorId) => {
        console.log(`Floor: ${floorId}`);
    
        Array.from(floor.getSpots().values()).forEach(spot => {
            const status = spot.isOccupied() ? "Occupied" : "Free";
            console.log(`  Spot ${spot.getSpotId()} [${spot.getAllowedVehicle()}] - ${status}`);
        });
    });
    }
}