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
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export const appDataDir = writable("");
export const fileNamesPath = writable("");
export const saveDirPath = writable("");
export const gameDataDirPath = writable("");
export const modDataDirPath = writable("");

export const unchangedTabs:Writable<{}> = writable({});
export const dsonFiles:Writable<{}> = writable({});
export const tabs:Writable<{}> = writable({});
export const selectedTab = writable("");

export const loaderProgress = writable("0%");