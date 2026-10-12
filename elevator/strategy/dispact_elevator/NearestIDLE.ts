import { Elevator } from "../../models/Elevator";
import { ElevatorRequest } from "../../models/ElevatorRequest";
import { DispatchElevatorStrategy } from "./DispatchElevatorStrategy";

export class NearestIDLE implements DispatchElevatorStrategy{
    constructor(){}
    getBestElevator(request: ElevatorRequest, elevators: Elevator[]): Elevator | undefined {
        let floor = request.getFloor();
        let nearestElevatorDist = Infinity;
        let nearestElevator : Elevator | undefined;
        for(let e of elevators){
            // Update NearestIdle to count an elevator as idle only when state === IDLE and it has no pending requests.
            // Otherwise two calls in the same tick can both pick the same elevator.
            if(!e.isIdle()) continue;
            if(nearestElevatorDist > Math.abs(e.getCurrentFloor() - floor)){
                nearestElevatorDist = Math.abs(e.getCurrentFloor() - floor);
                nearestElevator = e;
            }
        }
        return nearestElevator;
    }
}