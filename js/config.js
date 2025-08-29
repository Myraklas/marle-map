window.MARLE_CONFIG = {
  image: {
    name: "Marle-Map.jpg", // EXAKT wie im Repo
    width: 14400,
    height: 12501,
  },
  zoom: {
    minExtra: -6,   // wie weit zusätzlich raus
    maxExtra: +6,   // wie weit zusätzlich rein
    startOffset: -4  // Start relativ zu fitBounds: +1 näher, -1 weiter weg
  },
  data: {
    nationsUrl: "nations.geojson?v=1" // optional; wird geladen, wenn vorhanden
  }
};
