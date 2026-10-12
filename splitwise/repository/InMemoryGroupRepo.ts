import { Group } from "../models/Group";
import { GroupRepo } from "./GroupRepo";

export class InMemoryGroupRepo implements GroupRepo{
    private groupStore: Map<string, Group> = new Map();

    findById(groupId: string): Group {
        let group = this.groupStore.get(groupId);
        if(!group){
            throw new Error(`No group exist with the groupId: ${groupId}`);
        }
        return group;
    }
    save(group: Group): void {
       this.groupStore.set(group.groupId, group);
    }

}