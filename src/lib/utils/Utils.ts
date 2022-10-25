import { fs, path, tauri } from "@tauri-apps/api";

export enum HeroMeleeWeapons {
    SwordWeapon = "Stygian Blade",
    SpearWeapon = "Eternal Spear",
    ShieldWeapon = "Shield of Chaos",
    BowWeapon = "Heart-Seeking Bow",
    FistWeapon = "Twin Fists of Malphon",
    GunWeapon = "Adamant Rail",
}

export enum AspectTraits {
    SwordCriticalParryTrait = "Nemesis",
    SwordConsecrationTrait = "Arthur",
    ShieldRushBonusProjectileTrait = "Chaos",
    ShieldLoadAmmoTrait = "Beowulf",
    // ShieldBounceEmpowerTrait = "",
    ShieldTwoShieldTrait = "Zeus",
    SpearSpinTravel = "Guan Yu",
    GunGrenadeSelfEmpowerTrait = "Eris",
    FistVacuumTrait = "Talos",
    FistBaseUpgradeTrait = "Zagreus",
    FistWeaveTrait = "Demeter",
    FistDetonateTrait = "Gilgamesh",
    SwordBaseUpgradeTrait = "Zagreus",
    BowBaseUpgradeTrait = "Zagreus",
    SpearBaseUpgradeTrait = "Zagreus",
    ShieldBaseUpgradeTrait = "Zagreus",
    GunBaseUpgradeTrait = "Zagreus",
    DislodgeAmmoTrait = "Poseidon",
    // SwordAmmoWaveTrait = "",
    GunManualReloadTrait = "Hestia",
    GunLoadedGrenadeTrait = "Lucifer",
    BowMarkHomingTrait = "Chiron",
    BowLoadAmmoTrait = "Hera",
    // BowStoredChargeTrait = "",
    BowBondTrait = "Rama",
    // BowBeamTrait = "",
    SpearWeaveTrait = "Hades",
    SpearTeleportTrait = "Achilles",
}

export const FILE_SIGNATURE = "\x53\x47\x42\x31";
export const SAVE_DATA_V14_LENGTH = 3145720;
export const SAVE_DATA_V15_LENGTH = 3145720;
export const SAVE_DATA_V16_LENGTH = 3145728;
export const SAV15_UNCOMPRESSED_SIZE = 9388032;
export const SAV16_UNCOMPRESSED_SIZE = 9388032;

export class Utils {
    static async loadDataFileAsBinary(filename:string) {
        const res = await fs.readBinaryFile(filename).then((contents) => {
            return contents;
        }, () => {
            return null;
        });
        return res;
    }

    static getPathToDataFile(filename:string) {
        return path.join(path.basename(), filename);
    }
}