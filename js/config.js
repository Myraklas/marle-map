window.MARLE_CONFIG = {
  image: {
    name: "assets/Marle-Map.jpg", // Pfad relativ zu index.html
    width: 14400,
    height: 12501,
  },
  zoom: {
    minExtra: -6,
    maxExtra: +6,
    startOffset: -4 // so belassen, passt so sehr gut
  },
  data: {
    nationsUrl: "data/nations.geojson?v=1"
  }
};
