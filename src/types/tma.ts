export interface SecureStorage {
    /**
     * Stores a value under the specified key.
     * On success: callback(null, stored)
     */
    setItem(
        key: string,
        value: string,
        callback?: (err: Error | null, stored: boolean) => void
    ): SecureStorage;

    /**
     * Reads a value by key.
     * If key not found: callback(null, null, canRestore)
     * On success: callback(null, value, canRestore)
     */
    getItem(
        key: string,
        callback: (err: Error | null, value: string | null, canRestore: boolean) => void
    ): SecureStorage;

    /**
     * Attempts to restore a key that existed on this device (may prompt the user).
     * On success: callback(null, restoredValue)
     * If cannot restore or user declined: callback(Error|null, null)
     */
    restoreItem(
        key: string,
        callback?: (err: Error | null, value: string | null) => void
    ): SecureStorage;

    /**
     * Removes a key/value pair.
     * On success: callback(null, removed)
     */
    removeItem(
        key: string,
        callback?: (err: Error | null, removed: boolean) => void
    ): SecureStorage;

    /**
     * Clears all keys stored by the bot on this device.
     * On success: callback(null, cleared)
     */
    clear(
        callback?: (err: Error | null, cleared: boolean) => void
    ): SecureStorage;
}
