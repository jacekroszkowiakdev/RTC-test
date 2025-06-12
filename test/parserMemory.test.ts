import { parseRawState } from "../src/services/parseRawState";
import { MemoryStore } from "../src/store/memoryStore";
import { expect, it, describe } from "vitest";

const mockEventData = {
    eventId: "78784a2e-3bbb-45d3-aec1-a53b3ca0b6f0",
    sportId: "a1ab04e9-9d28-4e36-a4c4-76ba49fd4457",
    competitionId: "65b99ec6-3c2b-4fd2-8630-8c743f38f67a",
    timestamp: "1749762778896",
    homeTeamId: "62b202fb-9cec-45ce-932a-f0d40ab5d8ca",
    awayTeamId: "387c26c1-dc55-47c4-9599-3734cd8ae40e",
    statusId: "bf382528-4fa9-4b06-b531-e090e3161b0c",
    scores: "d737f2a8-17e1-4ecb-a419-405bb9bf97e4@12:13|18e716a4-d65c-495e-a0fc-a3b7efb822f5@4:5|a8bfb268-781a-48d8-83aa-9b3a7b5573c6@8:8",
};

// Convert to the format your parser expects
const mockState = {
    odds: `${mockEventData.eventId},${mockEventData.sportId},${mockEventData.competitionId},${mockEventData.timestamp},${mockEventData.homeTeamId},${mockEventData.awayTeamId},${mockEventData.statusId},${mockEventData.scores}`,
};

const mockMappings = {
    mappings: [
        `${mockEventData.statusId}:LIVE`,
        `${mockEventData.sportId}:FOOTBALL`,
        `${mockEventData.competitionId}:UEFA Champions League`,
        `${mockEventData.homeTeamId}:Barcelona`,
        `${mockEventData.awayTeamId}:Real Madrid`,
        `d737f2a8-17e1-4ecb-a419-405bb9bf97e4:CURRENT`,
        `18e716a4-d65c-495e-a0fc-a3b7efb822f5:PERIOD_1`,
        `a8bfb268-781a-48d8-83aa-9b3a7b5573c6:PERIOD_2`,
    ].join(";"),
};

describe("Parser + MemoryStore integration", () => {
    it("should parse raw state and store parsed events in memory", () => {
        const store = new MemoryStore();
        const parsed = parseRawState(mockState.odds, mockMappings.mappings);

        expect(parsed.length).toBeGreaterThan(0);

        for (const event of parsed) {
            store.set(event);
        }

        const activeEvents = store.getActiveEvents();
        expect(Object.keys(activeEvents).length).toBe(parsed.length);

        const one = parsed[0];

        expect(one.sport).toBe("FOOTBALL");
        expect(one.competition).toBe("UEFA Champions League");
        expect(one.status).toBe("LIVE");
        expect(one.competitors.HOME.name).toBe("Barcelona");
        expect(one.competitors.AWAY.name).toBe("Real Madrid");
        expect(one.startTime).toBeInstanceOf(Date);
        expect(one.startTime.getTime()).toBe(1749762778896);
    });
});
