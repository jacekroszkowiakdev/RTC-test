import { SportEvent, InternalEvent, InternalStore } from "../types/types";

class MemoryStore {
    private state: InternalStore = {};

    // get raw events
    public getAll(): InternalStore {
        return this.state;
    }

    // get active events
    public getActiveEvents(): Record<string, SportEvent> {
        return Object.fromEntries(
            Object.entries(this.state).filter(
                ([, event]) => !(event as InternalEvent).removed
            )
        );
    }

    // add or update event
    public set(event: InternalEvent): void {
        const existingEvent = this.state[event.id];

        if (existingEvent) {
            // log status change
            if (existingEvent.status !== event.status) {
                console.log(
                    `[STATUS] ${event.id}" ${existingEvent.status} changed to ${event.status}`
                );
            }

            // log score change
            if (
                JSON.stringify(existingEvent.scores) !==
                JSON.stringify(event.scores)
            ) {
                console.log(`[SCORE] ${event.id}:`, {
                    before: existingEvent.scores,
                    after: event.scores,
                });
            }
        }

        // update state with new data
        this.state[event.id] = event;
    }
}

export const memoryStore = new MemoryStore();
