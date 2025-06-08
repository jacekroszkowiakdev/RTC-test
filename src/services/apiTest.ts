import { fetchState, fetchMappings } from "./api";

async function testApi() {
    try {
        const rawState = await fetchState();
        console.log("rawState: ", rawState.slice(0, 300) + "...");

        const mappings = await fetchMappings();
        console.log("mappings sample:", mappings);
    } catch (error) {
        console.error("API test failed:", error);
    }
}

testApi();
