import express from "express";
import cors from "cors";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();

// CORS
app.use(cors());

// მოვითხოვოთ raw body ყველა audio-content-სთვის
app.use(
  express.raw({
    type: "audio/*",
    limit: "20mb", // როგორც გინდა, შეგიძლია გაზარდო/შემცირო
  })
);

// Health check
app.get("/", (req, res) => {
  res.send("Georgian Speech API is running ✅");
});

app.post("/transcribe", async (req, res) => {
  try {
    // შევამოწმოთ, რომ ფაილი ნამდვილად მოვიდა
    const audioBuffer = req.body;

    if (!audioBuffer || !audioBuffer.length) {
      return res.status(400).json({ error: "No audio data received" });
    }

    const result = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioBuffer,   // პირდაპირ Buffer-ს ვაწვდით
      language: "ka",
      response_format: "json",
    });

    res.json({ text: result.text });
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
