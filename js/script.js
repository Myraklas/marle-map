document.addEventListener("DOMContentLoaded", () => {
  const CFG = window.MARLE_CONFIG;
  const map = L.map("map", { crs: L.CRS.Simple, zoomSnap: 0.25, wheelPxPerZoomLevel: 120 });

  const { width: W, height: H, name: IMG } = CFG.image;
  const bounds = [[0,0],[H,W]];
  L.imageOverlay(IMG, bounds).addTo(map);

  // Basis-View + Grenzen
  map.fitBounds(bounds);
  const fitZoom = map.getZoom();
  map.setMinZoom(fitZoom + (CFG.zoom.minExtra ?? -6));
  map.setMaxZoom(fitZoom + (CFG.zoom.maxExtra ?? +6));

  // URL-Parameter: ?z=<fix> oder ?offset=<relativ>
  const params = new URLSearchParams(location.search);
  const zFixed = params.get("z");
  const zOffset = params.get("offset");

  if (zFixed !== null) {
    map.setZoom(Number(zFixed));
  } else if (zOffset !== null) {
    map.setZoom(fitZoom + Number(zOffset));
  } else {
    map.setZoom(fitZoom + (CFG.zoom.startOffset ?? 0));
  }

  // Nationen laden (unsichtbar, aber klickbar)
  fetch(CFG.data.nationsUrl)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;
      L.geoJSON(data, {
        style: () => ({
          stroke: false,
          fillColor: "#000",
          fillOpacity: 0.001, // praktisch unsichtbar, hält die Klick-Hitbox
          interactive: true
        }),
        onEachFeature: (f, layer) => {
          let html = f?.properties?.popup;
          if (!html) {
            const name = f?.properties?.name ?? "Nation";
            const desc = f?.properties?.desc ?? "";
            html = `<h3>${name}</h3>${desc ? `<p>${desc}</p>` : ""}`;
          }
          layer.bindPopup(html);
        }
      }).addTo(map);
    })
    .catch(() => {});
});
