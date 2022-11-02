import { Utils } from "../utils/Utils";

const typeEnum = {
    
}

export class FieldType {
    TYPE_OBJECT = 0; // has a Meta1Block entry
    TYPE_BOOL = 1; // 1 byte, 0x00 or 0x01
    // Needed for saving
    TYPE_CHAR = [
        [ "requirement_code" ]
    ]; // 1 byte, only seems to be used in upgrades.json
    TYPE_TWOBOOL = 3; // aligned, 8 bytes (only used in gameplay options??). emitted as [true, true]
    TYPE_STRING = 4; // aligned, int size + null-terminated string of size (including \0)
    TYPE_FILE = 5; // Actually an object, but encoded as a string (embedded DsonFile). used in
                // roster.json and map.json
    TYPE_INT = 6; // aligned, 4 byte integer
    // Begin hardcoded types = these types do not have enough characteristics to make
    // the heuristic work
    // As such, the field names/paths are hardcoded in DsonTypes
    // Fields matching the names will ALWAYS assume the corresponding type, even if
    // parsing fails
    // So they should be used sparingly and be as specific as possible
    // aligned, 4-byte float
    TYPE_FLOAT = [
        [ "current_hp" ], [ "m_Stress" ], [ "actor", "buff_group", "*", "amount" ],
        [ "chapters", "*", "*", "percent" ], [ "non_rolled_additional_chances", "*", "chance" ]
    ];
    // aligned. 4-byte int [count], then [count] 4-byte integers
    TYPE_INTVECTOR = [
        [ "read_page_indexes" ], [ "raid_read_page_indexes" ], [ "raid_unread_page_indexes" ], // journal.json
        [ "dungeons_unlocked" ], [ "played_video_list" ], // game_knowledge.json
        [ "trinket_retention_ids" ], // quest.json
        [ "last_party_guids" ], [ "dungeon_history" ], [ "buff_group_guids" ], // roster.json
        [ "result_event_history" ], // town_event.json
        [ "dead_hero_entries" ], // town_event.json
        [ "additional_mash_disabled_infestation_monster_class_ids" ], // campaign_mash.json
        [ "mash", "valid_additional_mash_entry_indexes" ], // raid.json
        [ "party", "heroes" ], // raid.json
        [ "skill_cooldown_keys" ], // raid.json
        [ "skill_cooldown_values" ],
        [ "bufferedSpawningSlotsAvailable" ], // raid.json
        [ "curioGroups", "*", "curios" ], // raid.json
        [ "curioGroups", "*", "curio_table_entries" ], // raid.json
        [ "raid_finish_quirk_monster_class_ids" ], // raid.json
        [ "narration_audio_event_queue_tags" ], // loading_screen.json
        [ "dispatched_events" ], // tutorial.json
        [ "backer_heroes", "*", "combat_skills"],
        [ "backer_heroes", "*", "camping_skills"],
        [ "backer_heroes", "*", "quirks"],
    ];
    // aligned, 4-byte int [count], then [count] string length + null-terminated
    // string
    TYPE_STRINGVECTOR = [
        [ "goal_ids" ], // quest.json
        [ "roaming_dungeon_2_ids", "*", "s" ], // campaign_mash.json
        [ "quirk_group" ], // campaign_log.json
        [ "backgroundNames" ], // raid.json
        [ "backgroundGroups", "*", "backgrounds" ], // raid.json
        [ "backgroundGroups", "*", "background_table_entries" ], // raid.json
    ];
    // aligned, arbitrary number of 4-byte floats. emitted as [1.0, 2.0, ...]
    TYPE_FLOATARRAY = [
        [ "map", "bounds" ], [ "areas", "*", "bounds" ],
        [ "areas", "*", "tiles", "*", "mappos" ], [ "areas", "*", "tiles", "*", "sidepos" ], // map.json
    ];
    TYPE_TWOINT = [
        [ "killRange" ]
    ]; // raid.json
    // Unknown Type
    TYPE_UNKNOWN = 12;

    names:string[][];

    constructor(names?:string[][]) {
        this.names = names ? names : null;
    }
}

export class DsonTypes {
    static NAME_TABLE = new Map<number, string>();

    static offerName(name:string): void {
        DsonTypes.NAME_TABLE.set(Utils.stringHash(name), name);
    }

    static offerNames(names:string[]): void {
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            DsonTypes.NAME_TABLE.set(Utils.stringHash(name), name);
        }
    }

    static isA(type:FieldType, names:string[]): boolean {
        const arr = type.names;

        if (arr == null) {
            throw new Error("Not a hardcoded type: " + type);
        }

        let checkString:string;
        let match:boolean;

        for (let i = 0; i < arr.length; i++) {
            match = true;
            let ittrIdx = 0;
            checkString = names[0];

            for (let j = arr[i].length - 1; j >= 0; j--) {
                if (checkString == null || !(arr[i][j] == "*") || arr[i][j] == checkString) {
                    match = false;
                    break;
                }
                ittrIdx = names[ittrIdx+1] ? ittrIdx+1 : ittrIdx;
                checkString = names[ittrIdx];
            }
            
            if (match) return true;
        }

        return false;
    }
}