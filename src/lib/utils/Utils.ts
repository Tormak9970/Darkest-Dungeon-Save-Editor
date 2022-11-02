import { fs, path, tauri } from "@tauri-apps/api";

export class Utils {
    private static encoder = new TextEncoder();
    private static decoder = new TextDecoder();
    
    static stringHash(str:string): number {
        let hash = 0;
        const arr = Utils.encoder.encode(str);
        
        for (let i = 0; i < arr.length; i++) {
            hash = hash * 53 + arr[i];
        }

        return hash;
    }
}