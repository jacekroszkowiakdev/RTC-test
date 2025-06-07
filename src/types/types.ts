export type Score = {
    type: string;
    home: string;
    away: string;
};

export type Competitor = {
    type: "HOME" | "AWAY";
    name: string;
};

export type Event = {
    id: string;
    status: "PRE" | "LIVE" | "REMOVED";
    scores: Record<string, Score>;
    startTime: Date;
    sport: string;
    competitors: {
        HOME: Competitor;
        AWAY: Competitor;
    };
    competition: string;
};

export type InternalStore = {
    [eventId: string]: Event & { removed?: boolean };
};
