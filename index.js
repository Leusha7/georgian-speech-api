import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();

app.use(cors());
const upload = multer();

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioFile = req.file;

    const result = await openai.audio.transcriptions.create({
      model: "gpt-4o-mini-tts",
      file: new File([audioFile.buffer], "audio.m4a"),
      language: "ka"
    });

    res.json({ text: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

app.listen(10000, () => console.log("Running on port 10000"));
