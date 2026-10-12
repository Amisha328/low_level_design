import { GateType } from "../enums/GateType";

export abstract class Gate {
    constructor(protected gateId: string, protected gateType: GateType){}

    public getGateId(): string {
        return this.gateId;
    }

    public getGateType(): GateType {
        return this.gateType;
    }
}