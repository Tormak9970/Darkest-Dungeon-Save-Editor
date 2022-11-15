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

import { fs } from "@tauri-apps/api";
import type { ArgMatch, CliMatches, SubcommandMatch } from "@tauri-apps/api/cli";
import { invoke } from '@tauri-apps/api/tauri'
import type { WebviewWindow } from "@tauri-apps/api/window";
import { DsonFile } from "../models/DsonFile";
import { DsonTypes } from "../models/DsonTypes";
import { DsonWriter } from "../models/DsonWriter";
import { UnhashBehavior } from "../models/UnhashBehavior";
import { Reader } from "../utils/Reader";
import { GenerateNamesController } from "./GenerateNamesController";

/**
 * Logs a message to the terminal
 * @param message The message to output
 */
function outputToTerminal(message:string) {
    invoke('output_to_terminal', { message: message });
}

/**
 * The command line interface controller
 */
export class CliController {
    static namesController = new GenerateNamesController();

    /**
     * Determines which command to run and passes it the required arguements
     * @param matches The cli matches
     */
    static async init(matches:CliMatches, mainWindow:WebviewWindow) {
        const progCmd = matches.subcommand;
        const args = progCmd.matches.args;
        const cmdName = progCmd?.name;
        
        if (cmdName && cmdName != "") {
            switch (cmdName) {
                case "show":
                    await CliController.handleShow(progCmd);
                    break;
                case "decode":
                    await CliController.handleDecode(args);
                    break;
                case "encode":
                    await CliController.handleEncode(args);
                    break;
                case "names":
                    await CliController.handleNames(args);
                    break;
            }
        } else if (Object.entries(args).length > 0) {
            const arg = Object.entries(args)[0];
            switch (arg[0]) {
                case "version":
                case "help":
                    outputToTerminal(arg[1].value as string);
                    break;
            }
        }
        
        outputToTerminal("\nDone!");

        await mainWindow.close();
    }

    private static async handleShow(subCmd:SubcommandMatch) {
        const cmdName = subCmd.matches.subcommand.name;
        let msg = "";

        if (cmdName == "w") {
            msg = "THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY\nAPPLICABLE LAW.  EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT\nHOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM \"AS IS\" WITHOUT WARRANTY\nOF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,\nTHE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR\nPURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM\nIS WITH YOU.  SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF\nALL NECESSARY SERVICING, REPAIR OR CORRECTION.";
        } else if (cmdName == "c") {
            msg = "\tAll rights granted under this License are granted for the term of\ncopyright on the Program, and are irrevocable provided the stated\nconditions are met.  This License explicitly affirms your unlimited\npermission to run the unmodified Program.  The output from running a\ncovered work is covered by this License only if the output, given its\ncontent, constitutes a covered work.  This License acknowledges your\nrights of fair use or other equivalent, as provided by copyright law.\n\n\tYou may make, run and propagate covered works that you do not\nconvey, without conditions so long as your license otherwise remains\nin force.  You may convey covered works to others for the sole purpose\nof having them make modifications exclusively for you, or provide you\nwith facilities for running those works, provided that you comply with\nthe terms of this License in conveying all material for which you do\nnot control copyright.  Those thus making or running the covered works\nfor you must do so exclusively on your behalf, under your direction\nand control, on terms that prohibit them from making any copies of\nyour copyrighted material outside their relationship with you.\n\n\tConveying under any other circumstances is permitted solely under\nthe conditions stated below.  Sublicensing is not allowed; section 10\nmakes it unnecessary.";
        } else {
            msg = "Invalid command. Please use \"show w\" or \"show c\"";
        }

        outputToTerminal(msg);
    }

    private static async handleDecode(args:{[key:string]:ArgMatch}) {
        const namesPath = args['names'];
        const outputPath = args['output'];
        const fileName = args['fileName'];

        if (namesPath.value as string != "" && outputPath.value as string != "" && fileName.value as string != "") {
            const names = (await fs.readTextFile(namesPath.value as string)).split('\n');

            DsonTypes.offerNames(Array.from(names));

            const data = await fs.readBinaryFile(fileName.value as string);
            const reader = new Reader(data);
            const dson = new DsonFile(reader, UnhashBehavior.POUNDUNHASH);

            await fs.writeTextFile(outputPath.value as string, JSON.stringify(dson.asJson(), null, "\t"));
            
            outputToTerminal("Save file decode complete!");
        } else {
            outputToTerminal("Missing required arguments");
        }
    }

    private static async handleEncode(args:{[key:string]:ArgMatch}) {
        const outputPath = args['output'];
        const fileName = args['fileName'];

        if (outputPath.value as string != "" && fileName.value as string != "") {
            const data = await fs.readTextFile(fileName.value as string);
            const dWriter = new DsonWriter(JSON.parse(data), 0x00);
            const dataBuf = dWriter.bytes();

            await fs.writeBinaryFile(outputPath.value as string, dataBuf);

            outputToTerminal("File encoding complete!");
        } else {
            outputToTerminal("Missing required arguments");
        }
    }

    private static async handleNames(args:{[key:string]:ArgMatch}) {
        const outputPath = args['output'];
        const dirs = args['dirs'];

        if (outputPath.value as string != "" && dirs.value as string != "") {
            const dataDirs = dirs.value as string[];

            let names: Set<string>;

            if (dataDirs.length == 1) {
                names = await CliController.namesController.generateNames(dataDirs[0], "");
            } else {
                names = await CliController.namesController.generateNames(dataDirs[0], dataDirs[1]);
            }

            await fs.writeTextFile(outputPath.value as string, Array.from(names).join('\n'));
            
            outputToTerminal("Names generation complete!");
        } else {
            outputToTerminal("Missing required arguments");
        }
    }
}