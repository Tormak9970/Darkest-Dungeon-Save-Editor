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

import { Float16Array } from "@petamoriken/float16";

let GLOBAL_ENDIANNESS = true;

export class Writer {
    data: ArrayBuffer;
    offset: number;
    length:number;
    view: DataView;

    constructor(data: Uint8Array|Int8Array|ArrayBuffer) {
        this.data = (this.#isUint8Array(data)) ? data.buffer : data;
        this.view = new DataView(this.data);
        this.length = (new Uint8Array(this.data)).length;
        this.offset = 0;
    }

    #isUint8Array(data: Uint8Array|ArrayBuffer): data is Uint8Array {
        return (data as Uint8Array).buffer !== undefined;
    }

    #writeI(method: keyof DataView): (data:ArrayBufferLike, endianness?: boolean) => number {
        return (data:ArrayBufferLike, endianness?: boolean) => {
            // @ts-ignore
            this.view[method](this.offset, data, endianness ? endianness : GLOBAL_ENDIANNESS);
            this.offset += data.byteLength;
            return data.byteLength;
        }
    }

    /**
     * seeks to the current offset
     * @param  {number} offset the new offset.
     * @param  {number} position the position to update from. 0 = start, 1 = current offset, 2 = end.
     */
    seek(offset: number, position: number = 0) {
        if (position == 0) {
            this.offset = Number(offset);
        } else if (position == 1) {
            this.offset = this.offset + Number(offset);
        } else if (position == 2) {
            this.offset = Number(this.data.byteLength) - Number(offset);
        } else {
            throw Error(`Unexpected position value. Expected 0, 1, or 2, but got ${position}.`);
        }
    }

    /**
     * Returns the number of bytes left in the reader
     * @returns the number of bytes left in the reader
     */
    remaining(): number {
        return this.length - this.offset;
    }

    /**
     * read the next byte and return a Uint8 array.
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    writeByte = this.#writeI('setInt8');

    /**
     * Writes the provide char to the current offset of the Writer. Returns the number of bytes written
     * @param  {string} data the char to write
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     * @returns the number of bytes written
     */
    writeChar(data:string, endianness?: boolean) {
        return this.#writeI('setInt8')(new Int8Array([data.charCodeAt(0)]), endianness);
    }

    
    readSignedBytes(length: number, endianness?: boolean) {
        const res = new Int8Array(this.data, this.offset, length);
        this.offset += length;
        return (endianness ? endianness : GLOBAL_ENDIANNESS) ? res : res.reverse();
    }

    
    readUnsignedBytes(length: number, endianness?: boolean) {
        const res = new Uint8Array(this.data, this.offset, length);
        this.offset += length;
        return (endianness ? endianness : GLOBAL_ENDIANNESS) ? res : res.reverse();
    }

    
    readUint8 = this.#readI('getUint8', 1)

    
    readUint16 = this.#readI('getUint16', 2)

    
    readUint32 = this.#readI('getUint32', 4)

    
    readUint64 = this.#readI('getBigUint64', 8);

    
    readInt8 = this.#readI('getInt8', 1)

    
    readInt16 = this.#readI('getInt16', 2)

    
    readInt32 = this.#readI('getInt32', 4)

    
    readInt64 = this.#readI('getBigInt64', 8)

    
    readFloat16(endianness: boolean = true) {
        const res = new Float16Array(this.data, this.offset, 1);
        this.offset += 2;
        return (endianness ? endianness : GLOBAL_ENDIANNESS) ? res[0] : res.reverse()[0];
    }

    
    readFloat32 = this.#readI('getFloat32', 4)

    
    readFloat64 = this.#readI('getFloat64', 8)

    
    readString(length?: number) {
        let outString = '';
        if (length === undefined) {
            let curChar = new Uint8Array(this.data, this.offset++, 1)[0];
            while (curChar !== 0) {
                outString += String.fromCharCode(curChar);
                curChar = new Uint8Array(this.data, this.offset++, 1)[0];
            }
        } else {
            for (let i = 0; i < length; i++) {
                const curChar = new Uint8Array(this.data, this.offset++, 1)[0];
                if (curChar === 0) break;
                outString += String.fromCharCode(curChar);
            }
        }
        return outString;
    }
}