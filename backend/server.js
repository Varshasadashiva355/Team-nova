const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const TYPES = ["object", "text", "obstacle"];
const DB_FAILURE_CODES = ["ECONNREFUSED", "ENOTFOUND", "ER_BAD_DB_ERROR", "PROTOCOL_CONNECTION_LOST", "ER_ACCESS_DENIED_ERROR"];

async function checkDatabase() {
  try {
    await db.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

function respondWithDbError(res, err, fallback) {
  if (err && (DB_FAILURE_CODES.includes(err.code) || !err.message)) {
    if (fallback !== undefined) {
      return res.status(200).json(fallback);
    }
    return res.status(503).json({ error: "Database unavailable. Start MySQL and import database/schema.sql." });
  }
  return res.status(500).json({ error: err?.message || "Database error" });
}

app.get("/api/health", async (req, res) => {
  const dbReady = await checkDatabase();
  res.json({ ok: dbReady, database: dbReady ? "connected" : "offline" });
});

// ---- DETECTIONS ----
app.get("/api/detections", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM detections ORDER BY created_at DESC LIMIT 50");
    res.json(rows.map((r) => ({ ...r, confidence: r.confidence === null ? null : Number(r.confidence) })));
  } catch (e) {
    return respondWithDbError(res, e, []);
  }
});

app.post("/api/detections", async (req, res) => {
  const { type, result, confidence = null } = req.body;
  if (!TYPES.includes(type) || !result) return res.status(400).json({ error: "type and result are required" });
  try {
    const [r] = await db.query("INSERT INTO detections (type, result, confidence) VALUES (?, ?, ?)", [type, String(result).slice(0, 2000), confidence]);
    res.status(201).json({ id: r.insertId, type, result, confidence });
  } catch (e) {
    return respondWithDbError(res, e);
  }
});

app.delete("/api/detections/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM detections WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (e) {
    return respondWithDbError(res, e);
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT type, COUNT(*) AS count FROM detections GROUP BY type");
    const stats = { object: 0, text: 0, obstacle: 0 };
    rows.forEach((r) => (stats[r.type] = Number(r.count)));
    res.json(stats);
  } catch (e) {
    return respondWithDbError(res, e, { object: 0, text: 0, obstacle: 0 });
  }
});

// ---- SAVED PLACES ----
app.get("/api/places", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM saved_places ORDER BY created_at DESC");
    res.json(rows);
  } catch (e) {
    return respondWithDbError(res, e, []);
  }
});

app.post("/api/places", async (req, res) => {
  const { name, note = "" } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  try {
    const [r] = await db.query("INSERT INTO saved_places (name, note) VALUES (?, ?)", [name, note]);
    res.status(201).json({ id: r.insertId, name, note });
  } catch (e) {
    return respondWithDbError(res, e);
  }
});

app.delete("/api/places/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM saved_places WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (e) {
    return respondWithDbError(res, e);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VisionMate API running on http://localhost:${PORT}`));
