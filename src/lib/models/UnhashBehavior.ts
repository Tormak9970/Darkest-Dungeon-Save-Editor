export enum UnhashBehavior {
    NONE, // Don't unhash, works in all cases
    UNHASH, // Simple unhash, useful for simply looking at the files
    POUNDUNHASH, // Unhash as ###string, useful combination: Reasonable safety against accidental collisions, still somewhat readable
}