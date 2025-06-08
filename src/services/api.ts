export async function fetchState(): Promise<string> {
    const res = await fetch("http://localhost:3000/api/state");
    if (!res.ok) throw new Error(`Failed to fetch state: ${res.status}`);

    const data = await res.json();
    return data.odds;
}

export async function fetchMappings(): Promise<string> {
    const res = await fetch("http://localhost:3000/api/mappings");
    if (!res.ok) throw new Error(`Failed to fetch mappings: ${res.status}`);

    const data = await res.json();
    return data.mappings;
}
