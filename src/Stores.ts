import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export const appDataDir = writable("");
export const saveDirPath = writable("");
export const gameDataDirPath = writable("");
export const modDataDirPath = writable("");

export const unchangedTabs:Writable<{}> = writable({});
export const dsonFiles:Writable<{}> = writable({});
export const tabs:Writable<{}> = writable({});
export const selectedTab = writable("");