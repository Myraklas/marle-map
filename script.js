document.addEventListener("DOMContentLoaded", () => {
  console.log("clean build geladen");

  // --- Grundsetup: Bild-Overlay im Pixel-Koordinatensystem ---
  const map = L.map("map", {
    crs: L.CRS.Simple,
    zoomControl: true,
    zoomSnap: 0.25,
    wheelPxPerZoomLevel: 120
  });

  // >>> DEIN Bild
  const imageWidth = 14400;
  const imageHeight = 12501;
  const imgName = "Marle-Map.jpg"; // exakt wie im Repo

  const bounds = [[0, 0], [imageHeight, imageWidth]];
  L.imageOverlay(imgName, bounds).addTo(map);

  // Start-Zoom: erst passend, dann leicht näher ran
  map.fitBounds(bounds);
  const fitZoom = map.getZoom();
  map.setMinZoom(fitZoom - 6);
  map.setMaxZoom(fitZoom + 6);
  map.setZoom(fitZoom + 1); // +1 oder +2, wie du willst

  // --- Länder aus GeoJSON laden (optional) ---
  // Lege 'nations.geojson' neben index.html, sobald vorhanden wird es geladen.
  fetch('nations.geojson?v=1')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;

      L.geoJSON(data, {
        // Unsichtbar, aber klickbar:
        style: () => ({
          stroke: false,       // keine Linien
          fillOpacity: 0.001   // praktisch unsichtbar, sorgt für stabile Klick-Hitbox
        }),
        onEachFeature: (feature, layer) => {
          // Popups bevorzugt aus properties; fallback auf gespeicherten Popup-HTML
          let html = '';
          if (feature.properties?.popup) {
            html = feature.properties.popup;
          } else {
            const name = feature.properties?.name ?? 'Nation';
            const desc = feature.properties?.desc ?? '';
            html = `<h3>${name}</h3>${desc ? `<p>${desc}</p>` : ''}`;
          }
          if (html) layer.bindPopup(html);

          // Optional: Fokus-Effekt nur beim Öffnen (ohne sichtbare Grenzen)
          layer.on('popupopen', () => {
            // nichts zeichnen – bleibt unsichtbar
          });
        }
      }).addTo(map);
    })
    .catch(() => {
      // still – Datei ist optional
    });

  // --- Beispielmarker raus, falls du ihn noch drin hattest ---
  // (kein Marker nötig)
});
