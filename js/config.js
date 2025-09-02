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
    startOffset: -3 // so belassen, so ist sehr gut
  },
  places: {
    // Ab welcher Zoomstufe Orte angezeigt werden (relativ zu fitBounds-Zoom)
    minExtra: -2.5
  },
  data: {
    // Pfad ins data/-Verzeichnis
    nationsUrl: "data/nations/index.json?v=1"
  }
};
