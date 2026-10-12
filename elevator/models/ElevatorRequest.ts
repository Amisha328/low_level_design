import { Direction } from "../enum/Direction";

export class ElevatorRequest {
    constructor(
        protected floor: number,
        protected direction?: Direction,
    ){}

    public getFloor(): number{
        return this.floor;
    }

    public getDirection(): Direction | undefined {
        return this.direction;
    }
}