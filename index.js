import express from "express";
import cors from "cors";
import OpenAI from "openai";
import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();

app.use(cors());

// ვიღებთ raw ბიტებს ყველა audio/* body-სთვის
app.use(
  express.raw({
    type: "audio/*",
    limit: "20mb",
  })
);

// Health check
app.get("/", (req, res) => {
  res.send("Georgian Speech API is running ✅");
});

app.post("/transcribe", async (req, res) => {
  try {
    const audioBuffer = req.body;

    if (!audioBuffer || !audioBuffer.length) {
      return res.status(400).json({ error: "No audio data received" });
    }

    // 1) დროებითი ფაილი /tmp-ში
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `${randomUUID()}.m4a`);
    await fs.promises.writeFile(filePath, audioBuffer);

    try {
      // 2) ვუშვებთ Whisper-ს ფაილის სტრიმით
      const result = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: fs.createReadStream(filePath),
        language: "ka",
        response_format: "json",
      });

      res.json({ text: result.text });
    } finally {
      // 3) ვშლით დროებით ფაილს
      try {
        await fs.promises.unlink(filePath);
      } catch (e) {
        console.error("Failed to delete temp file:", e);
      }
    }
  } catch (err) {
    console.error("TRANSCRIBE ERROR:", err);
    res
      .status(500)
      .json({ error: "Transcription failed", details: err.toString() });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
