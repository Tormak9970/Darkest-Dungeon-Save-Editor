import fs from "fs";
import { Reader } from "../utils/Reader";
import { DsonFile } from "../models/DsonFile";
import { UnhashBehavior } from "../models/UnhashBehavior";

export class DsonToJsonController {
    constructor(path:string, output:string) {
        const buffer = fs.readFileSync(path);
        const reader = new Reader(buffer.buffer);

        const testDson = new DsonFile(reader, UnhashBehavior.POUNDUNHASH);
        const header = testDson.header;
        const meta1Block = testDson.meta1Block;
        const meta2Block = testDson.meta2Block;
        const data = testDson.data;
        console.log(data);
        fs.writeFileSync(output, JSON.stringify(testDson));
    }
}