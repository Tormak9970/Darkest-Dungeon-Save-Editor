/**
 * DarkestDungeon Save Editor is a tool for viewing and modifying DarkestDungeon game saves.
 * Copyright (C) 2022 Travis Lane (Tormak)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>
 */

/**
 * General utility class
 */
export class Utils {
    private static saveRegexA = new RegExp(".*persist\\..*\\.json");
    private static saveRegexB = new RegExp("novelty_tracker\\.json");

    /**
     * Checks if a file is a DarkestDungeon save file
     * @param fileName The file name to check
     * @returns True if the file is a valid save file
     */
    static isSaveFile(fileName:string):boolean {
        return Utils.saveRegexA.test(fileName) || Utils.saveRegexB.test(fileName);
    }
}

/**
 * 
 * @param func The function to throttle
 * @param wait The amount of time in between each run
 * @returns A function that throttles the provided function
 */
export function throttle(func:any, wait:number) {
    let waiting = false;
    return function () {
        if (waiting) {
            return;
        } else {
            func.apply(this, arguments);
        }
    
        waiting = true;
        setTimeout(() => {
            waiting = false;
        }, wait);
    };
}

/**
 * Generates an Iterator
 */
export interface IteratorGenerator {
    get():Iterator;
}

/**
 * Iterates over data
 */
export interface Iterator {
    hasNext():boolean;
    next():string;
}

/**
 * An IteratorGenerator for NameIterators
 */
class NameIteratorGenerator implements IteratorGenerator {
    private stack:Stack<string>;

    constructor(stack:Stack<string>) {
        this.stack = stack;
    }

    get() {
        return new NameIterator(this.stack);
    }
}

/**
 * An Iterator for nameStacks
 */
class NameIterator implements Iterator {
    private stack:Stack<string>;
    private curIdx:number;

    constructor(stack:Stack<string>) {
        this.stack = stack;
        this.curIdx = stack.size() - 1;
    }
    hasNext():boolean {
        return this.curIdx >= 0;
    }
    next():string {
        const f = this.stack.get(this.curIdx);
        this.curIdx--;
        return f;
    }
}

/**
 * Gets a new NameIteratorGenerator based on the provided stack
 * @param stack A stack of type string
 * @returns A new NameIteratorGenerator
 */
export function getNameIttr(stack:Stack<string>) {
    return new NameIteratorGenerator(stack);
}

/**
 * A generic stack data structure
 * @param T The type of the stack
 */
export class Stack<T> {
    private stack:T[] = [];

    constructor() {}

    get(idx:number) { return this.stack[idx]; }

    size() { return this.stack.length; }

    push(obj:T) { this.stack.push(obj); }

    peek() { return this.stack[this.stack.length-1]; }

    isEmpty() { return this.stack.length == 0; }

    pop() { return this.stack.pop(); }
}