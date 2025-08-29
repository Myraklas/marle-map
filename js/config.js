window.MARLE_CONFIG = {
  image: {
    // Pfad ins assets/-Verzeichnis
    name: "assets/Marle-Map.jpg",
    width: 14400,
    height: 12501,
  },
  zoom: {
    minExtra: -6,    // wie weit zusätzlich raus
    maxExtra: +6,    // wie weit zusätzlich rein
    startOffset: -4  // so belassen, so ist sehr gut 
  },
  data: {
    // Pfad ins data/-Verzeichnis
    nationsUrl: "data/nations.geojson?v=1"
  }
};
