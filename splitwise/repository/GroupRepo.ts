import { Group } from "../models/Group";

export interface GroupRepo {
    findById(groupId: string): Group
    save(group: Group): void
}