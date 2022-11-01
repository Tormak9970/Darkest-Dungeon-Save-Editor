<script lang="ts">
    import { dialog, fs, path } from "@tauri-apps/api";
    
	import { SvelteToast } from "@zerodevx/svelte-toast";
    import Button from "./components/Button.svelte";
    import Checkbox from "./components/Checkbox.svelte";
    import InputField from "./components/InputField.svelte";
	import Titlebar from "./components/Titlebar.svelte";
    import Spacer from "./components/utils/Spacer.svelte";

    async function loadSave() {
        const docsDir = await path.documentDir();
        const saveDirPath = await path.join(docsDir, "Saved Games", "Hades");
        // @ts-ignore
        const fPath = await fs.exists(saveDirPath) ? saveDirPath : "C:/";

        await dialog.open({ directory: true, title: 'Select a save directory', multiple: false, defaultPath: fPath }).then(async (file) => {
            if (file) {
                const saveFilePath = file as string;
                
                if (saveFilePath) {
                    const dat = await fs.readBinaryFile(saveFilePath);
                    

                    console.log(save);
                }
            }
        });
    }

    async function saveChanges() {

    }

    function inputHandler(e:Event, fieldName:string) {
        
    }
</script>

<div class="wrap">
	<SvelteToast target="top" options={{ initial: 0, intro: { y: -64 } }} />
</div>
<main>
	<Titlebar />
	<div class="content">
        
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
</style>