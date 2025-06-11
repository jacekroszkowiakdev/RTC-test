import { fetchState, fetchMappings } from "../services/api";
import { parseRawState } from "../services/parseRawState";
import { sharedMemoryStore } from "./memoryStore";

const delay = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

async function runStoreTest() {
    console.log("Fetching raw API data...");
    const rawState = await fetchState();
    const rawMappings = await fetchMappings();

    console.log("Parsing data...");
    const parsedEvents = parseRawState(rawState, rawMappings);

    console.log(`Parsed ${parsedEvents.length} events. Adding to memory...`);
    for (const event of parsedEvents) {
        sharedMemoryStore.set(event);
    }

    console.log("Active Events:");
    console.log(sharedMemoryStore.getActiveEvents());

    await delay(1000);
    runStoreTest();
}

runStoreTest().catch((error) =>
    console.error("Manual Memory Store Error: ", error)
);
