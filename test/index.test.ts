import request from "supertest";
import { describe, it, beforeEach, expect } from "vitest";
import { createApp } from "../src/app";
import { MemoryStore } from "../src/store/memoryStore";

const store = new MemoryStore();
const app = createApp(store);

describe("GET /client/state", () => {
    beforeEach(() => {
        store.clear();
        store.set({
            id: "abc",
            sport: "FOOTBALL",
            status: "LIVE",
            scores: {},
            competitors: {
                HOME: {
                    type: "HOME",
                    name: "A-team",
                },
                AWAY: {
                    type: "HOME",
                    name: "B-team",
                },
            },
            competition: "Premier League",
            removed: false,
            startTime: new Date(),
        });
    });

    it("returns state", async () => {
        const res = await request(app).get("/client/state");
        expect(res.status).toBe(200);
        expect(res.body["abc"].id).toBe("abc");
    });
});
