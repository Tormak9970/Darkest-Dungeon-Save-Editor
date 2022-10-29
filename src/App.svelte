<script lang="ts">
    import { dialog, fs, path } from "@tauri-apps/api";
    
	import { SvelteToast } from "@zerodevx/svelte-toast";
    import Button from "./components/Button.svelte";
    import Checkbox from "./components/Checkbox.svelte";
    import InputField from "./components/InputField.svelte";
	import Titlebar from "./components/Titlebar.svelte";
    import Spacer from "./components/utils/Spacer.svelte";

    $: filePath = null;
    $: version = null;
    $: runs = null;
    $: location = null;

    $: currencies = {
        "darkness": 0,
        "gems": 0,
        "diamonds": 0,
        "keys": 0,
        "nectar": 0,
        "ambrosia": 0,
        "blood": 0
    }

    $: gModeDmgRedux = 0;
    $: hellMode = false;
    $: giftingToAllEnabled = false;

    async function loadSave() {
        const docsDir = await path.documentDir();
        const saveDirPath = await path.join(docsDir, "Saved Games", "Hades");
        // @ts-ignore
        const fPath = await fs.exists(saveDirPath) ? saveDirPath : "C:/";

        await dialog.open({ directory: false, title: 'Select a save file', multiple: false, defaultPath: fPath }).then(async (file) => {
            if (file) {
                const saveFilePath = file as string;
                
                if (saveFilePath) {
                    const dat = await fs.readBinaryFile(saveFilePath);
                }
            }
        });
    }

    async function saveChanges() {

    }

    async function exportRunsToCsv() {

    }

    async function enableGiftingToAll() { giftingToAllEnabled = true; }

    function inputHandler(e:Event, fieldName:string) {
        if (fieldName == "godMode") {
            gModeDmgRedux = parseInt((e.target as HTMLInputElement).value);
        } else {
            currencies[fieldName] = parseInt((e.target as HTMLInputElement).value);
        }
    }
</script>

<div class="wrap">
	<SvelteToast target="top" options={{ initial: 0, intro: { y: -64 } }} />
</div>
<main>
	<Titlebar />
	<div class="content">
        <div class="row">
            <div class="stats">
                <div class="labels">
                    <div>File Path:</div>
                    <Spacer />
                    <div>Version:</div>
                    <Spacer />
                    <div>Runs:</div>
                    <Spacer />
                    <div>Location:</div>
                </div>
                <div style="width: 14px; height: 1px;"></div>
                <div class="values">
                    <div>{filePath ? filePath : ""}</div>
                    <Spacer />
                    <div>{version ? version : ""}</div>
                    <Spacer />
                    <div>{runs ? runs : ""}</div>
                    <Spacer />
                    <div>{location ? location : ""}</div>
                </div>
            </div>
            <div class="controls">
                <Button text="Load Save File" onClick={loadSave} width={"200px"} />
                <Spacer />
                <Button text="Save Changes" onClick={saveChanges} width={"200px"} />
                <Spacer />
                <Button text="Export Runs to CSV" onClick={exportRunsToCsv} width={"200px"} />
            </div>
        </div>
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />
        <div class="row">
            <div class="currencies">
                <div class="labels">
                    <Spacer />
                    <div>Darkness:</div>
                    <Spacer />
                    <div style="height: 5px; width: 1px"></div>
                    <div>Gems:</div>
                    <Spacer />
                    <div style="height: 5px; width: 1px"></div>
                    <div>Diamonds:</div>
                    <Spacer />
                    <div style="height: 5px; width: 1px"></div>
                    <div>Chth. Keys:</div>
                    <Spacer />
                    <div style="height: 5px; width: 1px"></div>
                    <div>Nectar:</div>
                    <Spacer />
                    <div style="height: 5px; width: 1px"></div>
                    <div>Ambrosia:</div>
                    <Spacer />
                    <div style="height: 5px; width: 1px"></div>
                    <div>Titain Blood:</div>
                    <Spacer />
                    <div style="height: 5px; width: 1px"></div>
                    <Spacer />
                    <Spacer />
                    <Spacer />
                    <Spacer />
                    <div>God Mode:</div>
                    <Spacer />
                </div>
                <div style="width: 14px; height: 1px;"></div>
                <div class="values">
                    <div style="height: 2px; width: 1px"></div>
                    <InputField fieldName={"darkness"} cVal={currencies['darkness']} handler={inputHandler} />
                    <div style="height: 2px; width: 1px"></div>
                    <InputField fieldName={"gems"} cVal={currencies['gems']} handler={inputHandler} />
                    <div style="height: 2px; width: 1px"></div>
                    <InputField fieldName={"diamonds"} cVal={currencies['diamonds']} handler={inputHandler} />
                    <div style="height: 2px; width: 1px"></div>
                    <InputField fieldName={"keys"} cVal={currencies['keys']} handler={inputHandler} />
                    <div style="height: 2px; width: 1px"></div>
                    <InputField fieldName={"nectar"} cVal={currencies['nectar']} handler={inputHandler} />
                    <div style="height: 2px; width: 1px"></div>
                    <InputField fieldName={"ambrosia"} cVal={currencies['ambrosia']} handler={inputHandler} />
                    <div style="height: 2px; width: 1px"></div>
                    <InputField fieldName={"blood"} cVal={currencies['blood']} handler={inputHandler} />
                    <div style="height: 2px; width: 1px"></div>
                    <Spacer />
                    <Spacer />
                    <Spacer />
                    <Spacer />
                    <InputField fieldName={"godMode"} cVal={gModeDmgRedux} handler={inputHandler} />
                </div>
            </div>
            <div class="controls">
                <Button text="Enable Gifting to all NPCs" onClick={enableGiftingToAll} width={"200px"} />
                <Spacer />
                <div class="field">
                    <div>Hell Mode:</div>
                    <Checkbox checked={hellMode} />
                </div>
            </div>
        </div>
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

    .content {
        width: 100%;
        height: calc(100% - 30px);

        padding: 14px;

        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    .row {
        width: calc(100% - 28px);
        
        display: flex;
        justify-content: space-between;
    }

    .stats {
        font-size: 14px;

        display: flex;
        flex-direction: row;
    }
    .currencies {
        font-size: 14px;

        display: flex;
        flex-direction: row;
    }

    .field {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>