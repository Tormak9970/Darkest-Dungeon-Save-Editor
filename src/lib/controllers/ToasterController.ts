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
import { toast } from "@zerodevx/svelte-toast"

/**
 * A controller for handling toast messages
 */
export class ToasterController {
    private static getAppToastTheme() {
        return {
            "--toastBackground": "#d87e08",
            "--toastBarBackground": "#ff6600",
            "--toastColor": "rgb(231, 231, 231)"
        }
    }
    
    private static getSuccessToastTheme() {
        return {
            "--toastBackground": "#27b803",
            "--toastBarBackground": "#108b00",
            "--toastColor": "rgb(231, 231, 231)"
        }
    }

    /**
     * Creates and displays a new loading toast with the provided message
     * @param msg The message to show
     * @returns The id of the created loading toast
     */
    static showLoaderToast(msg:string):number {
        return toast.push(msg, {
            theme: ToasterController.getAppToastTheme(),
            dismissable: false,
            duration: 100000
        });
    }

    /**
     * Removes the loading toast with the specified id
     * @param loaderId The id of the loading toast
     */
    static remLoaderToast(loaderId:number) {
        toast.pop(loaderId);
    }

    /**
     * Creates and displays a new success toast with the provided message
     * @param msg The message to show
     */
    static showSuccessToast(msg:string) {
        toast.push(msg, {
            theme: ToasterController.getSuccessToastTheme(),
            dismissable: false,
            duration: 1500
        });
    }

    /**
     * Creates and displays a new generic toast with the provided message and styles
     * @param msg The message to show
     * @param styles Optional styling to apply to the toast
     */
    static showGenericToast(msg:string, styles:object = {}) {
        toast.push(msg, {
            theme: {
                ...ToasterController.getAppToastTheme(),
                ...styles
            }
        });
    }
}