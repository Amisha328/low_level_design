import { Gate } from "../models/Gate";
import { EntryGate } from "../models/EntryGate";
import { ExitGate } from "../models/ExitGate";
import { GateType } from "../enums/GateType";

export class GateFactory {
    public static createGate(gateId: string, gateType: GateType): Gate {
        switch (gateType) {
            case GateType.ENTRY:
                return new EntryGate(gateId);
            case GateType.EXIT:
                return new ExitGate(gateId);
            default:
                throw new Error(`Invalid Gate Type: ${gateType}`);
        }
    }
    
}