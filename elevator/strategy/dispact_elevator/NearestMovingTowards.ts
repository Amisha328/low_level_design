import { Direction } from "../../enum/Direction";
import { ElevatorState } from "../../enum/ElevatorState";
import { Elevator } from "../../models/Elevator";
import { ElevatorRequest } from "../../models/ElevatorRequest";
import { DispatchElevatorStrategy } from "./DispatchElevatorStrategy";

export class NearestMovingTowards implements DispatchElevatorStrategy{
    constructor(){}
    getBestElevator(request: ElevatorRequest, elevators: Elevator[]): Elevator | undefined {
        let floor = request.getFloor();
        let direction = request.getDirection();

        let best : Elevator | undefined;
        let bestDist = Infinity;

        for(let e of elevators){
            // if the elevator is idle then we don't need to consider that.
            if(e.getCurrentState() === ElevatorState.IDLE) continue;
            // if moving in opposite direction
            if(e.getCurrentDirection() !== direction) continue;
            
            // if elevator is moving in same direction but have passed the floor, we ignore that
            const current = e.getCurrentFloor();
            const approaching = direction === Direction.UP ? current < floor : current > floor;
            if(!approaching) continue; // already passed the floor

            const dist = Math.abs(current - floor);
            if(dist < bestDist){
                bestDist = dist;
                best = e;
            }
            return best;
        }
    }
}