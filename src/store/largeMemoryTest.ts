import { fetchState, fetchMappings } from "../services/api";
import { parseRawState } from "../services/parseRawState";
import { sharedMemoryStore } from "./memoryStore";
import { InternalEvent } from "../types/types";

// Turn off verbose logging in memory store
const originalConsoleLog = console.log;
let suppressMemoryStoreLogs = false;

console.log = (...args: any[]) => {
    const message = args.join(" ");
    if (
        suppressMemoryStoreLogs &&
        (message.includes("[NEW]") ||
            message.includes("[REMOVED]") ||
            (message.includes("Event ") && message.includes(": removed=")))
    ) {
        return; // Skip these logs
    }
    originalConsoleLog(...args);
};

async function runLargeScaleTest() {
    try {
        console.log("=== LARGE SCALE MEMORY STORE TEST ===");
        console.log("Fetching initial dataset...");

        const rawMappings = await fetchMappings();
        let totalEvents = 0;
        const targetEvents = 500;

        // Phase 1: Add 500 events (since API returns same 10 events, we'll duplicate them)
        console.log("\nPhase 1: Adding 500 events...");
        suppressMemoryStoreLogs = true; // Turn off verbose logging

        // Get the base dataset once
        const rawState = await fetchState();
        const baseParsedEvents = parseRawState(rawState, rawMappings);
        console.log(`Base dataset contains ${baseParsedEvents.length} events`);

        if (baseParsedEvents.length === 0) {
            console.log(
                "ERROR: No events parsed! Check parseRawState function."
            );
            return;
        }

        // Create 50 batches of the 10 events (50 x 10 = 500)
        for (let batch = 0; batch < 50; batch++) {
            const uniqueEvents = baseParsedEvents.map((event, index) => ({
                ...event,
                id: `${event.id}-batch${batch}-idx${index}`,
                startTime: new Date(
                    Date.now() + batch * 1000 * 60 + index * 1000
                ), // Spread times
                // Vary some properties to make events more realistic
                competitors: {
                    HOME: {
                        ...event.competitors.HOME,
                        name: `${event.competitors.HOME.name} B${batch}`,
                    },
                    AWAY: {
                        ...event.competitors.AWAY,
                        name: `${event.competitors.AWAY.name} B${batch}`,
                    },
                },
            }));

            for (const event of uniqueEvents) {
                sharedMemoryStore.set(event);
            }

            totalEvents += uniqueEvents.length;

            if (totalEvents >= targetEvents) break;
        }

        console.log(`SUCCESS: Added ${totalEvents} events to memory store`);

        // Phase 2: Test removed flag functionality
        console.log("\nPhase 2: Testing removed flag functionality...");

        const allEvents = sharedMemoryStore.getAll();
        const eventIds = Object.keys(allEvents);

        // Pick some events to mark as removed
        const eventsToRemove = eventIds.slice(0, 50); // Remove first 50 events
        console.log(`Marking ${eventsToRemove.length} events as REMOVED...`);

        for (const eventId of eventsToRemove) {
            const event = allEvents[eventId];
            const removedEvent: InternalEvent = {
                ...event,
                status: "REMOVED",
            };
            sharedMemoryStore.set(removedEvent);
        }

        // Phase 3: Verify filtering works
        console.log("\nPhase 3: Verifying removed event filtering...");

        const totalInStore = Object.keys(sharedMemoryStore.getAll()).length;
        const activeEvents = sharedMemoryStore.getActiveEvents();
        const activeCount = Object.keys(activeEvents).length;
        const removedCount = totalInStore - activeCount;

        console.log(`Results:`);
        console.log(`  Total events in store: ${totalInStore}`);
        console.log(`  Active events: ${activeCount}`);
        console.log(`  Removed events: ${removedCount}`);
        console.log(`  Expected removed: ${eventsToRemove.length}`);

        // Verify the math
        if (removedCount === eventsToRemove.length) {
            console.log("SUCCESS: Removed flag filtering working correctly!");
        } else {
            console.log("ERROR: Removed flag filtering has issues!");
        }

        // Phase 4: Test resurrection prevention
        console.log("\nPhase 4: Testing resurrection prevention...");

        if (eventsToRemove.length > 0) {
            const firstRemovedId = eventsToRemove[0];
            const removedEvent = allEvents[firstRemovedId];

            console.log(`Attempting to resurrect event ${firstRemovedId}...`);
            const resurrectionAttempt: InternalEvent = {
                ...removedEvent,
                status: "LIVE", // Try to bring it back to life
            };

            sharedMemoryStore.set(resurrectionAttempt);

            const afterResurrection = sharedMemoryStore.getActiveEvents();
            const stillRemoved = !afterResurrection[firstRemovedId];

            if (stillRemoved) {
                console.log(
                    "SUCCESS: Resurrection prevention working - event stayed removed!"
                );
            } else {
                console.log(
                    "ERROR: Event was resurrected - guard clause might be missing!"
                );
            }
        } else {
            console.log("WARNING: No events to test resurrection with.");
        }

        // Phase 5: Performance test
        console.log("\nPhase 5: Performance testing...");
        suppressMemoryStoreLogs = true; // Keep logs suppressed

        console.time("Get all events");
        const allEventsPerf = sharedMemoryStore.getAll();
        console.timeEnd("Get all events");

        console.time("Filter active events");
        const activeEventsPerf = sharedMemoryStore.getActiveEvents();
        console.timeEnd("Filter active events");

        console.log(
            `Performance results with ${
                Object.keys(allEventsPerf).length
            } total events`
        );

        // Show sample data
        console.log("\nSample Event:");
        const sampleEvent = Object.values(activeEventsPerf)[0];
        if (sampleEvent) {
            console.log(`Event ID: ${sampleEvent.id}`);
            console.log(`Status: ${sampleEvent.status}`);
            console.log(`Sport: ${sampleEvent.sport}`);
            console.log(
                `Teams: ${sampleEvent.competitors.HOME.name} vs ${sampleEvent.competitors.AWAY.name}`
            );
        }

        // Final summary - restore logging and show totals
        suppressMemoryStoreLogs = false;
        console.log("\nFINAL SUMMARY:");
        console.log(`Total events processed: ${totalEvents}`);
        console.log(`Events in store: ${Object.keys(allEventsPerf).length}`);
        console.log(`Active events: ${Object.keys(activeEventsPerf).length}`);
        console.log(
            `Removed events: ${
                Object.keys(allEventsPerf).length -
                Object.keys(activeEventsPerf).length
            }`
        );

        console.log("\nLarge scale test completed successfully!");
    } catch (error) {
        console.error("ERROR: Large Scale Test Error:", error);
        process.exit(1);
    }

    setTimeout(() => {
        console.log("Exiting...");
        process.exit(0);
    }, 2000);
}

runLargeScaleTest();
