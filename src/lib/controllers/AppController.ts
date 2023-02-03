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
import { fs, path } from "@tauri-apps/api";
import { get } from "svelte/store";
import {
  appDataDir,
  changedTabs,
  discardChangesDisabled,
  dsonFiles,
  fileNamesPath,
  saveChangesDisabled,
  saveDirPath,
  selectedTab,
  tabs,
  unchangedTabs,
} from "../../Stores";
import { DsonFile } from "../models/DsonFile";
import { DsonTypes } from "../models/DsonTypes";
import { DsonWriter } from "../models/DsonWriter";
import { UnhashBehavior } from "../models/UnhashBehavior";
import { Reader } from "../utils/Reader";
import { Utils } from "../utils/Utils";
import { BackupsController } from "./BackupsController";
import { GenerateNamesController } from "./GenerateNamesController";
import { ToasterController } from "./ToasterController";

/**
 * The main controller for the application
 */
export class AppController {
  static namesController = new GenerateNamesController();
  static backupsController = new BackupsController();

  /**
   * Sets up the app
   */
  static async init() {
    const appDir = get(appDataDir);
    const backupPath = await path.join(appDir, "backups");
    // @ts-ignore
    if (!(await fs.exists(backupPath))) await fs.createDir(backupPath);
    this.backupsController.setBackupDir(backupPath);
  }

  /**
   * Loads the user's save files
   */
  static async loadSaves() {
    const saveDir = get(saveDirPath);

    const newTabs = {};
    const newDsonFiles = {};
    const wasChanged = {};
    if (saveDir != "") {
      const loaderId = ToasterController.showLoaderToast("Loading save data");
      const saveConts = await fs.readDir(saveDir);

      for (let i = 0; i < saveConts.length; i++) {
        const saveFilePath = saveConts[i];

        if (Utils.isSaveFile(saveFilePath.name)) {
          const data = await fs.readBinaryFile(saveFilePath.path);
          const reader = new Reader(data);
          const dson = new DsonFile(reader, UnhashBehavior.POUNDUNHASH);

          newTabs[saveFilePath.name] = dson.asJson();
          newDsonFiles[saveFilePath.name] = dson;
          wasChanged[saveFilePath.name] = false;
        }
      }
      ToasterController.remLoaderToast(loaderId);

      setTimeout(() => {
        ToasterController.showSuccessToast("Saves loaded!");
      }, 500);
    }

    unchangedTabs.set(JSON.parse(JSON.stringify(newTabs)));
    changedTabs.set(wasChanged);
    tabs.set(newTabs);
    dsonFiles.set(newDsonFiles);

    discardChangesDisabled.set(true);
    saveChangesDisabled.set(true);
  }

  /**
   * Backs up the user's saves
   */
  static async backup() {
    await AppController.backupsController.backup();
  }

  /**
   * Load up the existing backups
   */
  static async loadBackups() {
    await AppController.backupsController.showBackupsModal();
  }

  /**
   * Saves the current changes
   */
  static async saveChanges() {
    const revision = Object.values(get(dsonFiles))[0].header.revision;
    const changes = Object.entries(get(tabs));
    const cTabs = get(changedTabs);

    // TODO only write files with changes
    for (let i = 0; i < changes.length; i++) {
      const fileName = changes[i][0];

      if (cTabs[fileName]) {
        const filePath = await path.join(get(saveDirPath), fileName);
        const newData = changes[i][1];

        const dWriter = new DsonWriter(newData as any, revision);
        const dataBuf = dWriter.bytes();

        await fs.writeBinaryFile(filePath, dataBuf);
      }
    }

    discardChangesDisabled.set(true);
    saveChangesDisabled.set(true);
  }

  /**
   * Discards the current changes
   */
  static async discardChanges() {
    const originalJsons = get(unchangedTabs);
    tabs.set(JSON.parse(JSON.stringify(originalJsons)));

    const selTab = get(selectedTab);
    selectedTab.set("");
    selectedTab.set(selTab);

    discardChangesDisabled.set(true);
    saveChangesDisabled.set(true);

    ToasterController.showSuccessToast("Changes discarded!");
  }

  /**
   * Reloads the user's saves
   */
  static async reload() {
    await AppController.loadSaves();
  }

  /**
   * Generates the name hashes used when loading user saves
   * @param gamePath the gameData path
   * @param modPath the modData path, if applicable
   */
  static async generateNames(gamePath: string, modPath: string): Promise<void> {
    const fileNamesFilePath = get(fileNamesPath);
    const names = await AppController.namesController.generateNames(
      gamePath,
      modPath
    );

    await fs.writeTextFile(fileNamesFilePath, Array.from(names).join("\n"));

    DsonTypes.offerNames(Array.from(names));
  }

  /**
   * Updates the in-memory hash names based on a cached file
   */
  static async updateNames(): Promise<void> {
    const fileNamesFilePath = get(fileNamesPath);
    const names = (await fs.readTextFile(fileNamesFilePath)).split("\n");

    DsonTypes.offerNames(Array.from(names));
  }
}
