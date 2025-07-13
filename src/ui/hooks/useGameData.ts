import { useState, useEffect, useCallback } from "react";

export interface UseGameDataResult<T> {
    /** The loaded data, or null if loading. */
    data: T | null;
    /** A boolean indicating if the initial data is being loaded. */
    loading: boolean;
    /** A function to trigger a file download of the provided data. */
    download: (currentData: T) => void;
}

/**
 * A React hook to manage fetching and saving of game data structures.
 *
 * @param type A string identifier for the data type (e.g., "mobs", "patterns"). Used to construct the file path.
 * @param defaultData The default data to use if fetching fails.
 * @returns An object with the loaded data, loading state, and a download function.
 */
export function useGameData<T>(
    type: string,
    defaultData: T,
): UseGameDataResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Effect to fetch initial data on mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Assumes data files are in /public/data/
                const response = await fetch(`/data/${type}.json`);
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch ${type}.json: ${response.statusText}`,
                    );
                }
                const jsonData = await response.json();
                setData(jsonData as T);
            } catch (error) {
                console.warn(
                    `Could not load /data/${type}.json. Falling back to default data.`,
                    error,
                );
                setData(defaultData);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type]);

    // Function to trigger a download of the current data state
    const download = useCallback(
        (currentData: T) => {
            try {
                const jsonString = JSON.stringify(currentData, null, 2);
                const blob = new Blob([jsonString], {
                    type: "application/json",
                });
                const href = URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = href;
                link.download = `${type}.json`;

                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                URL.revokeObjectURL(href);
            } catch (error) {
                console.error("Failed to save data to file.", error);
            }
        },
        [type],
    );

    return { data, loading, download };
}
