<script lang="ts">
    import { dialog, fs, path } from "@tauri-apps/api";
    
	import { SvelteToast } from "@zerodevx/svelte-toast";
    import Button from "./components/Button.svelte";
    import Pane from "./components/Pane.svelte";
    import PathField from "./components/PathField.svelte";
    import Tabs from "./components/tabs/Tabs.svelte";
	import Titlebar from "./components/Titlebar.svelte";
    
    import { gameDataDirPath, modDataDirPath, saveDirPath } from "./Stores";

    $: tabs = [

    ]

    async function loadSave(e:Event) {
        const path = (e.currentTarget as HTMLInputElement).value;
        $saveDirPath = path;
    }

    async function loadGameData(e:Event) {
        const path = (e.currentTarget as HTMLInputElement).value;
        $gameDataDirPath = path;
    }

    async function loadModData(e:Event) {
        const path = (e.currentTarget as HTMLInputElement).value;
        $modDataDirPath = path;
    }

    async function saveChanges(e:Event) {

    }

    function makeBackup(e:Event) {

    }

    function loadBackup(e:Event) {

    }

    function findNames(e:Event) {

    }
</script>

<div class="wrap">
	<SvelteToast target="top" options={{ initial: 0, intro: { y: -64 } }} />
</div>
<main>
	<Titlebar />
	<div class="content">
        <Pane title="Paths">
            <div class="row" style="margin-top: 0px;">
                <PathField fieldName="Save Directory" title={"Select a save directory"} defaultPath={"documents"} cVal={$saveDirPath} handler={loadSave} />
                <div style="height: 1px; width: 7px;" />
                <Button text={"Make Backup"} onClick={makeBackup} width={"100px"} />
            </div>
            <div class="row">
                <PathField fieldName="Game Data" title={"Select your game data directory"} defaultPath={""} cVal={$gameDataDirPath} handler={loadGameData} />
                <div style="height: 1px; width: 7px;" />
                <Button text={"Load Backup"} onClick={loadBackup} width={"100px"} />
            </div>
            <div class="row">
                <PathField fieldName="Mod Data" title={"Select your mod data directory"} defaultPath={""}  cVal={$modDataDirPath} handler={loadModData} />
                <div style="height: 1px; width: 7px;" />
                <Button text={"Find Names"} onClick={findNames} width={"100px"} />
            </div>
        </Pane>
        <Pane title="Save Data" fillParent>
            <Tabs />
        </Pane>
	</div>
</main>
<SvelteToast />

<style>
    @import "/theme.css";

    main {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        color: var(--font-color);
    }

    .wrap {
        --toastContainerTop: 0.5rem;
        --toastContainerRight: 0.5rem;
        --toastContainerBottom: auto;
        --toastContainerLeft: 0.5rem;
        --toastWidth: 100%;
        --toastMinHeight: 100px;
        --toastPadding: 0 0.5rem;
        font-size: 0.875rem;
    }
    @media (min-width: 40rem) {
        .wrap {
            --toastContainerRight: auto;
            --toastContainerLeft: calc(50vw - 20rem);
            --toastWidth: 40rem;
        }
    }

    .row {
        margin-top: 7px;

        display: flex;
        align-items: center;
    }

    .content {
        margin-top: 5px;
        width: 100%;
        height: calc(100% - 35px);

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }
</style>