import { parseRawState } from "./services/parseRawState";
import { fetchMappings, fetchState } from "./services/api";
import { MemoryStore } from "./store/memoryStore";
import { SportEvent } from "./types/types";

export class Crawler {
    private store: MemoryStore;

    constructor(store: MemoryStore) {
        this.store = store;
    }

    public async fetchAndUpdate(): Promise<void> {
        const rawState = await fetchState();
        const rawMappings = await fetchMappings();
        const events: SportEvent[] = parseRawState(rawState, rawMappings);

        for (const event of events) {
            this.store.set(event);
        }
    }
}
