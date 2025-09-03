window.MARLE_CONFIG = {
  // Einstellungen für das Kartenbild
  image: {
    // Dateipfad zum Kartenbild
    name: "assets/Marle-Map.jpg",
    // Bildbreite in Pixeln
    width: 14400,
    // Bildhöhe in Pixeln
    height: 12501,
  },
  // Einstellungen zum Zoomverhalten
  zoom: {
    // Wie weit zusätzlich herausgezoomt werden kann
    minExtra: -6,
    // Wie weit zusätzlich hineingezoomt werden kann
    maxExtra: +6,
    // Startversatz des Zoomfaktors
    startOffset: -3
  },
  // Einstellungen für die Anzeige von Orten
  places: {
    // Ab welcher Zoomstufe Orte angezeigt werden (relativ zu fitBounds-Zoom)
    minExtra: -2.5
  },
  // Verweise auf Datenquellen
  data: {
    // Pfad zur Nations-JSON-Datei
    nationsUrl: "data/nations/index.json?v=1"
  }
};
