import {IResponseResolution} from "../lib";

export class ResponseResolution implements IResponseResolution {
    public toString(): string {
        return JSON.stringify(this);
    }
}