import { readFile, writeFile } from 'fs/promises';
import express from 'express';

const app = express();

app.use(express.json());

// Allow frontend access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// LOGS ROUTE must go OUTSIDE recommend route
app.get('/api/logs', async (req, res) => {
  try {
    const logData = await readFile('./logs.json', 'utf8');
    const logs = JSON.parse(logData);
    res.json(logs);
  } catch (err) {
    console.error(" Error reading logs:", err);
    res.status(500).json({ message: 'Could not load logs' });
  }
});

app.post('/api/recommend', async (req, res) => {
  const { goal } = req.body;
  console.log("User typed goal:", goal);

  try {
    // Read products
    const rawData = await readFile('./data/products.json', 'utf8');
    const products = JSON.parse(rawData);

    // Match user goal to category
    const match = products.find(p =>
      goal.toLowerCase().includes(p.category)
    );

    let responseMessage = '';
    let matchedItems = [];

    if (match) {
      matchedItems = match.items;
      responseMessage = matchedItems.map(
        item => `${item.title} (${item.price}) → ${item.link}`
      ).join('\n');
    } else {
      responseMessage = "No matching category found in local data.";
    }

    // Log this interaction
    const logEntry = {
      timestamp: new Date().toISOString(),
      goal,
      categoryMatched: match?.category || null,
      itemsReturned: matchedItems.map(item => item.title)
    };

    // Append to logs.json
    const logData = await readFile('./logs.json', 'utf8');
    const logs = JSON.parse(logData);
    logs.push(logEntry);
    await writeFile('./logs.json', JSON.stringify(logs, null, 2));

    // Send response to client
    res.json({ message: responseMessage });

  } catch (err) {
    console.error(" Error processing request:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
