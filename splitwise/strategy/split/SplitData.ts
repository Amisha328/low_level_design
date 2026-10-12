import { User } from "../../models/User";

export interface SplitData {
    user: User;
    value?: number; // Holds exact amount, percentage value, or share count
}