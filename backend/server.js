import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { auth } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Skladište API radi");
});

app.post("/login", async (req, res) => {
  const { email, lozinka } = req.body;
  const q = await db.query("SELECT * FROM users WHERE email=$1", [email]);
  if (!q.rows[0]) return res.sendStatus(401);

  const ok = await bcrypt.compare(lozinka, q.rows[0].password);
  if (!ok) return res.sendStatus(401);

  const token = jwt.sign(
    { id: q.rows[0].id, role: q.rows[0].role },
    process.env.JWT_SECRET
  );
  res.json({ token });
});

app.get("/product/:barkod", auth, async (req, res) => {
  const q = await db.query(
    "SELECT * FROM products WHERE barkod=$1",
    [req.params.barkod]
  );
  if (!q.rows[0]) return res.json({ postoji: false });
  res.json({ postoji: true, ...q.rows[0] });
});

app.post("/move", auth, async (req, res) => {
  const { barkod, delta } = req.body;
  await db.query(
    "UPDATE products SET kolicina = kolicina + $1 WHERE barkod=$2",
    [delta, barkod]
  );
  const q = await db.query(
    "SELECT kolicina FROM products WHERE barkod=$1",
    [barkod]
  );
  res.json({ kolicina: q.rows[0].kolicina });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend pokrenut"));
