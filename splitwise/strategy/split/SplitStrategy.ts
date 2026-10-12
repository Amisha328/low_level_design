import { Split } from "../../models/Split";
import { SplitData } from "./SplitData";

export interface SplitStrategy {
    split(amount: number, splitData: SplitData[]): Split[]
}