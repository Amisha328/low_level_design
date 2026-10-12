import { Elevator } from "../../models/Elevator";
import { ElevatorRequest } from "../../models/ElevatorRequest";

export interface DispatchElevatorStrategy {
    getBestElevator(request: ElevatorRequest, elevators: Elevator[]): Elevator | undefined;
}