import { VehicleFactory } from './factory/VehicleFactory';
import { EntryGate } from './models/EntryGate';
import { ExitGate } from './models/ExitGate';
import { ParkingFloors } from './models/ParkingFloors';
import { ParkingSpots } from './models/ParkingSpots';
import { ParkingLot } from './services/ParkingLot';
import { PaymentMode } from "./enums/PaymentMode";
import { VehicleType } from './enums/VehicleType';

class Driver {
    public static main(): void {
        const parkingLot = ParkingLot.getInstance();
        const entryGate1 = new EntryGate("EG1");
        const entryGate2 = new EntryGate("EG2");
        const exitGate = new ExitGate("EX1");

        const floor1 = new ParkingFloors("Floor1");
        floor1.addSpot(new ParkingSpots("F1S1", VehicleType.BIKE));
        floor1.addSpot(new ParkingSpots("F1S2", VehicleType.CAR));
        floor1.addSpot(new ParkingSpots("F1S4", VehicleType.CAR));

        parkingLot.addFloor(floor1);

        console.log("=== Initial Parking Lot Status ===");
        parkingLot.printStatus();
        console.log("----------------------------------");
        
        // Create Vehicles via Factory
        const bike1 = VehicleFactory.createVehicle("KA01AB1234", VehicleType.BIKE);
        const bike2 = VehicleFactory.createVehicle("KA01AB5678", VehicleType.BIKE);

        const entryTime = new Date();

       // Park First Vehicle
        console.log("\n--- Parking Bike 1 ---");
        const ticket1 = entryGate1.parkVehicle(bike1, entryTime);

        // 5. Attempt to Park Second Vehicle (Edge Case: Bike spot full if only 1 bike spot exists)
        console.log("\n--- Parking Bike 2 ---");
        try {
            const ticket2 = entryGate2.parkVehicle(bike2, entryTime);
        } catch (error: any) {
            console.error(`Parking Failed: ${error.message}`);
        }

        console.log("\n=== Status After Parking ===");
        parkingLot.printStatus();

        // Unpark Vehicle at Exit Gate
        console.log("\n--- Unparking Bike 1 ---");
        const exitTime = new Date(entryTime.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days later
        if (ticket1) {
            exitGate.unparkVehicle(ticket1, exitTime, PaymentMode.UPI);
        } else {
            console.error("Failed to unpark: Ticket is null or invalid.");
        }

        console.log("\n=== Final Parking Lot Status ===");
        parkingLot.printStatus();
    }
}

Driver.main();