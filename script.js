document.addEventListener("DOMContentLoaded", () => {
  console.log("Geoman build geladen");

  // --- Grundsetup: Bild-Overlay im Pixel-Koordinatensystem ---
  const map = L.map("map", {
    crs: L.CRS.Simple,
    zoomControl: true,
    zoomSnap: 0.25,
    wheelPxPerZoomLevel: 120
  });

  // Bildgröße (px) und Dateiname DEINER Karte
  const imageWidth = 14400;
  const imageHeight = 12501;
  const imgName = "Marle-Map.jpg"; // Groß/Klein MUSS exakt stimmen

  const bounds = [[0, 0], [imageHeight, imageWidth]];
  L.imageOverlay(imgName, bounds).addTo(map);

  // Auf Bild zoomen, dann Start-/Grenz-Zoom setzen
  map.fitBounds(bounds);
  const fitZoom = map.getZoom();
  map.setMinZoom(fitZoom - 6);
  map.setMaxZoom(fitZoom + 6);
  map.setZoom(fitZoom - 4);

  // --- Geoman aktivieren & konfigurieren ---
  map.pm.addControls({
    position: 'topleft',
    drawMarker: false,
    drawCircleMarker: false,
    drawCircle: false,
    drawText: false,
    drawPolyline: false,   // wir zeichnen Flächen (Polygone)
    drawRectangle: false,
    drawPolygon: true,
    editMode: true,
    dragMode: true,
    cutPolygon: false,
    removalMode: true
  });

  // Standardstil für neu gezeichnete Flächen
  map.pm.setPathOptions({
    color: '#cc3333',
    fillColor: '#cc3333',
    fillOpacity: 0.25,
    weight: 2
  });

  // Beim Erstellen direkt ein Popup setzen (später durch echte Nationendaten ersetzen)
  map.on('pm:create', (e) => {
    const layer = e.layer;
    layer.bindPopup('<h3>Neue Nation</h3><p>Kurzbeschreibung …</p>');
  });

  // --- GeoJSON Laden (falls vorhanden) ---
  // Lege eine Datei 'nations.geojson' neben index.html/Script.
  fetch('nations.geojson?v=1')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;
      L.geoJSON(data, {
        style: () => ({
          color: '#cc3333',
          fillColor: '#cc3333',
          fillOpacity: 0.25,
          weight: 2
        }),
        onEachFeature: (feature, layer) => {
          // Popup aus gespeicherten properties wiederherstellen
          if (feature.properties?.popup) {
            layer.bindPopup(feature.properties.popup);
          } else if (feature.properties?.name || feature.properties?.desc) {
            layer.bindPopup(
              `<h3>${feature.properties.name ?? 'Nation'}</h3><p>${feature.properties.desc ?? ''}</p>`
            );
          }
        }
      }).addTo(map);
    })
    .catch(() => {});

  // --- Export-Button: alle Polygone als GeoJSON herunterladen ---
  function downloadGeoJSON() {
    const features = [];
    map.eachLayer((layer) => {
      // Nur echte Polygone (keine Raster/Marker etc.)
      if (layer instanceof L.Polygon && !(layer instanceof L.Rectangle)) {
        const gj = layer.toGeoJSON(); // Koords bleiben im Pixelraum (CRS.Simple)
        // Popup-Inhalt mitspeichern (optional)
        if (layer.getPopup()) {
          gj.properties = gj.properties || {};
          gj.properties.popup = layer.getPopup().getContent();
        }
        features.push(gj);
      }
    });
    const fc = { type: 'FeatureCollection', features };
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nations.geojson';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Kleiner UI-Button oben links
  const saveBtn = L.control({ position: 'topleft' });
  saveBtn.onAdd = function() {
    const btn = L.DomUtil.create('button', 'pm-button');
    btn.textContent = 'Speichern (GeoJSON)';
    btn.title = 'Alle Flächen als nations.geojson herunterladen';
    btn.onclick = (e) => { e.preventDefault(); downloadGeoJSON(); };
    return btn;
  };
  saveBtn.addTo(map);
});
