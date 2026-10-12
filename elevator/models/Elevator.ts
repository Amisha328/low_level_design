import { Direction } from "../enum/Direction";
import { ElevatorState } from "../enum/ElevatorState";
import { ElevatorRequest } from "./ElevatorRequest";

export class Elevator {
    constructor(
        private elevatorId: string,
        private currentFloor: number,
        private currentState: ElevatorState,
        private direction?: Direction,
    ){}

    private requests = new Set<number>();

    public getElevatorId(): string {
        return this.elevatorId;
    }

    public getCurrentFloor(): number{
        return this.currentFloor;
    }

    public getCurrentState(): ElevatorState {
        return this.currentState;
    }

    public getCurrentDirection(): Direction | undefined {
        return this.direction;
    }

    public addRequest(floor: number): void{
        // current floor same as requested floor is no-ops
        if(floor === this.currentFloor) return;
        this.requests.add(floor);
    }

    public step(): void {
        // case 1: Nothing pending: go IDLE and forget direction
        if(this.requests.size === 0){
            this.currentState = ElevatorState.IDLE;
            this.direction = undefined;
            return;
        }

        // case 2: No direction yet: Pick a direction if IDLE based on hall call.
        if(this.currentState === ElevatorState.IDLE || this.direction === undefined){
            const nearest = this.findNearestRequest()!;
            this.direction = nearest > this.currentFloor ? Direction.UP : Direction.DOWN;
        }

        // case 3: If current floor matches any destination floor -> Stop at current floor
        if(this.requests.has(this.currentFloor)){
            this.requests.delete(this.currentFloor);
            this.currentState = ElevatorState.STOPPED;
            return;
        }

        // Case 4: reverse direction if no request ahead
        if(!this.hasRequestAhead(this.direction)){
            this.direction = this.direction === Direction.UP ? Direction.DOWN : Direction.UP;
            return;
        }

        // case 5: Keep moving in the same direction -> move one floor
        this.currentState = ElevatorState.MOVING;
        this.currentFloor += this.direction === Direction.UP ? 1 : -1;
        
    }

    private findNearestRequest(): number {
        // Scan all requests, find closest request by floor distance
        let nearestFloorReq = 0, minDist = Infinity;
        for(let floor of this.requests){
            let distance = Math.abs(floor - this.currentFloor);
            if(distance < minDist){
                minDist = distance;
                nearestFloorReq = floor;
            }
        }
        return nearestFloorReq;
    }

    private hasRequestAhead(direction: Direction): boolean {
        // Check if ANY request exists ahead in the given direction

        for(let floor of this.requests){
            if(direction === Direction.UP && floor > this.currentFloor) return true;
            else if(direction === Direction.DOWN && floor < this.currentFloor) return true;
        }
        return false;
    }

    isIdle(): boolean {
        return this.currentState === ElevatorState.IDLE && this.requests.size === 0;
    }
}