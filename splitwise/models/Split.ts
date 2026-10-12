import { User } from "./User";

export class Split {
    constructor(
        public user: User,
        public amount: number
    ){}
}