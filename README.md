# VisionMate – AI eyes for the visually impaired

React frontend + Node/Express backend + MySQL database.
- **Surroundings**: names objects via the camera (TensorFlow.js COCO-SSD) and speaks them.
- **Read text**: reads signs/labels out loud (Tesseract.js OCR).
- **Obstacles**: warns + vibrates when something is very close, and says left/right/ahead.
- **Saved places** (e.g. Washroom directions) and **history**, stored in MySQL.
- Fully keyboard-driven: Space, 1/2/3, Enter, R.

## Run it in VS Code
Install first: Node.js, XAMPP (MySQL + phpMyAdmin).

1. **Database**: start MySQL in XAMPP → open http://localhost/phpmyadmin → SQL tab → paste `database/schema.sql` → Go.
2. **Backend** (terminal 1):
   ```
   cd backend
   npm install
   npm run dev
   ```
   Edit `backend/.env` if your MySQL password is not empty. Check http://localhost:5000/api/detections
3. **Frontend** (terminal 2):
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:5173 in Chrome and allow the camera.

## API
| Method | URL | Body |
|---|---|---|
| GET | /api/detections | – |
| POST | /api/detections | {type: object/text/obstacle, result, confidence} |
| DELETE | /api/detections/:id | – |
| GET | /api/stats | – |
| GET | /api/places | – |
| POST | /api/places | {name, note} |
| DELETE | /api/places/:id | – |

## Limitations (tell the judges)
Recognises 80 common objects; OCR works best with clear, well-lit text; distance is estimated from object size, not a real depth sensor.
