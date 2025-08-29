// Initialisiere eine Leaflet-Karte (OpenStreetMap Tiles, kein API-Key nötig)
document.addEventListener("DOMContentLoaded", () => {
  // Mittelpunkt ungefähr Europa – ändere später zu deiner Weltposition
  const start = [51.1657, 10.4515]; // Deutschland Mitte

  const map = L.map("map", {
    zoomControl: true,
    attributionControl: true,
  }).setView(start, 5);

  // OpenStreetMap Tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
  }).addTo(map);

  // Beispiel-Marker (kannst du später löschen/ersetzen)
  L.marker(start).addTo(map).bindPopup("Startpunkt – ersetze mich durch Marle!").openPopup();
});
