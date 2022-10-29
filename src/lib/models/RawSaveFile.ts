import { toast } from "@zerodevx/svelte-toast";
import { Sav14 } from "../schemas/Sav14";
import { Sav15 } from "../schemas/Sav15";
import { Sav16 } from "../schemas/Sav16";
import { VersionId } from "../schemas/VersionId";
import type { Reader } from "../utils/Reader";

export class RawSaveFile {
    version:number;
    saveData:Sav14|Sav15|Sav16;
    
    constructor(version:number, saveData:Sav14|Sav15|Sav16) {
        this.version = version;
        this.saveData = saveData;
    }

    toFile(path:string) {

    }

    static fromFile(reader:Reader) {
        const version = new VersionId(reader);

        let parsedSaveFile: Sav14|Sav15|Sav16;
        switch(version.version) {
            case 14:
                parsedSaveFile = new Sav14(reader);
                break;
            case 15:
                parsedSaveFile = new Sav15(reader);
                break;
            case 16:
                parsedSaveFile = new Sav16(reader);
                break;
            default:
                console.error("Unsupported save version");
                toast.push("Unsupported save version");
                return;
        }

        return new RawSaveFile(version.version, parsedSaveFile);
    }
}