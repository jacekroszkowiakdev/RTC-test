# How to Deal with Messy Data

Working with messy, unstructured data can be overwhelming. This guide will walk you through a systematic approach to understand and parse complex data formats.

## The Problem

You receive data that looks like this:

```
78784a2e-3bbb-45d3-aec1-a53b3ca0b6f0,a1ab04e9-9d28-4e36-a4c4-76ba49fd4457,65b99ec6-3c2b-4fd2-8630-8c743f38f67a,1749762778896,62b202fb-9cec-45ce-932a-f0d40ab5d8ca,387c26c1-dc55-47c4-9599-3734cd8ae40e,bf382528-4fa9-4b06-b531-e090e3161b0c,d737f2a8-17e1-4ecb-a419-405bb9bf97e4@12:13|18e716a4-d65c-495e-a0fc-a3b7efb822f5@4:5
```

It's completely unreadable, and you have no idea where to start!

## Step-by-Step Approach

### Step 1: Understand What You Have

The first step is always to break down the data into smaller, manageable pieces.

```javascript
// Start by just splitting on commas to see the structure
const rawData = "78784a2e-3bbb-45d3-aec1-a53b3ca0b6f0,a1ab04e9-9d28-4e36-a4c4-76ba49fd4457,65b99ec6-3c2b-4fd2-8630-8c743f38f67a,1749762778896,62b202fb-9cec-45ce-932a-f0d40ab5d8ca,387c26c1-dc55-47c4-9599-3734cd8ae40e,bf382528-4fa9-4b06-b531-e090e3161b0c,d737f2a8-17e1-4ecb-a419-405bb9bf97e4@12:13|18e716a4-d65c-495e-a0fc-a3b7efb822f5@4:5";

const parts = rawData.split(',');
console.log("Number of parts:", parts.length);
console.log("Parts:", parts);

// Output will show you:
// Number of parts: 8
// Parts: [
//   '78784a2e-3bbb-45d3-aec1-a53b3ca0b6f0',
//   'a1ab04e9-9d28-4e36-a4c4-76ba49fd4457',
//   '65b99ec6-3c2b-4fd2-8630-8c743f38f67a',
//   '1749762778896',
//   '62b202fb-9cec-45ce-932a-f0d40ab5d8ca',
//   '387c26c1-dc55-47c4-9599-3734cd8ae40e',
//   'bf382528-4fa9-4b06-b531-e090e3161b0c',
//   'd737f2a8-17e1-4ecb-a419-405bb9bf97e4@12:13|18e716a4-d65c-495e-a0fc-a3b7efb822f5@4:5'
// ]
```

### Step 2: Make Educated Guesses

Now try to figure out what each part represents. Look for patterns:

- UUIDs (long strings with dashes) are usually IDs
- Numbers might be timestamps, scores, or quantities
- Strings with `@` or `|` might be structured data

```javascript
// Label what you think each part is
const [
  possibleEventId,      // 78784a2e-3bbb-45d3-aec1-a53b3ca0b6f0 (looks like UUID)
  possibleSportId,      // a1ab04e9-9d28-4e36-a4c4-76ba49fd4457 (UUID)
  possibleCompetitionId, // 65b99ec6-3c2b-4fd2-8630-8c743f38f67a (UUID)
  possibleTimestamp,    // 1749762778896 (number - could be timestamp)
  possibleHomeTeam,     // 62b202fb-9cec-45ce-932a-f0d40ab5d8ca (UUID)
  possibleAwayTeam,     // 387c26c1-dc55-47c4-9599-3734cd8ae40e (UUID)
  possibleStatus,       // bf382528-4fa9-4b06-b531-e090e3161b0c (UUID)
  possibleScores        // d737f2a8-17e1-4ecb-a419-405bb9bf97e4@12:13|... (complex)
] = parts;

// Test your guesses
console.log("Possible timestamp as date:", new Date(Number(possibleTimestamp)));
// Output: 2025-06-11T22:26:18.896Z (looks reasonable!)

console.log("Score data:", possibleScores);
// Output: d737f2a8-17e1-4ecb-a419-405bb9bf97e4@12:13|18e716a4-d65c-495e-a0fc-a3b7efb822f5@4:5
```

### Step 3: Create a Simple Decoder Function

Once you understand the structure, create a function to parse it:

```javascript
function decodeEventData(rawData, mappings) {
  const parts = rawData.split(',');

  // Create a mapping lookup table
  const lookupMap = {};
  mappings.split(';').forEach(mapping => {
    const [id, name] = mapping.split(':');
    if (id && name) {
      lookupMap[id.trim()] = name.trim();
    }
  });

  // Decode each part using the lookup table
  return {
    eventId: parts[0],
    sport: lookupMap[parts[1]] || "Unknown Sport",
    competition: lookupMap[parts[2]] || "Unknown Competition",
    timestamp: new Date(Number(parts[3])),
    homeTeam: lookupMap[parts[4]] || "Unknown Home",
    awayTeam: lookupMap[parts[5]] || "Unknown Away",
    status: lookupMap[parts[6]] || "Unknown Status",
    rawScores: parts[7] // Handle this separately
  };
}
```

### Step 4: Handle Complex Nested Data

For the scores part (`d737f2a8-17e1-4ecb-a419-405bb9bf97e4@12:13|18e716a4-d65c-495e-a0fc-a3b7efb822f5@4:5`):

```javascript
function parseScores(scoresString, lookupMap) {
  if (!scoresString) return {};

  const scores = {};

  // Split by | to get individual score entries
  scoresString.split('|').forEach(entry => {
    // Split by @ to separate type from score
    const [typeId, scoreValue] = entry.split('@');
    if (typeId && scoreValue) {
      // Split score by : to get home:away
      const [home, away] = scoreValue.split(':');
      if (home && away) {
        const scoreType = lookupMap[typeId] || typeId;
        scores[scoreType] = {
          type: scoreType,
          home: home,
          away: away
        };
      }
    }
  });

  return scores;
}
```

### Step 5: Put It All Together

```javascript
function fullEventDecoder(rawData, mappings) {
  const parts = rawData.split(',');

  // Create lookup table
  const lookupMap = {};
  mappings.split(';').forEach(mapping => {
    const [id, name] = mapping.split(':');
    if (id && name) {
      lookupMap[id.trim()] = name.trim();
    }
  });

  const scores = parseScores(parts[7], lookupMap);

  return {
    eventId: parts[0],
    sport: lookupMap[parts[1]] || "Unknown Sport",
    competition: lookupMap[parts[2]] || "Unknown Competition",
    startTime: new Date(Number(parts[3])),
    homeTeam: lookupMap[parts[4]] || "Unknown Home",
    awayTeam: lookupMap[parts[5]] || "Unknown Away",
    status: lookupMap[parts[6]] || "Unknown Status",
    scores: scores
  };
}
```

### Step 6: Test Your Understanding

```javascript
const testData = "78784a2e-3bbb-45d3-aec1-a53b3ca0b6f0,a1ab04e9-9d28-4e36-a4c4-76ba49fd4457,65b99ec6-3c2b-4fd2-8630-8c743f38f67a,1749762778896,62b202fb-9cec-45ce-932a-f0d40ab5d8ca,387c26c1-dc55-47c4-9599-3734cd8ae40e,bf382528-4fa9-4b06-b531-e090e3161b0c,d737f2a8-17e1-4ecb-a419-405bb9bf97e4@12:13|18e716a4-d65c-495e-a0fc-a3b7efb822f5@4:5";

const testMappings = "a1ab04e9-9d28-4e36-a4c4-76ba49fd4457:FOOTBALL;65b99ec6-3c2b-4fd2-8630-8c743f38f67a:UEFA Champions League;62b202fb-9cec-45ce-932a-f0d40ab5d8ca:Barcelona;387c26c1-dc55-47c4-9599-3734cd8ae40e:Real Madrid;bf382528-4fa9-4b06-b531-e090e3161b0c:LIVE;d737f2a8-17e1-4ecb-a419-405bb9bf97e4:CURRENT;18e716a4-d65c-495e-a0fc-a3b7efb822f5:PERIOD_1";

const decoded = fullEventDecoder(testData, testMappings);
console.log("Decoded event:", JSON.stringify(decoded, null, 2));

// Expected output:
// {
//   "eventId": "78784a2e-3bbb-45d3-aec1-a53b3ca0b6f0",
//   "sport": "FOOTBALL",
//   "competition": "UEFA Champions League",
//   "startTime": "2025-06-11T22:26:18.896Z",
//   "homeTeam": "Barcelona",
//   "awayTeam": "Real Madrid",
//   "status": "LIVE",
//   "scores": {
//     "CURRENT": { "type": "CURRENT", "home": "12", "away": "13" },
//     "PERIOD_1": { "type": "PERIOD_1", "home": "4", "away": "5" }
//   }
// }
```

## General Tips for Dealing with Messy Data

### 1. Start Small

- Don't try to understand everything at once
- Focus on one piece at a time
- Get one part working before moving to the next

### 2. Console.log Everything  

- Print out each step to see what's happening
- Use `JSON.stringify(data, null, 2)` for readable object output
- Don't be afraid to add temporary logging

### 3. Make Assumptions and Test

- When you're not sure, make an educated guess
- Test your assumption with sample data
- Adjust when you find you're wrong

### 4. Look for Patterns

- UUIDs usually represent IDs for entities
- Numbers might be timestamps, scores, quantities
- Special characters (`@`, `|`, `:`) often separate different types of data
- Consistent positioning usually means structured format

### 5. Build Incrementally

- Start with a simple parser that handles basic cases
- Add complexity gradually
- Test each addition before moving on

### 6. Handle Edge Cases

- What happens with missing data?
- What if the format changes slightly?
- Always provide fallback values

### 7. Ask for Help

- Look for documentation about the data format
- Ask colleagues or the data provider
- Search online for similar formats

## Common Data Patterns

### CSV-like Formats

```
field1,field2,field3,field4
```

### Key-Value Pairs

```
key1:value1;key2:value2;key3:value3
```

### Nested Structures

```
parentId@childData|parentId@childData
```

### Timestamps

- Unix timestamps: `1749762778896`
- ISO dates: `2025-06-11T22:26:18.896Z`
- Formatted dates: `2025-06-11 22:26:18`

## Remember

Working with messy data is a skill that improves with practice. Don't get discouraged if it feels overwhelming at first. Every developer has been there! The key is to break it down into small, manageable pieces and work through it systematically.

Happy parsing!
