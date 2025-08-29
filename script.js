document.addEventListener("DOMContentLoaded", () => {
  // Leaflet im einfachen Pixel-Koordinatensystem
  const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -2,      // erlaubt weit rauszoomen
    zoomSnap: 0.25,   // feinere Zoomschritte
    wheelPxPerZoomLevel: 120
  });

  // <-- HIER deine finale Bildgröße eintragen (in Pixeln)
  const imageWidth = 6000;  // z.B. 6000
  const imageHeight = 4000; // z.B. 4000

  // Bild-Bounds [ [minY,minX], [maxY,maxX] ] im Pixelraum
  const bounds = [[0, 0], [imageHeight, imageWidth]];

  // <-- HIER den Dateinamen deines Bildes anpassen
  const image = L.imageOverlay("marle-map.png", bounds).addTo(map);

  // Auf volle Karte zoomen
  map.fitBounds(bounds);

  // Beispielmarker – später löschen/ersetzen
  L.marker([imageHeight * 0.38, imageWidth * 0.5]).addTo(map)
    .bindPopup("Valmorra (Beispiel)")
    .openPopup();

  // Optional: Rechteck-Zoom per Shift+Drag aktivieren (ist in Leaflet Standard)
  // Optional: Doppelklick zum Zoomen deaktivieren, wenn es nervt:
  // map.doubleClickZoom.disable();
});
