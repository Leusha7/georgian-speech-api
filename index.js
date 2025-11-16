import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();

app.use(cors());

// ნებისმიერს დავუშვებთ, მერე პირველ ფაილს ავიღებთ
const upload = multer();

// Health check
app.get("/", (req, res) => {
  res.send("Georgian Speech API is running ✅");
});

app.post("/transcribe", upload.any(), async (req, res) => {
  try {
    // ვნახოთ საერთოდ მოვიდა თუ არა ფაილი
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No audio file received" });
    }

    // ავიღოთ პირველი ფაილი (არ აქვს მნიშვნელობა field-ის სახელს)
    const audioFile = req.files[0];
    const audioBuffer = audioFile.buffer;

    const result = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioBuffer,   // Buffer-ს პირდაპირ ვაწვდით
      language: "ka",
      response_format: "json"
    });

    res.json({ text: result.text });
  } catch (err) {
    console.error("TRANSCRIBE ERROR:", err);
    res.status(500).json({
      error: "Transcription failed",
      details: err.toString()
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
