import { fetchState, fetchMappings } from "../services/api";
import { parseRawState } from "../services/parseRawState";
import { sharedMemoryStore } from "./memoryStore";

async function runStoreTest() {
    try {
        console.log("Fetching raw API data...");
        const rawState = await fetchState();
        const rawMappings = await fetchMappings();

        console.log("Parsing data...");
        const parsedEvents = parseRawState(rawState, rawMappings);
        console.log(
            `Parsed ${parsedEvents.length} events. Adding to memory...`
        );

        // Add events to memory store
        for (const event of parsedEvents) {
            sharedMemoryStore.set(event);
        }

        // Verify events were added correctly
        const activeEvents = sharedMemoryStore.getActiveEvents();
        console.log(
            `Active events in memory: ${Object.keys(activeEvents).length}`
        );

        // Show sample event
        console.log("\nSample Event:");
        if (parsedEvents.length > 0) {
            console.log(JSON.stringify(parsedEvents[0], null, 2));
        }

        // Optional: Show all event IDs
        console.log("\nEvent IDs:", Object.keys(activeEvents));
    } catch (error) {
        console.error("Memory Store Test Error:", error);
        process.exit(1);
    }

    // Clean exit
    setTimeout(() => {
        console.log("Test completed successfully. Exiting...");
        process.exit(0);
    }, 1000);
}

runStoreTest();

// Add this to your current test file
async function debugAPI() {
    console.log("=== API DEBUG ===");

    const rawState1 = await fetchState();
    console.log("First call - rawState length:", rawState1.length);
    console.log("First call - first 200 chars:", rawState1.substring(0, 200));

    const rawState2 = await fetchState();
    console.log("Second call - rawState length:", rawState2.length);
    console.log("Second call - first 200 chars:", rawState2.substring(0, 200));

    console.log("Are calls identical?", rawState1 === rawState2);

    const lines1 = rawState1.split("\n").filter((line) => line.trim());
    const lines2 = rawState2.split("\n").filter((line) => line.trim());

    console.log("First call event count:", lines1.length);
    console.log("Second call event count:", lines2.length);
}

debugAPI();
