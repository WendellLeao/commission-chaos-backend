import express from "express";
import { scoresRouter } from "./routes/scores.js";
import "./db.js"; // Importing this runs db.ts's top-level code, which opens
                   // the connection and creates the table if needed.

const app = express();
const PORT = 3000;

// Built-in Express middleware that parses incoming requests with a JSON body
// (like our POST /scores) and makes the result available as req.body.
// Without this, req.body would be undefined.
app.use(express.json());

// Mount all routes defined in scoresRouter (GET /scores, POST /scores).
app.use(scoresRouter);

app.listen(PORT, () => {
  console.log(`Highscore server running at http://localhost:${PORT}`);
});
