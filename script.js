document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js geladen – zoom fix");

  // Leaflet im einfachen Pixel-Koordinatensystem
  const map = L.map("map", {
    crs: L.CRS.Simple,
    zoomControl: true,
    zoomSnap: 0.25,
    wheelPxPerZoomLevel: 120
  });

  // Finale Bildgröße in Pixeln (DEINS)
  const imageWidth = 14400;
  const imageHeight = 12501;

  // Bild-Bounds im Pixelraum
  const bounds = [[0, 0], [imageHeight, imageWidth]];

  // WICHTIG: Dateiname exakt wie im Repo (Groß-/Kleinschreibung!)
  const image = L.imageOverlay("Marle-Map.jpg", bounds).addTo(map);

  // Auf das volle Bild zoomen
  map.fitBounds(bounds);

  // Jetzt erst Zoom-Grenzen und Startzoom setzen
  map.setMinZoom(-6);   // sehr weit raus; bei Bedarf -12/-14 versuchen
  map.setMaxZoom(6);     // ordentlich rein
  map.setZoom (-4)

  // Beispielmarker (löschen/ersetzen)
  L.marker([imageHeight * 0.5, imageWidth * 0.5]).addTo(map)
    .bindPopup("Mitte der Karte");
});
