import { useState, useEffect } from "react";
import { Analytics } from "../../game/api/Analytics";
import { AnalyticsEvent } from "../../game/logic/api/AnalyticsEvent";

export interface LogEntry {
    timestamp: Date;
    text: string;
}

const MAX_LOGS = 100; // Define the maximum number of log entries to keep

/**
 * A hook that subscribes to Analytics events and records them in a timestamped log.
 * @returns An array of LogEntry objects, with the most recent entry last.
 */
export function useAnalyticsLog(): LogEntry[] {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        const handleEvent = (eventName: string, payload: unknown) => {
            const newEntry: LogEntry = {
                timestamp: new Date(),
                text: `${eventName}: ${JSON.stringify(payload)}`,
            };

            // Add new log and truncate the array from the beginning if it's too long
            setLogs((prevLogs) => [...prevLogs, newEntry].slice(-MAX_LOGS));
        };

        const downListener = (payload: unknown) =>
            handleEvent(AnalyticsEvent.DOWN, payload);
        const upListener = (payload: unknown) =>
            handleEvent(AnalyticsEvent.UP, payload);

        Analytics.on(AnalyticsEvent.DOWN, downListener);
        Analytics.on(AnalyticsEvent.UP, upListener);

        return () => {
            Analytics.removeListener(AnalyticsEvent.DOWN, downListener);
            Analytics.removeListener(AnalyticsEvent.UP, upListener);
        };
    }, []);

    return logs;
}
