const targets = [
  'http://localhost:5000/api/health',
  'http://localhost:5000/api/detections',
  'http://localhost:5000/api/stats',
  'http://localhost:5000/api/places',
];

(async () => {
  for (const url of targets) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log(url, res.status, text);
    } catch (err) {
      console.log(url, 'ERROR', err.message);
    }
  }
})();
