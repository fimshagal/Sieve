import {AutoReportTriggerType, ISieveAutoReportTrigger} from "./lib";

export class SieveAutoReportTrigger implements ISieveAutoReportTrigger {
    public readonly type: AutoReportTriggerType;
    public readonly value: number;

    constructor(type: AutoReportTriggerType, value?: number) {
        this.type = type;
        this.value = value || 0;
    }

}