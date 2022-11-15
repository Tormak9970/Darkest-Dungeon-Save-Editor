# DarkestDungeon Save Editor
A clean save editor for the game DarkestDungeon, powered by `TypeScript`, `Svelte`, and `Tauri`. The app offers a variety of features for generating hashes, encoding and decoding saves for the game.
<br/>
<br/>

## Background
Darkest Dungeon save files are saved with the `.json` extension, but the files aren't actually in the `JSON` format. Their format is very similar but due to the slight differences requires a custom binary reader to parse them.
<br/>
<br/>

## Features
 - Save file decoding - Decodes a save file into a valid, editable `.json` file
 - Json to save file encoding - 
 - Name generation - Generates a list of property names used in the game's save files by scanning the game data directory, and optionally any mod directories
 - Backups - A robust system to ensure that your saves are preserved in the case that that app or you breaks a save.

<br/>
This app aims to provide a nice UI for these tasks, as well as provide a command line interface (CLI) option for those who wish to automate the tasks or who are just power users.
<br/>
<br/>

## Installing
If you want to download the app and get started, grab the newest release [here](https://github.com/Tormak9970/Darkest-Dungeon-Save-Editor/releases). If you would like to build the app yourself, keep reading to learn how.
<br/>
<br/>

## Setting up the CLI
Before you start with the cli, you need to add two entries to you `$PATH` system variable. If you don't know how, check out [this](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/) article. In order to run the commands from the command line, and the two following lines to your `$PATH` variable:
 - `C:\Program Files\Darkest Dungeon Save Editor\_up_`
 - `C:\Program Files\Darkest Dungeon Save Editor`

**IMPORTANT**<br/>
The default installation path is `C:\Program Files\Darkest Dungeon Save Editor`. If you installed the app somewhere else, you should use that path.
<br/>
<br/>

## Using the CLI
The CLI is made up of three commands, decode, encode, and names. These commands can be automated using scripts if you want to recurringly run them (say to save them as `.json` for reference)

### The Decode Command
Usage:<br/>
```
ddseditor decode [--names, -n <namefile>] [--output, -o <outfile>] filename
```
Where:<br/>
`<namefile>` is the txt cache of names<br/>
`<outfile>` is the path of the output file<br/>
`filename` is the file to decode<br/>

### The Encode Command
Usage:<br/>
```
ddseditor names [--output, -o <outfile>] [...dirs]
```
Where:<br/>
`<outfile>` is the path of the output file<br/>
`[..dirs]` is a space seperated list of directory paths with game data<br/>

### The Names Command
Usage:<br/>
```
ddseditor encode [--output, -o <outfile>] filename
```
Where:<br/>
`<outfile>` is the path of the output file<br/>
`filename` is the file to decode<br/>
<br/>

## Building the app
**Please note:** you may edit and distrubute this program as you see fit but you must retain the license and the copyright notice I included (feel free to mark your contributions as I have)<br/>

### Setting Up the Enviroment
I used the Tauri framework for the program, so you will need to to setup your enviroment as specified [here](https://tauri.app/v1/guides/getting-started/prerequisites). Additionally, you need a [Node.js](https://nodejs.org/en/) installation, as well as `npm`, which should be included with the node install.

### Cloning the Program
The next step is to get a local copy of the repository. This can be done many ways, I recommend forking this repository and cloning that.<br/>
**IMPORTANT:**<br/>
If you make changes you are not allowed to redistribute the application with me as the developer. Please remember to change the `author` information in the `package.json` and the related copyright information in `src-tauri/tauri.config.json` file.

### Installing Dependencies
Once you have cloned the repository and opened it in your preffered Editor/IDE (I recommend [VSCode](https://code.visualstudio.com/)), you will need to install the program's dependencies. To do this, you will need to run two commands:<br/>
First:<br/>
```
npm i
```
Next:<br/>
```
cd src-tauri
cargo install
```

### Running the Application
Now you are finally ready to get the app up and running! Assuming everything is set up correctly, all you need to do is run:<br/>
```
npm run tauri dev
```

### Building With Your Changes
Once you have made your edits and are ready to share it with the world, run the following command:
```
npm run tauri build
```
This will generate a `.msi` file in `src-tauri/target/release/bundle/msi/app_name.msi`. And there you go, you've got a distributeable installer!
<br/>
<br/>

## Acknowledgements
This program was is inspired by [this](https://github.com/robojumper/DarkestDungeonSaveEditor) save editor by robojumper. They provide a great documention of the Darkest Dungeon save format.
<br/>
<br/>

## Licensing
This program is licensed under the [GNU General Public License Version 3](https://www.gnu.org/licenses/#GPL)
<br/>
<br/>
Copyright Travis Lane (Tormak) 2022