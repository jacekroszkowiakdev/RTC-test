import { SportEvent, InternalEvent, InternalStore } from "../types/types";

export class MemoryStore {
    private state: InternalStore = {};

    // get raw events
    public getAll(): InternalStore {
        return this.state;
    }

    // get active events
    public getActiveEvents(): Record<string, SportEvent> {
        const filtered = Object.entries(this.state).filter(([, event]) => {
            const isRemoved = (event as InternalEvent).removed;
            console.log(`Event ${event.id}: removed=${isRemoved}`);
            return !isRemoved;
        });

        const result = Object.fromEntries(filtered);
        return result;
    }

    // add or update event
    public set(event: InternalEvent): void {
        const existingEvent = this.state[event.id];

        if (existingEvent?.removed) {
            return;
        }

        if (event.status === "REMOVED") {
            this.state[event.id] = {
                ...event,
                removed: true,
            };

            console.log(`[REMOVED] Event ${event.id} marked as removed.`);
            return;
        }

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
        } else {
            console.log(`[NEW] Event ${event.id} added.`);
        }

        this.state[event.id] = {
            ...event,
            removed: false,
        };
    }
}
export const sharedMemoryStore = new MemoryStore();
