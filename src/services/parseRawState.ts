import { SportEvent, Score, Status, InternalEvent } from "../types/types";

export function parseRawState(
    rawState: string,
    rawMappings: string
): InternalEvent[] {
    // Create mappings object from rawMappings parameter
    const mappings = new Map<string, string>();

    // Parse raw mappings like "id:name;id:name;..."
    rawMappings
        .trim()
        .split(";")
        .forEach((mapping) => {
            const [id, name] = mapping.split(":");
            if (id && name) {
                mappings.set(id.trim(), name.trim());
            }
        });

    // Parse event rows from rawState
    const rawEventRows = rawState
        .split("\n")
        .filter((row) => row.trim() !== "");

    return rawEventRows.map((eventRow) => {
        const eventFields = eventRow.split(",");
        const [
            eventId,
            sportId,
            competitionId,
            startTimeRaw,
            homeId,
            awayId,
            statusId,
            ...scoreFields
        ] = eventFields;

        const scoreString = scoreFields.join(",");
        const scores: Record<string, Score> = {};

        scoreString.split("|").forEach((entry) => {
            const [type, result] = entry.split("@");
            const [home, away] = result?.split(":") ?? [];
            if (type && home && away) {
                scores[mappings.get(type) || type] = {
                    type: mappings.get(type) || type,
                    home,
                    away,
                };
            }
        });

        const sportEvent: SportEvent = {
            id: eventId,
            status: (mappings.get(statusId) as Status) ?? "PRE",
            startTime: new Date(Number(startTimeRaw)),
            sport: mappings.get(sportId) ?? "Unknown Sport",
            competition: mappings.get(competitionId) ?? "Unknown Competition",
            scores,
            competitors: {
                HOME: {
                    type: "HOME",
                    name: mappings.get(homeId) ?? "Unknown Home",
                },
                AWAY: {
                    type: "AWAY",
                    name: mappings.get(awayId) ?? "Unknown Away",
                },
            },
        };

        return sportEvent;
    });
}
