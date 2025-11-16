import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();

app.use(cors());
const upload = multer();

app.get("/", (req, res) => {
  res.send("Georgian Speech API is running ✅");
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file received" });
    }

    const audioBuffer = req.file.buffer;

    const result = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: {
        data: audioBuffer
      },
      language: "ka",
      response_format: "json"
    });

    res.json({ text: result.text });

  } catch (err) {
    console.error("TRANSCRIBE ERROR:", err);
    res.status(500).json({ error: "Transcription failed", details: err.toString() });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

