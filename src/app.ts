import express from "express";
import { MemoryStore } from "./store/memoryStore";

export function createApp(store: MemoryStore) {
    const app = express();

    app.get("/client/state", (_req, res) => {
        res.json(store.getAll());
    });

    return app;
}
