import express from "express";
import { Crawler } from "./crawler";
import { MemoryStore } from "./store/memoryStore";

const app = express();
const port = 3001;

const store = new MemoryStore();
const crawler = new Crawler(store);

setInterval(() => crawler.fetchAndUpdate(), 1000);

app.get("/client/state", (req, res) => {
    res.json(store.getAll());
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
