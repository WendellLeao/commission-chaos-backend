import { Router, Request, Response } from "express";
import { db } from "../db.js";

// Note: even though the source file is db.ts, we import it as "db.js" here.
// This is required by the "NodeNext" module resolution: at runtime, Node
// looks for the compiled .js file, so TS import paths must use the .js extension.

export const scoresRouter = Router();

// Describes the shape of a row coming back from the "scores" table.
// Declaring this lets TypeScript check that we're reading the right fields
// when we query the database, instead of treating rows as "any".
interface ScoreRow {
  id: number;
  playerName: string;
  score: number;
  createdAt: string;
}

// Describes the expected shape of the JSON body sent in a POST request.
interface CreateScoreBody {
  playerName: string;
  score: number;
}

// GET /scores
// Returns every highscore, ordered from highest to lowest.
scoresRouter.get("/scores", (req: Request, res: Response) => {
  // "all()" runs the query immediately and returns every matching row (sync call).
  const scores = db
    .prepare("SELECT id, playerName, score, createdAt FROM scores ORDER BY score DESC")
    .all() as ScoreRow[];

  res.json(scores);
});

// POST /scores
// Expects a JSON body: { "playerName": string, "score": number }
scoresRouter.post("/scores", (req: Request, res: Response) => {
  const { playerName, score } = req.body as CreateScoreBody;

  // Basic input validation. Since this is a public-facing HTTP endpoint,
  // we can't trust the client (Unity build) to always send well-formed data.
  if (typeof playerName !== "string" || playerName.trim().length === 0) {
    res.status(400).json({ error: "playerName must be a non-empty string" });
    return;
  }

  if (typeof score !== "number" || !Number.isFinite(score)) {
    res.status(400).json({ error: "score must be a valid number" });
    return;
  }

  const createdAt = new Date().toISOString();

  // "prepare().run()" executes an INSERT and returns metadata about the operation,
  // including "lastInsertRowid", the auto-generated id of the new row.
  const result = db
    .prepare("INSERT INTO scores (playerName, score, createdAt) VALUES (?, ?, ?)")
    .run(playerName.trim(), score, createdAt);

  res.status(201).json({
    id: result.lastInsertRowid,
    playerName: playerName.trim(),
    score,
    createdAt,
  });
});
