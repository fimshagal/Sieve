import { Dictionary, SieveErrorType } from "./lib";

export const SieveErrorTypes: Dictionary<SieveErrorType> = {
    Reference: "Reference",
    Syntax: "Syntax",
    Type: "Type",
    Range: "Range",
    Eval: "Eval",
    Uri: "Uri",
    ByEmit: "ByEmit",
    Unknown :"Unknown",
};