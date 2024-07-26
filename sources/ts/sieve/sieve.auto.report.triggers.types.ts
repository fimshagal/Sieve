import { AutoReportTriggerType, Dictionary } from "./lib";

export const SieveAutoReportTriggersTypes: Dictionary<AutoReportTriggerType> = {
    Unknown: "Unknown",
    TimeInterval: "TimeInterval",
    ErrorsQuantity : "ErrorsQuantity",
    Panic: "Panic"
};