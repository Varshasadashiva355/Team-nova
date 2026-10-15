import { useEffect, useRef, useState, useCallback } from "react";
import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import Tesseract from "tesseract.js";
import { api } from "./api";

const LANGUAGE_OPTIONS = [
  { id: "en", label: "English", lang: "en-US", ocr: "eng" },
  { id: "hi", label: "हिन्दी", lang: "hi-IN", ocr: "eng+hin" },
  { id: "ta", label: "தமிழ்", lang: "ta-IN", ocr: "eng+tam" },
];

const TEXT_MAP = {
  en: {
    labels: {
      chair: "chair",
      person: "person",
      bicycle: "bicycle",
      car: "car",
      motorcycle: "motorcycle",
      bus: "bus",
      train: "train",
      truck: "truck",
      boat: "boat",
      knife: "knife",
      scissors: "scissors",
      table: "table",
      door: "door",
      bottle: "bottle",
      laptop: "laptop",
      cell: "cell phone",
      traffic: "traffic light",
      exit: "exit",
      warning: "warning",
      close: "very close",
      large: "appears large in the camera view",
      vehicle: "vehicle",
      sharp: "sharp object",
      detectedAt: "detected",
      ahead: "ahead",
      left: "on your left",
      right: "on your right",
      empty: "No objects detected in the camera view.",
      safe: "safe",
      detected: "I see",
      noText: "No text found. Move closer.",
      startCamera: "Start the camera first",
      cameraOn: "Camera on. Surroundings mode.",
      cameraOff: "Camera off",
      read: "Reading",
      mode: "mode",
      listening: "Listening…",
      askPlacePrompt: "Say the name of the saved place you need directions to.",
      savePlaceNamePrompt: "Say the name of the place to save.",
      savePlaceNotePrompt: "Say the directions for this place.",
      noPlaces: "There are no saved places yet.",
      noPlaceMatch: "I could not find saved directions for",
      noDirections: "No directions have been saved for this place.",
      placeSaved: "Place saved",
      voiceUnsupported: "Voice input is not supported in this browser.",
      voiceFailed: "I could not hear that. Please try again.",
    },
  },
  hi: {
    labels: {
      chair: "कुर्सी",
      person: "व्यक्ति",
      bicycle: "साइकिल",
      car: "कार",
      motorcycle: "मोटरसाइकिल",
      bus: "बस",
      train: "ट्रेन",
      truck: "ट्रक",
      boat: "नाव",
      knife: "चाकू",
      scissors: "कैंची",
      table: "मेज",
      door: "दरवाज़ा",
      bottle: "बोतल",
      laptop: "लैपटॉप",
      cell: "मोबाइल",
      traffic: "ट्रैफ़िक लाइट",
      exit: "निकास",
      warning: "सावधान",
      close: "बहुत पास",
      large: "कैमरे के दृश्य में बड़ा दिखाई दे रहा है",
      vehicle: "वाहन",
      sharp: "नुकीली वस्तु",
      detectedAt: "दिखाई दिया",
      ahead: "सीधे सामने",
      left: "बाईं ओर",
      right: "दाईं ओर",
      empty: "कैमरे के दृश्य में कोई वस्तु नहीं मिली।",
      safe: "सुरक्षित",
      detected: "मैं देख रहा हूँ",
      noText: "कोई टेक्स्ट नहीं मिला। करीब आएँ।",
      startCamera: "पहले कैमरा शुरू करें",
      cameraOn: "कैमरा चालू है। आसपास का मोड।",
      cameraOff: "कैमरा बंद है",
      read: "पढ़ा जा रहा है",
      mode: "मोड",
      listening: "सुन रहा हूँ…",
      askPlacePrompt: "जिस जगह का रास्ता जानना है, उसका नाम बोलें।",
      savePlaceNamePrompt: "सहेजने वाली जगह का नाम बोलें।",
      savePlaceNotePrompt: "इस जगह के रास्ते के निर्देश बोलें।",
      noPlaces: "अभी कोई जगह सेव नहीं है।",
      noPlaceMatch: "इसके लिए सेव किया हुआ रास्ता नहीं मिला",
      noDirections: "इस जगह के लिए कोई दिशा-निर्देश सेव नहीं हैं।",
      placeSaved: "जगह सेव हो गई",
      voiceUnsupported: "इस ब्राउज़र में आवाज़ से इनपुट उपलब्ध नहीं है।",
      voiceFailed: "मैं आपकी बात समझ नहीं पाया। कृपया फिर से बोलें।",
    },
  },
  ta: {
    labels: {
      chair: "கதிரை",
      person: "நபர்",
      bicycle: "மிதிவண்டி",
      car: "கார்",
      motorcycle: "மோட்டார் சைக்கிள்",
      bus: "பேருந்து",
      train: "ரயில்",
      truck: "சரக்கு வாகனம்",
      boat: "படகு",
      knife: "கத்தி",
      scissors: "கத்தரிக்கோல்",
      table: "மேசை",
      door: "கதவு",
      bottle: "பாட்டில்",
      laptop: "மடிக்கணினி",
      cell: "மொபைல்",
      traffic: "போக்குவரத்து விளக்கு",
      exit: "வெளியேறும் வழி",
      warning: "எச்சரிக்கை",
      close: "மிக அருகில்",
      large: "கேமரா காட்சியில் பெரிதாகத் தெரிகிறது",
      vehicle: "வாகனம்",
      sharp: "கூர்மையான பொருள்",
      detectedAt: "கண்டறியப்பட்டது",
      ahead: "நேரே முன்னால்",
      left: "இடது புறம்",
      right: "வலது புறம்",
      empty: "கேமரா காட்சியில் எந்தப் பொருளும் கண்டறியப்படவில்லை.",
      safe: "பாதுகாப்பானது",
      detected: "நான் பார்க்கிறேன்",
      noText: "எந்த உரையும் இல்லை. அருகில் செல்லவும்.",
      startCamera: "முதலில் கேமராவை தொடங்கவும்",
      cameraOn: "கேமரா இயக்கத்தில் உள்ளது. சுற்றுப்புற முறை.",
      cameraOff: "கேமரா நிறுத்தப்பட்டது",
      read: "படிக்கிறது",
      mode: "முறை",
      listening: "கேட்கிறது…",
      askPlacePrompt: "வழி கேட்க வேண்டிய சேமித்த இடத்தின் பெயரைச் சொல்லவும்.",
      savePlaceNamePrompt: "சேமிக்க வேண்டிய இடத்தின் பெயரைச் சொல்லவும்.",
      savePlaceNotePrompt: "இந்த இடத்திற்கான வழிமுறைகளைச் சொல்லவும்.",
      noPlaces: "சேமித்த இடங்கள் எதுவும் இல்லை.",
      noPlaceMatch: "இதற்கான சேமித்த வழிமுறை கிடைக்கவில்லை",
      noDirections: "இந்த இடத்திற்கான வழிமுறைகள் சேமிக்கப்படவில்லை.",
      placeSaved: "இடம் சேமிக்கப்பட்டது",
      voiceUnsupported: "இந்த உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.",
      voiceFailed: "உங்கள் குரலைப் புரிந்துகொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    },
  },
};

function getTranslatedText(label, language) {
  const normalized = String(label || "").trim().toLowerCase();
  const map = TEXT_MAP[language] || TEXT_MAP.en;
  return map.labels[normalized] || label;
}

function getLanguageConfig(language) {
  return LANGUAGE_OPTIONS.find((item) => item.id === language) || LANGUAGE_OPTIONS[0];
}

function normalizeSpokenText(value) {
  return String(value || "").toLocaleLowerCase().replace(/[.,!?;:।]/g, " ").replace(/\s+/g, " ").trim();
}

function getHorizontalDirection(prediction, frameWidth, language) {
  const centerX = prediction.bbox[0] + prediction.bbox[2] / 2;
  if (centerX < frameWidth / 3) return getTranslatedText("left", language);
  if (centerX > (2 * frameWidth) / 3) return getTranslatedText("right", language);
  return getTranslatedText("ahead", language);
}

const VEHICLE_CLASSES = new Set(["bicycle", "car", "motorcycle", "bus", "train", "truck", "boat"]);
const SHARP_OBJECT_CLASSES = new Set(["knife", "scissors"]);

// Speak text out loud with the browser's built-in voice
function speak(text, language = "en") {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = getLanguageConfig(language).lang;
  u.rate = 1;
  window.speechSynthesis.speak(u);
}

const MODES = [
  { id: "object", label: "Surroundings", key: "1", hint: "Names objects around you" },
  { id: "text", label: "Read text", key: "2", hint: "Reads signs and labels" },
  { id: "obstacle", label: "Obstacles", key: "3", hint: "Warns about close objects" },
];

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageInputRef = useRef(null);
  const modelRef = useRef(null);
  const lastSpoken = useRef({ text: "", at: 0 });
  const lastScene = useRef({ key: "", at: 0 });
  const emptyFrames = useRef(0);

  const [mode, setMode] = useState("object");
  const [language, setLanguage] = useState("en");
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Press Start camera or the Space key");
  const [live, setLive] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ object: 0, text: 0, obstacle: 0 });
  const [places, setPlaces] = useState([]);
  const [placeName, setPlaceName] = useState("");
  const [placeNote, setPlaceNote] = useState("");
  const [online, setOnline] = useState(true);
  const [isReadingText, setIsReadingText] = useState(false);
  const [isVoiceBusy, setIsVoiceBusy] = useState(false);
  const voiceBusyRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const [h, s, p] = await Promise.all([api.getDetections(), api.getStats(), api.getPlaces()]);
      setHistory(h); setStats(s); setPlaces(p); setOnline(true);
    } catch { setOnline(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (type, result, confidence = null) => {
    try { await api.addDetection({ type, result, confidence }); refresh(); } catch { setOnline(false); }
  };

  const announce = (text, type, conf) => {
    const now = Date.now();
    if (text === lastSpoken.current.text && now - lastSpoken.current.at < 5000) return;
    lastSpoken.current = { text, at: now };
    setLive(text);
    speak(text, language);
    save(type, text, conf);
  };

  const announceScene = (key, text, confidence, persist = true) => {
    const now = Date.now();
    if (key === lastScene.current.key && now - lastScene.current.at < 5000) return;
    if (now - lastScene.current.at < 2500) return;
    lastScene.current = { key, at: now };
    lastSpoken.current = { text, at: now };
    setLive(text);
    speak(text, language);
    if (persist) save("object", text, confidence);
  };

  const startCamera = async () => {
    try {
      setStatus("Starting camera…");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      if (!modelRef.current) {
        setStatus("Loading AI model…");
        modelRef.current = await cocoSsd.load();
      }
      setRunning(true);
      setStatus("Camera on");
      speak(getTranslatedText("cameraOn", language), language);
    } catch (e) {
      setStatus("Camera blocked: " + e.message);
      speak(getTranslatedText("startCamera", language), language);
    }
  };

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    setRunning(false);
    setStatus("Camera off");
    speak(getTranslatedText("cameraOff", language), language);
  };

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    speak(getTranslatedText("mode", nextLanguage), nextLanguage);
  };

  useEffect(() => {
    if (!running || mode === "text") return;
    let stop = false;
    const loop = async () => {
      const video = videoRef.current, canvas = canvasRef.current;
      if (stop || !video || !modelRef.current) return;
      const preds = await modelRef.current.detect(video);
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 4; ctx.font = "bold 20px Space Grotesk";
      preds.forEach((p) => {
        const [x, y, w, h] = p.bbox;
        ctx.strokeStyle = "#ffd60a"; ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = "#ffd60a"; ctx.fillRect(x, y - 28, ctx.measureText(p.class).width + 16, 28);
        ctx.fillStyle = "#0b0b0f"; ctx.fillText(p.class, x + 8, y - 8);
      });

      const good = preds.filter((p) => p.score > 0.6);
      if (mode === "object") {
        if (good.length) {
          emptyFrames.current = 0;
          const locations = [...new Map(good.map((p) => {
            const label = getTranslatedText(p.class, language);
            const direction = getHorizontalDirection(p, canvas.width, language);
            return [`${label}:${direction}`, { label, direction }];
          })).values()].slice(0, 3);
          const description = locations.map(({ label, direction }) => `${label} ${direction}`).join(", ");
          const sceneKey = locations.map(({ label, direction }) => `${label}:${direction}`).sort().join("|");
          announceScene(sceneKey, `${getTranslatedText("detected", language)} ${description}`, Math.round(good[0].score * 1000) / 10);
        } else {
          emptyFrames.current += 1;
          if (emptyFrames.current >= 3) {
            announceScene("empty", getTranslatedText("empty", language), null, false);
          }
        }
      }

      if (mode === "obstacle") {
        const area = canvas.width * canvas.height;
        const hazard = good.find((p) => SHARP_OBJECT_CLASSES.has(p.class))
          || good.find((p) => VEHICLE_CLASSES.has(p.class))
          || good.find((p) => p.class === "person")
          || good.find((p) => (p.bbox[2] * p.bbox[3]) / area > 0.3);
        if (hazard) {
          const side = getHorizontalDirection(hazard, canvas.width, language);
          const objectLabel = getTranslatedText(hazard.class, language);
          const isSharp = SHARP_OBJECT_CLASSES.has(hazard.class);
          const isVehicle = VEHICLE_CLASSES.has(hazard.class);
          const isPerson = hazard.class === "person";
          const alert = isSharp
            ? `${getTranslatedText("warning", language)}, ${getTranslatedText("sharp", language)} ${getTranslatedText("detectedAt", language)} ${side}`
            : isVehicle
              ? `${getTranslatedText("warning", language)}, ${objectLabel} ${getTranslatedText("detectedAt", language)} ${side}`
              : isPerson
                ? `${getTranslatedText("warning", language)}, ${objectLabel} ${getTranslatedText("detectedAt", language)} ${side}`
                : `${getTranslatedText("warning", language)}, ${objectLabel} ${getTranslatedText("large", language)} ${side}`;
          navigator.vibrate?.(300);
          announce(alert, "obstacle", Math.round(hazard.score * 1000) / 10);
        }
      }

      setTimeout(loop, 700);
    };
    loop();
    return () => { stop = true; };
  }, [running, mode, language]);

  const readText = async () => {
    if (!running) return speak(getTranslatedText("startCamera", language), language);
    const video = videoRef.current;
    const c = document.createElement("canvas");
    c.width = video.videoWidth; c.height = video.videoHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(video, 0, 0);
    setStatus("Reading text…");
    speak(getTranslatedText("read", language), language);
    const ocr = getLanguageConfig(language).ocr;
    const { data } = await Tesseract.recognize(c, ocr);
    const text = data.text.replace(/\s+/g, " ").trim();
    setStatus("Camera on");
    if (text.length < 2) return announce(getTranslatedText("noText", language), "text");
    announce(text, "text", Math.round(data.confidence * 10) / 10);
  };

  const readUploadedImage = async (event) => {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;
    if (!image.type.startsWith("image/")) {
      setLive("");
      setStatus("Please choose an image file");
      speak("Please choose an image file", language);
      return;
    }

    if (isReadingText) return;

    setIsReadingText(true);
    setLive("");
    try {
      setStatus("Reading uploaded image…");
      speak(getTranslatedText("read", language), language);
      const { data } = await Tesseract.recognize(image, getLanguageConfig(language).ocr);
      const text = data.text.replace(/\s+/g, " ").trim();
      setStatus("Image reading complete");
      if (text.length < 2) return announce(getTranslatedText("noText", language), "text");
      announce(text, "text", Math.round(data.confidence * 10) / 10);
    } catch {
      setLive("");
      setStatus("Could not read the uploaded image");
      speak("Could not read the uploaded image. Try a clearer photo.", language);
    } finally {
      setIsReadingText(false);
    }
  };

  const changeMode = (m) => {
    setMode(m);
    const info = MODES.find((x) => x.id === m);
    const voiceText = `${info.label} ${getTranslatedText("mode", language)}. ${info.hint}`;
    speak(voiceText, language);
    canvasRef.current?.getContext("2d").clearRect(0, 0, 9999, 9999);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.code === "Space") { e.preventDefault(); running ? stopCamera() : startCamera(); }
      if (e.key === "1") changeMode("object");
      if (e.key === "2") changeMode("text");
      if (e.key === "3") changeMode("obstacle");
      if (e.key === "Enter" && mode === "text") readText();
      if (e.key.toLowerCase() === "r") speak(live || getTranslatedText("safe", language), language);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, mode, language, live]);

  const addPlace = async (e) => {
    e.preventDefault();
    if (!placeName.trim()) return;
    await api.addPlace({ name: placeName, note: placeNote });
    speak(`Saved ${placeName}`, language);
    setPlaceName(""); setPlaceNote(""); refresh();
  };

  const listenOnce = (prompt) => new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject(new Error("unsupported"));
      return;
    }

    const recognition = new SpeechRecognition();
    const voiceLanguage = getLanguageConfig(language).lang;
    let transcript = "";
    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      transcript = event.results?.[0]?.[0]?.transcript || "";
    };
    recognition.onerror = () => reject(new Error("recognition-failed"));
    recognition.onend = () => transcript.trim() ? resolve(transcript.trim()) : reject(new Error("no-speech"));

    const promptUtterance = new SpeechSynthesisUtterance(prompt);
    promptUtterance.lang = voiceLanguage;
    promptUtterance.onend = () => {
      try { recognition.start(); } catch { reject(new Error("recognition-failed")); }
    };
    promptUtterance.onerror = () => {
      try { recognition.start(); } catch { reject(new Error("recognition-failed")); }
    };
    setStatus(getTranslatedText("listening", language));
    setLive("");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(promptUtterance);
  });

  const runVoicePlaceAction = async (action) => {
    if (voiceBusyRef.current) return;
    voiceBusyRef.current = true;
    setIsVoiceBusy(true);
    try {
      if (action === "ask") {
        if (!places.length) {
          const message = getTranslatedText("noPlaces", language);
          setStatus(message);
          setLive(message);
          speak(message, language);
          return;
        }

        const query = normalizeSpokenText(await listenOnce(getTranslatedText("askPlacePrompt", language)));
        const paddedQuery = ` ${query} `;
        const place = [...places]
          .sort((a, b) => b.name.length - a.name.length)
          .find((item) => paddedQuery.includes(` ${normalizeSpokenText(item.name)} `));
        const message = place
          ? `${place.name}. ${place.note || getTranslatedText("noDirections", language)}`
          : `${getTranslatedText("noPlaceMatch", language)} ${query}.`;
        setStatus(message);
        setLive(message);
        speak(message, language);
        return;
      }

      const name = (await listenOnce(getTranslatedText("savePlaceNamePrompt", language))).trim();
      const note = (await listenOnce(getTranslatedText("savePlaceNotePrompt", language))).trim();
      await api.addPlace({ name, note });
      const message = `${getTranslatedText("placeSaved", language)}: ${name}.`;
      setStatus(message);
      setLive(message);
      speak(message, language);
      refresh();
    } catch (error) {
      const message = error.message === "unsupported"
        ? getTranslatedText("voiceUnsupported", language)
        : getTranslatedText("voiceFailed", language);
      setStatus(message);
      setLive(message);
      speak(message, language);
    } finally {
      voiceBusyRef.current = false;
      setIsVoiceBusy(false);
    }
  };

  return (
    <div className="app">
      <header className="top">
        <div className="brand"><span className="eye" aria-hidden>◉</span> VisionMate</div>
        <div className="toolbar">
          <label className="language-picker" htmlFor="language">
            <span>Language</span>
            <select id="language" value={language} onChange={(e) => changeLanguage(e.target.value)}>
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <span className={`pill ${online ? "ok" : "bad"}`}>{online ? "Backend connected" : "Backend offline – start the server"}</span>
        </div>
      </header>

      <section className="hero">
        <h1>AI eyes that <em>speak</em>.</h1>
        <p>Point your camera. VisionMate names objects, reads signs out loud and warns you about obstacles.</p>
      </section>

      <main className="grid">
        <section className="panel camera" aria-label="Camera">
          <div className="stage">
            <video ref={videoRef} playsInline muted />
            <canvas ref={canvasRef} />
            {!running && <div className="placeholder">Camera is off</div>}
          </div>
          <div className="live" role="status" aria-live="assertive">{live || status}</div>
          <div className="modes" role="radiogroup" aria-label="Mode">
            {MODES.map((m) => (
              <button key={m.id} role="radio" aria-checked={mode === m.id}
                className={mode === m.id ? "mode active" : "mode"} onClick={() => changeMode(m.id)}>
                <span className="k">{m.key}</span>{m.label}
              </button>
            ))}
          </div>
          <div className="actions">
            <button className="big primary" onClick={running ? stopCamera : startCamera}>
              {running ? "Stop camera" : "Start camera"} <kbd>Space</kbd>
            </button>
            {mode === "text" && (
              <button className="big" onClick={readText}>Read now <kbd>Enter</kbd></button>
            )}
            <button className="big" disabled={isReadingText} onClick={() => imageInputRef.current?.click()}>
              {isReadingText ? "Reading image…" : "Upload text image"}
            </button>
            <input ref={imageInputRef} className="file-input" type="file" accept="image/*" aria-hidden="true" onChange={readUploadedImage} tabIndex={-1} />
            <button className="big ghost" onClick={() => speak(live || getTranslatedText("safe", language), language)}>Repeat <kbd>R</kbd></button>
          </div>
        </section>

        <aside className="side">
          <section className="panel">
            <h2>Today at a glance</h2>
            <div className="stats">
              <div><b>{stats.object}</b><span>Objects</span></div>
              <div><b>{stats.text}</b><span>Texts read</span></div>
              <div><b>{stats.obstacle}</b><span>Warnings</span></div>
            </div>
          </section>

          <section className="panel">
            <h2>Saved places</h2>
            <div className="place-voice-actions">
              <button type="button" className="voice-action" disabled={isVoiceBusy} onClick={() => runVoicePlaceAction("ask")}>
                Ask directions by voice
              </button>
              <button type="button" className="voice-action" disabled={isVoiceBusy} onClick={() => runVoicePlaceAction("save")}>
                {isVoiceBusy ? "Listening…" : "Add place by voice"}
              </button>
            </div>
            <form onSubmit={addPlace} className="form">
              <input aria-label="Place name" placeholder="e.g. Washroom" value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
              <input aria-label="Directions" placeholder="Directions" value={placeNote} onChange={(e) => setPlaceNote(e.target.value)} />
              <button className="primary">Save</button>
            </form>
            <ul className="list">
              {places.map((p) => (
                <li key={p.id}>
                  <button className="link" onClick={() => speak(`${p.name}. ${p.note}`, language)}><b>{p.name}</b><span>{p.note}</span></button>
                  <button className="x" aria-label={`Delete ${p.name}`} onClick={async () => { await api.deletePlace(p.id); refresh(); }}>×</button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>History</h2>
            <ul className="list">
              {history.map((h) => (
                <li key={h.id}>
                  <button className="link" onClick={() => speak(h.result, language)}>
                    <span className={`tag ${h.type}`}>{h.type}</span><b>{h.result}</b>
                    <span>{new Date(h.created_at).toLocaleTimeString()}{h.confidence ? ` · ${h.confidence}%` : ""}</span>
                  </button>
                  <button className="x" aria-label="Delete" onClick={async () => { await api.deleteDetection(h.id); refresh(); }}>×</button>
                </li>
              ))}
              {!history.length && <li className="empty">Nothing yet</li>}
            </ul>
          </section>
        </aside>
      </main>

      <footer>Shortcuts: Space camera · 1 2 3 modes · Enter read · R repeat. Works best in Chrome.</footer>
    </div>
  );
}
