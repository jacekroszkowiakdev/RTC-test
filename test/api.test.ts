import { describe, it, expect } from "vitest";
import { fetchState, fetchMappings } from "../src/services/api";

describe("API integration", () => {
    it("fetchState() should return non-empty string", async () => {
        const state = await fetchState();

        expect(typeof state).toBe("string");
        expect(state.length).toBeGreaterThan(0);
        expect(state.includes("\n")).toBe(true);
    });

    it("fetchMappings() should return a non empty string", async () => {
        const mappings = await fetchMappings();

        expect(typeof mappings).toBe("string");
        expect(mappings.length).toBeGreaterThan(0);
        expect(mappings.includes(";")).toBe(true);
    });
});
