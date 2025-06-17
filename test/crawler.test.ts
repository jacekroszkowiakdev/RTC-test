import { describe, it, expect, vi, beforeEach } from "vitest";
import { Crawler } from "../src/crawler";
import { MemoryStore } from "../src/store/memoryStore";
import * as api from "../src/services/api";
import * as parser from "../src/services/parseRawState";
import { InternalEvent } from "../src/types/types";

vi.mock("../src/services/api");
vi.mock("../src/services/parseRawState");

describe("Crawler", () => {
    let store: MemoryStore;
    let crawler: Crawler;

    const mockEvent: InternalEvent = {
        id: "abc",
        sport: "FOOTBALL",
        status: "LIVE",
        competition: "Bundesliga",
        startTime: new Date(),
        competitors: {
            HOME: { type: "HOME", name: "Team A" },
            AWAY: { type: "AWAY", name: "Team B" },
        },
        scores: {},
        removed: false,
    };

    beforeEach(() => {
        store = new MemoryStore();
        crawler = new Crawler(store);

        vi.mocked(api.fetchState).mockResolvedValue("rawState");
        vi.mocked(api.fetchMappings).mockResolvedValue("rawMappings");
        vi.mocked(parser.parseRawState).mockReturnValue([mockEvent]);
    });

    it("should fetch, parse, and store events", async () => {
        await crawler.fetchAndUpdate();

        expect(api.fetchState).toHaveBeenCalledOnce();
        expect(api.fetchMappings).toHaveBeenCalledOnce();
        expect(parser.parseRawState).toHaveBeenCalledWith(
            "rawState",
            "rawMappings"
        );

        const stored = store.getAll();
        expect(stored["abc"]).toEqual(
            expect.objectContaining({ id: "abc", competition: "Bundesliga" })
        );
    });
});
