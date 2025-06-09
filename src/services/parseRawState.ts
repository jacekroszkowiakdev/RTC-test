import { SportEvent, Score } from "../types/types";

export function parseRawState(raw: string, rawMappings: string): SportEvent[] {
    const mappings = new Map<string, string>();

    // Parse raw mappings like "id;name"
    rawMappings
        .trim()
        .split("\n")
        .forEach((line) => {
            const [idRaw, nameRaw] = line.split(";");
            const id = idRaw?.trim();
            const name = nameRaw?.trim();
            if (id && name) {
                mappings.set(id, name);
            }
        });

    const rawEventRows = raw.trim().split("\n");

    return rawEventRows.map((eventRow) => {
        const eventFields = eventRow.split(",");
        const [
            eventId,
            competitionId,
            sportId,
            startTimeRaw,
            homeId,
            awayId,
            ...scoreFields
        ] = eventFields;

        const scoreString = scoreFields.join(",");
        const scores: Record<string, Score> = {};

        scoreString.split("|").forEach((entry) => {
            const [type, result] = entry.split("@");
            const [home, away] = result?.split(":") ?? [];

            if (type && home && away) {
                scores[type] = { type, home, away };
            }
        });

        const sportEvent: SportEvent = {
            id: eventId,
            status: "PRE",
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
