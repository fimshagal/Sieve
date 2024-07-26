import { Dictionary } from "../oko/lib";

export const typeOf = (object: any): string => {
    return Object.prototype.toString.call(object)
        .replace(/^\[object (.+)\]$/, '$1')
        .toLowerCase();
};

export class is {
    private static _num(object: any): boolean {
        return typeof object === "number" || object instanceof Number;
    }

    public static rNum(object: any): boolean{
        return is._num(object)
            && !isNaN(object)
            && isFinite(object);
    }

    static iNum(object: any): boolean{
        return is._num(object);
    }

    static str(object: any): boolean{
        return typeof object === "string" || object instanceof String;
    }

    static bool(object: any): boolean{
        return typeof object === "boolean" || object instanceof Boolean;
    }

    static obj(object: any): boolean{
        return /object/.test(typeOf(object));
    }

    static symbol(object: any): boolean {
        return typeof object === "symbol";
    }

    static objEquals(objectA: Dictionary, objectB: Dictionary): boolean {
        const objectAKeys = Object.keys(objectA);
        const objectBKeys = Object.keys(objectB);

        if (objectAKeys.length !== objectBKeys.length) {
            return false;
        }

        for (const key of objectAKeys) {
            if (!objectB.hasOwnProperty(key)
                || objectA[key] !== objectB[key]
                || typeOf(objectA[key]) !== typeOf(objectB[key])
            )
            {
                return false;
            }
        }

        return true;
    }

    static arr(object: any): boolean{
        return Array.isArray(object);
    }

    static xmlEl(object: any): boolean{
        try {
            if(typeof object === "string") {
                object = document.querySelector(object);
            }
            return /^(html)+(.)+(element)$|htmlelement|^(svg)+(.)+(element)$/gm.test(typeOf(object));
        } catch(err){
            return false;
        }
    }

    static url(string: string): boolean {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }

    static json(string: string): boolean {
        try {
            JSON.parse(string);
            return true;
        } catch (error) {
            return false;
        }
    }

    static jsonLike(object: any): boolean {
        try {
            JSON.stringify(object);
            return true;
        } catch (error) {
            return false;
        }
    }

    static fn(fn: any): boolean {
        return fn && typeof fn === "function";
    }

    static scalar(object: any): boolean{
        return is.str(object)
            || is._num(object)
            || is.bool(object)
            || is.symbol(object);
    }
}
