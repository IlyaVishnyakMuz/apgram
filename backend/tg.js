import TelegramBot from "node-telegram-bot-api";
import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cron from "node-cron";
import http from "http";
import { WebSocketServer } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generatePosts as generatePostsService } from "./generation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Telegram ---
const token = "8249590224:AAHGhjVHQmpLc07MK3_ofcgGapDrluXj1kY"; // замените!
const channelId = "@reacttestchanell";
const bot = new TelegramBot(token, { polling: false });

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- SQLite ---
let db;
(async () => {
  db = await open({
    filename: "./posts.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      scheduledAt TEXT,
      sent INTEGER DEFAULT 0
    )
  `);
})();

// --- Multer ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + unique + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG or WEBP images are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

app.use("/uploads", express.static(uploadDir));

// --- WebSocket ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

function broadcast(message) {
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === 1) client.send(data);
  }
}

// --- API ---

// 🔼 Upload image
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "Файл не загружен" });
    const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl.replace(/\\/g, "/") });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📝 Create post
app.post("/posts", async (req, res) => {
  try {
    const { title, description, url, scheduledAt } = req.body;
    const result = await db.run(
      "INSERT INTO posts (title, description, url, scheduledAt) VALUES (?, ?, ?, ?)",
      [title, description, url, scheduledAt || null]
    );
    broadcast({ type: "posts_updated" });
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔍 Get all posts
// 🔍 Get all posts (с сортировкой по времени отправки)
app.get("/posts", async (req, res) => {
  try {
    const posts = await db.all(`
      SELECT * FROM posts
      ORDER BY 
        CASE 
          WHEN scheduledAt IS NOT NULL THEN 0 ELSE 1 
        END,               -- сначала с запланированным временем
        datetime(scheduledAt) ASC,  -- ближайшее время вперёд
        id DESC                     -- потом по убыванию id (новые сверху)
    `);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔍 Get post by ID
app.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db.get("SELECT * FROM posts WHERE id = ?", id);
    if (!post) return res.status(404).json({ success: false, error: "Пост не найден" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🖼️ Delete image from post
app.delete("/posts/:id/image", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db.get("SELECT * FROM posts WHERE id = ?", id);
    if (!post) return res.status(404).json({ success: false, error: "Пост не найден" });

    if (post.url && post.url.includes("/uploads/")) {
      const filename = path.basename(post.url);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.run("UPDATE posts SET url = NULL WHERE id = ?", id);
    broadcast({ type: "posts_updated" });
    res.json({ success: true, message: "🗑️ Картинка удалена" });
  } catch (err) {
    console.error("Ошибка при удалении картинки:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🗑️ Delete post
app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db.get("SELECT * FROM posts WHERE id = ?", id);
    if (!post) return res.status(404).json({ success: false, error: "Пост не найден" });

    if (post.url && post.url.includes("/uploads/")) {
      const filename = path.basename(post.url);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.run("DELETE FROM posts WHERE id = ?", id);
    broadcast({ type: "posts_updated" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✏️ Update post
app.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, url, scheduledAt } = req.body;
    const post = await db.get("SELECT * FROM posts WHERE id = ?", id);
    if (!post) return res.status(404).json({ success: false, error: "Пост не найден" });

    if (url && url !== post.url && post.url?.includes("/uploads/")) {
      const oldFilename = path.basename(post.url);
      const oldPath = path.join(uploadDir, oldFilename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.run(
      `UPDATE posts SET title = ?, description = ?, url = ?, scheduledAt = ? WHERE id = ?`,
      [title ?? post.title, description ?? post.description, url ?? post.url, scheduledAt ?? post.scheduledAt, id]
    );

    broadcast({ type: "posts_updated" });
    res.json({ success: true, message: "✅ Пост обновлён" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📤 Send post manually (safe send)
app.post("/sendPost/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db.get("SELECT * FROM posts WHERE id = ?", id);
    if (!post) return res.status(404).json({ success: false, error: "Пост не найден" });

    const caption = `*${post.title}*\n\n${post.description || ""}`;
    const sendPhotoSafe = async (src) => {
      try {
        await bot.sendPhoto(channelId, src, { caption, parse_mode: "Markdown" });
        return true;
      } catch (err) {
        console.warn("⚠️ Ошибка при отправке фото:", err.message);
        await bot.sendMessage(channelId, caption, { parse_mode: "Markdown" });
        return false;
      }
    };

    if (post.url?.includes("/uploads/")) {
      const filePath = path.join(uploadDir, path.basename(post.url));
      if (fs.existsSync(filePath)) {
        await sendPhotoSafe(fs.createReadStream(filePath));
        fs.unlinkSync(filePath);
      } else {
        await sendPhotoSafe(post.url);
      }
    } else if (post.url) {
      await sendPhotoSafe(post.url);
    } else {
      await bot.sendMessage(channelId, caption, { parse_mode: "Markdown" });
    }

    await db.run("DELETE FROM posts WHERE id = ?", id);
    broadcast({ type: "posts_updated" });
    res.json({ success: true, message: "📤 Пост отправлен и удалён" });
  } catch (err) {
    console.error("Ошибка отправки:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ⚙️ Generate posts (⚠️ теперь БЕЗ добавления в базу данных)
app.post("/generate-posts", async (req, res) => {
  try {
    const posts = await generatePostsService(); // получаем сгенерированные посты

    // Просто возвращаем на фронтенд — ничего не сохраняем в базу
    res.json(posts);
  } catch (err) {
    console.error("Ошибка при генерации постов:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ⏰ Schedule post
app.post("/schedulePost/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;
    const post = await db.get("SELECT * FROM posts WHERE id = ?", id);
    if (!post) return res.status(404).json({ success: false, error: "Пост не найден" });

    await db.run("UPDATE posts SET scheduledAt = ?, sent = 0 WHERE id = ?", [scheduledAt, id]);
    broadcast({ type: "posts_updated" });
    res.json({ success: true, message: "📅 Время отправки назначено", scheduledAt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ⏹ Cancel scheduled post
app.delete("/schedulePost/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.run("UPDATE posts SET scheduledAt = NULL WHERE id = ?", id);
    broadcast({ type: "posts_updated" });
    res.json({ success: true, message: "⏹️ Отправка отменена" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🕐 CRON auto-send
cron.schedule("*/10 * * * * *", async () => {
  try {
    const now = new Date().toISOString();
    const posts = await db.all(
      "SELECT * FROM posts WHERE sent = 0 AND scheduledAt IS NOT NULL AND scheduledAt <= ?",
      now
    );

    for (const post of posts) {
      const caption = `*${post.title}*\n\n${post.description || ""}`;
      try {
        if (post.url?.includes("/uploads/")) {
          const filePath = path.join(uploadDir, path.basename(post.url));
          if (fs.existsSync(filePath)) {
            await bot.sendPhoto(channelId, fs.createReadStream(filePath), { caption, parse_mode: "Markdown" });
            fs.unlinkSync(filePath);
          } else {
            await bot.sendPhoto(channelId, post.url, { caption, parse_mode: "Markdown" });
          }
        } else if (post.url) {
          await bot.sendPhoto(channelId, post.url, { caption, parse_mode: "Markdown" });
        } else {
          await bot.sendMessage(channelId, caption, { parse_mode: "Markdown" });
        }

        await db.run("DELETE FROM posts WHERE id = ?", post.id);
      } catch (err) {
        console.error(`Ошибка при автоотправке #${post.id}:`, err.message);
      }
    }

    if (posts.length) broadcast({ type: "posts_updated" });
  } catch (err) {
    console.error("Ошибка в CRON:", err.message);
  }
});

server.listen(4000, () => console.log("🚀 Backend + WS запущен на http://localhost:4000"));
