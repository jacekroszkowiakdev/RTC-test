export type Score = {
    type: string;
    home: string;
    away: string;
};

export type Competitor = {
    type: "HOME" | "AWAY";
    name: string;
};

export type SportEvent = {
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

export type InternalEvent = SportEvent & { removed?: boolean };

export type InternalStore = {
    [eventId: string]: InternalEvent;
};
