<script lang="ts">
    import JsonEditor from "../JsonEditor.svelte";

    export let tabs:Object;
</script>

<div class="tabs">
    
    <JsonEditor />
</div>

<style>
    @import "/theme.css";
</style>