import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import whisper from "whisper-node";

const app = express();
app.use(cors());
const upload = multer({ dest: "/tmp" });

app.post("/speech", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.json({ error: "No audio file" });

    const result = await whisper(req.file.path, {
      model: "base",
      language: "ka" // ქართული
    });

    fs.unlinkSync(req.file.path);

    res.json({ text: result.text });
  } catch (err) {
    res.json({ error: err.toString() });
  }
});

app.get("/", (req, res) => {
  res.send("Georgian Speech API is running");
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Server running on port", port));

