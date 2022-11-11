<!--
 DarkestDungeon Save Editor is a tool for viewing and modifying DarkestDungeon game saves.
 Copyright (C) 2022 Travis Lane (Tormak)
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https://www.gnu.org/licenses/>
 -->
<script lang="ts">
    import { EditorView, highlightSpecialChars, drawSelection, highlightActiveLine, keymap, rectangularSelection, highlightActiveLineGutter, lineNumbers } from '@codemirror/view';
    import { EditorState } from '@codemirror/state';
    import { json, jsonParseLinter, jsonLanguage } from '@codemirror/lang-json';
    import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
    import { indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxHighlighting } from '@codemirror/language';
    import { closeBrackets, closeBracketsKeymap, completionKeymap, autocompletion } from '@codemirror/autocomplete';
    import { highlightSelectionMatches } from '@codemirror/search';
    import { lintKeymap, linter, lintGutter } from '@codemirror/lint';
    import { onMount } from "svelte";
    import { vsCodeHighlightStyle, vsCodeTheme } from "../lib/utils/EditorTheme";
    import { changedTabs, discardChangesDisabled, saveChangesDisabled, selectedTab, tabs } from "../Stores";

    let editorContainer:HTMLDivElement;
    let isRendering = false;

    onMount(() => {
        const state = EditorState.create({
            doc: JSON.stringify({ "message": "Select paths or choose a save file" }, null, 2),
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                drawSelection(),
                highlightActiveLine(),
                history(),
                foldGutter(),
                // lintGutter(),
                EditorState.allowMultipleSelections.of(true),
                indentOnInput(),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                rectangularSelection(),
                highlightSelectionMatches(),
                json(),
                jsonLanguage,
                linter(jsonParseLinter()),
                keymap.of([
                    ...closeBracketsKeymap,
                    ...defaultKeymap,
                    ...historyKeymap,
                    ...foldKeymap,
                    ...completionKeymap,
                    ...lintKeymap
                ]),
                vsCodeTheme,
                syntaxHighlighting(vsCodeHighlightStyle),
                EditorState.tabSize.of(4),
                EditorView.updateListener.of((v) => {
                    if (v.docChanged && !isRendering) {
                        $tabs[$selectedTab] = JSON.parse(v.state.doc.sliceString(0, v.state.doc.length));
                        $changedTabs[$selectedTab] = true;
                        if ($discardChangesDisabled || $saveChangesDisabled) {
                            $discardChangesDisabled = false;
                            $saveChangesDisabled = false;
                        }
                    }
                })
            ]
        });
        const view = new EditorView({ state: state, parent: editorContainer });
        
        selectedTab.subscribe((str) => {
            isRendering = true;
            let clearTransaction = view.state.update({
                changes: {
                    from: 0,
                    to: view.state.doc.length,
                    insert: ""
                }
            });
            view.dispatch(clearTransaction);

            let updateTransaction = view.state.update({
                changes: {
                    from: 0,
                    insert: (str != "") ? JSON.stringify($tabs[str], null, 2) : JSON.stringify({ "message": "Select paths or choose a save file" }, null, 2)
                }
            });

            view.dispatch(updateTransaction);

            setTimeout(() => {
                isRendering = false
            }, 100);
        })
    });
</script>

<div id="editorContainer" class="editor-content" bind:this={editorContainer}>
                
</div>

<style>
    @import "/theme.css";
    .editor-content {
        z-index: 1;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }
    :global(.editor-content > .cm-editor) {
        width: 100%;
        min-height: 100%;
        overflow-y: scroll;
    }
    :global(.editor-content > .cm-editor .cm-scroller) {
        outline: none;
        border: none;
    }
</style>