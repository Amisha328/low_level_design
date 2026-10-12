import { Elevator } from "../../models/Elevator";
import { ElevatorRequest } from "../../models/ElevatorRequest";
import { ProcessRequestStrategy } from "./ProcessRequestStrategy";

class ScanRequest implements ProcessRequestStrategy{
    addRequest(elevator: Elevator, request: ElevatorRequest): void {
        
    }
    getNextStop(elevator: Elevator): number | null {
        throw new Error("Method not implemented.");
    }
    
}