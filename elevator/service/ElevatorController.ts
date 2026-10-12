import { Direction } from '../enum/Direction';
import { Elevator } from '../models/Elevator';
import { ElevatorRequest } from '../models/ElevatorRequest';
import { DispatchElevatorStrategy } from '../strategy/dispact_elevator/DispatchElevatorStrategy';
import { NearestIDLE } from '../strategy/dispact_elevator/NearestIdle';
import { NearestMovingTowards } from '../strategy/dispact_elevator/NearestMovingTowards';
export class ElevatorController {
    private pendingHallCalls: ElevatorRequest[] = [];

    constructor(
        private elevators: Elevator[],
        private numFloors: number,
        private primary: DispatchElevatorStrategy = new NearestIDLE(),
        private fallback: DispatchElevatorStrategy = new NearestMovingTowards()
    ){}
    
    private validateFloor(floor: number): void{
        if(!Number.isInteger(floor) || floor < 0 || floor >= this.numFloors){
            throw new Error(`Invalid floor ${floor}`);
        }
    }

    step(): void {
        this.retryPendingRequests();
        for(let e of this.elevators){
            e.step();
        }
    }

    // Hall call: assigned now, or queued and retried each tick
    requestElevator(floor: number, direction: Direction.UP | Direction.DOWN): void {
        // Find the best elevator to handle this request
        // Send the request to the elevator
        this.validateFloor(floor);

        const request = new ElevatorRequest(floor, direction);
        const elevator = this.dispatch(request);
        if(elevator) elevator.addRequest(floor);
        else this.pendingHallCalls.push(request);
    }

    private dispatch(request: ElevatorRequest): Elevator | undefined {
        return this.primary.getBestElevator(request, this.elevators) 
            ?? this.fallback.getBestElevator(request, this.elevators);
    }

     // Destination request from inside a specific elevator
    selectDestinationFloor(elevatorId: string, floor: number): void {
        this.validateFloor(floor);
        const elevator = this.elevators.find((e) => e.getElevatorId() === elevatorId);
        if(!elevator) throw new Error(`No elevator ${elevatorId} exists`);
        elevator.addRequest(floor);
    }

    private retryPendingRequests(): void{
        const pendingRequests: ElevatorRequest[] = [];
        for(const request of this.pendingHallCalls){
            let elevator = this.dispatch(request);
            if(elevator) elevator.addRequest(request.getFloor());
            else pendingRequests.push(request);
        }
        this.pendingHallCalls = pendingRequests;
    }
}