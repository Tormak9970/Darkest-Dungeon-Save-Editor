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
import "./style.css";
import App from "./App.svelte";
import { getMatches } from '@tauri-apps/api/cli'
import { CliController } from "./lib/controllers/CliController";
import { getCurrent } from "@tauri-apps/api/window";

const app = new App({
  target: document.getElementById("app"),
});

getMatches().then((matches) => {
  const mainWindow = getCurrent();
  const bArgsLen = Object.keys(matches?.args).length > 0;
  const cmdName = matches?.subcommand?.name;
  
  if (bArgsLen || (cmdName && cmdName != "")) {
    CliController.init(matches, mainWindow);
  } else {
    mainWindow.show();
  }
});

export default app;
