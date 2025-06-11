export type Score = {
    type: string;
    home: string;
    away: string;
};

export type Competitor = {
    type: "HOME" | "AWAY";
    name: string;
};

export type Status = "PRE" | "LIVE" | "REMOVED";
export type SportEvent = {
    id: string;
    status: Status;
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
