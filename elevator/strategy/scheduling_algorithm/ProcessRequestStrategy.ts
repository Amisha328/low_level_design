import { Elevator } from "../../models/Elevator"
import { ElevatorRequest } from "../../models/ElevatorRequest"

export interface ProcessRequestStrategy {
    addRequest(elevator: Elevator, request: ElevatorRequest) : void
    getNextStop(elevator: Elevator): number | null
}