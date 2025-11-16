import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();

app.use(cors());
const upload = multer();

// Health check
app.get("/", (req, res) => {
  res.send("Georgian Speech API is running ✅");
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;

    const result = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: {
        data: audioBuffer,
        name: "audio.m4a"
      },
      language: "ka"
    });

    res.json({ text: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transcription failed", details: err });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
