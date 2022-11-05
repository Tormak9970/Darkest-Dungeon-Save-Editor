import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export const appDataDir = writable("");
export const saveDirPath = writable("");

export const unchangedTabs:Writable<{}> = writable({});
export const tabs:Writable<{}> = writable({});
export const selectedTab = writable("");