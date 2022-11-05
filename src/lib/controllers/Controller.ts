import { fs, path } from "@tauri-apps/api";
import { NameGenerator } from "../utils/NameGenerator";

export class Controller {
    private static DDSteamDir = "262060";
    nameGenerator:NameGenerator;

    constructor() {
        this.nameGenerator = new NameGenerator();
    }

    init() {
        // create backup dir in appData folder
        // prompt user to entire game save location
    }

    async generateNames(gamePath:string, modPath:string): Promise<Set<string>> {
        const paths = []
        if (gamePath != "") {
            const revisionsPath = await path.join(gamePath, "svn_revision.txt")
            if (fs.exists(revisionsPath)) {
                paths.push(gamePath);
            } else {
                throw new Error("Expected game path to point to game data, but missing svn_revision.txt");
            }
        }

        if (modPath != "") {
            if (modPath.includes(Controller.DDSteamDir)) {
                paths.push(modPath);
            } else {
                throw new Error("Expected mod path to include game dir (262060)");
            }
        }

        const names = this.nameGenerator.findNames(paths);
        return names;
    }
}