import { NearestMovingTowards } from './strategy/dispact_elevator/NearestMovingTowards';
import { Direction } from "./enum/Direction";
import { ElevatorState } from "./enum/ElevatorState";
import { Elevator } from "./models/Elevator";
import { ElevatorController } from "./service/ElevatorController";
import { NearestIDLE } from './strategy/dispact_elevator/NearestIdle';


function main(): void{
    const elevator1 = new Elevator("E1", 2, ElevatorState.IDLE);
    const elevator2 = new Elevator("E2", 7, ElevatorState.MOVING, Direction.UP);
    const elevators = [elevator1, elevator2];
    const elevatorController = new ElevatorController(elevators, 10, new NearestIDLE(), new NearestMovingTowards());

    elevatorController.selectDestinationFloor("E1", 4);
    elevatorController.selectDestinationFloor("E2", 5);
    elevatorController.requestElevator(3, Direction.UP);

    logElevatorSteps(0, elevators);
    for(let tick = 1; tick <= 8; tick++){
        elevatorController.step();
        logElevatorSteps(tick, elevators);
    }    
}

function logElevatorSteps(tick: number, elevators: Elevator[]): void {
    const row = elevators
        .map((e) => `${e.getElevatorId()}: floor ${e.getCurrentFloor()} ${e.getCurrentState()} ${e.getCurrentDirection() ?? "-"}`)
        .join(" | ");
    console.log(`tick ${tick} -> ${row}`);
}


main();