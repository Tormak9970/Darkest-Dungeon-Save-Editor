import { Float16Array } from "@petamoriken/float16";

let GLOBAL_ENDIANNESS = true;

/**
 * A custom Reader class for ease of use.
 */
 class Reader {
    data: ArrayBuffer;
    offset: number;
    view: DataView;

    constructor(data: Uint8Array|ArrayBuffer) {
        this.data = (this.#isUint8Array(data)) ? data.buffer : data;
        this.view = new DataView(this.data);
        this.offset = 0;
    }

    #isUint8Array(data: Uint8Array|ArrayBuffer): data is Uint8Array {
        return (data as Uint8Array).buffer !== undefined;
    }

    #readI(method: keyof DataView, bytes: number): (endianness?: boolean) => number {
        return (endianness?: boolean) => {
            // @ts-ignore
            const res = this.view[method](this.offset, endianness ? endianness : GLOBAL_ENDIANNESS);
            this.offset += bytes;
            return res;
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
     * read the next byte and return a Uint8 array.
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readByte = this.#readI('getInt8', 1);

    /**
     * read the next char and return a string.
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readChar(endianness?: boolean) {
        const res = this.#readI('getInt8', 1)(endianness);
        return res.toString();
    }

    /**
     * reads the next (length) bytes and returns a Uint8 array.
     * @param  {number} length the number of bytes to read
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readBytes(length: number, endianness?: boolean) {
        const res = new Uint8Array(this.data, this.offset, length);
        this.offset += length;
        return (endianness ? endianness : GLOBAL_ENDIANNESS) ? res : res.reverse();
    }

    /**
     * reads the next Uint of length 1
     */
    readUint8 = this.#readI('getUint8', 1)

    /**
     * reads the next Uint of length 2
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readUint16 = this.#readI('getUint16', 2)

    /**
     * reads the next Uint of length 4
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readUint32 = this.#readI('getUint32', 4)

    /**
     * reads the next Uint of length 8
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readUint64 = this.#readI('getBigUint64', 8);

    /**
     * reads the next Int of length 1
     */
    readInt8 = this.#readI('getInt8', 1)

    /**
     * reads the next Int of length 2
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readInt16 = this.#readI('getInt16', 2)

    /**
     * reads the next Int of length 4
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readInt32 = this.#readI('getInt32', 4)

    /**
     * reads the next Int of length 8
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readInt64 = this.#readI('getBigInt64', 8)

    /**
     * reads the next Float of length 2
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readFloat16(endianness: boolean = true) {
        const res = new Float16Array(this.data, this.offset, 1);
        this.offset += 2;
        return (endianness ? endianness : GLOBAL_ENDIANNESS) ? res[0] : res.reverse()[0];
    }

    /**
     * reads the next Float of length 4
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readFloat32 = this.#readI('getFloat32', 4)

    /**
     * reads the next Float of length 4
     * @param  {boolean} endianness whether or not to use littleEdian. Default is true.
     */
    readFloat64 = this.#readI('getFloat64', 8)

    /**
     * reads the next null terminated string.
     * @param  {number} length optional length of the string. Reads until 00 byte if undefined.
     */
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

export { Reader };