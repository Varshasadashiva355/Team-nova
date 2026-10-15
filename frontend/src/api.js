// The ONE place the backend address lives. Change it when you deploy.
const BASE_URL = "http://localhost:5000/api";

async function req(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

export const api = {
  getDetections: () => req("/detections"),
  addDetection: (d) => req("/detections", { method: "POST", body: JSON.stringify(d) }),
  deleteDetection: (id) => req(`/detections/${id}`, { method: "DELETE" }),
  getStats: () => req("/stats"),
  getPlaces: () => req("/places"),
  addPlace: (p) => req("/places", { method: "POST", body: JSON.stringify(p) }),
  deletePlace: (id) => req(`/places/${id}`, { method: "DELETE" }),
};
