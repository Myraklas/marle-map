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

  //Nationen unsichtbar aber klickbar
// ---- NATIONEN LADEN (index.json oder einzelnes GeoJSON) ----
const nationsLayer = L.geoJSON([], {
  style: () => ({ stroke: false, fillOpacity: 0.0001, interactive: true }),
  onEachFeature: (f, layer) => {
    const p = f?.properties ?? {};
    const name = p.name ?? 'Nation';
    const short = p.desc ?? '';
    const popupHtml = `
      <h3 style="margin:0">${name}</h3>
      ${short ? `<p style="margin:.35rem 0 0">${short}</p>` : ''}
      <div class="popup-actions">
        <button type="button" data-action="more">Mehr&nbsp;anzeigen</button>
      </div>
    `;
    layer.bindPopup(popupHtml);

    // Klick direkt auf Fläche öffnet Sidebar
    layer.on('click', () => openSidebar(p));

    // Bei Hover nach vorne, damit Klick eindeutig ist
    layer.on('mouseover', () => layer.bringToFront());

    // Klick aus Popup (Mehr anzeigen)
    layer.on('popupopen', (e) => {
      const btn = e.popup.getElement().querySelector('button[data-action="more"]');
      if (btn) btn.addEventListener('click', () => openSidebar(p));
    });
  }
}).addTo(map);

// Sidebar-Referenzen nur einmal holen
const sidebar = document.getElementById('sidebar');
const sidebarContent = document.getElementById('sidebarContent');
const sidebarClose = document.getElementById('sidebarClose');

function openSidebar(props) {
  const name = props?.name ?? 'Unbenannte Nation';
  const descLong = props?.long ?? props?.desc ?? '';
  sidebarContent.innerHTML = `
    <h2>${name}</h2>
    ${descLong ? `<div class="long">${descLong}</div>` : '<p><i>Keine längere Beschreibung gespeichert.</i></p>'}
  `;
  sidebar.classList.remove('hidden');
  sidebar.classList.add('open');
}
sidebarClose?.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebar.classList.add('hidden');
});

// Helper: lädt eine Datei (GeoJSON)
const loadOne = (url) => fetch(url + '?v=' + Date.now()).then(r => r.json());

// Haupt-Ladefunktion: erkennt automatisch, ob index.json (mit "files") oder direktes GeoJSON
loadOne(CFG.data.nationsUrl)
  .then(first => {
    if (first && Array.isArray(first.files)) {
      // index.json -> mehrere Dateien laden
      return Promise.all(
        first.files.map(u => loadOne(u))
      ).then(list => list.filter(Boolean));
    } else {
      // direktes FeatureCollection
      return [first];
    }
  })
  .then(geoList => {
    geoList.forEach(g => nationsLayer.addData(g));
    console.log('Nationen geladen (Layer):', nationsLayer.getLayers().length);
  })
  .catch(err => console.warn('Nationen-Load-Fehler', err));


   /* Wichtige Orte in eigener Leiste */
  const placesData = [
    {
      name: 'Hauptstadt',
      short: 'Zentrum der Nation',
      long: 'Ausführliche Beschreibung der Hauptstadt.'
    },
    {
      name: 'Nordhafen',
      short: 'Wichtiger Handelshafen',
      long: 'Mehr Details zum Nordhafen.'
    },
    {
      name: 'Mystischer Wald',
      short: 'Gefährliches Gebiet',
      long: 'Beschreibung des mystischen Waldes.'
    }
  ];

  const placesContainer = document.getElementById('placesContainer');
  const placeList = document.getElementById('placeList');
  const placeDetail = document.getElementById('placeDetail');

  if (placesContainer && placeList && placeDetail) {
    placesContainer.addEventListener('click', ev => ev.stopPropagation());

    placesData.forEach(p => {
      const item = document.createElement('div');
      item.className = 'place-item';
      item.textContent = p.name;
      item.title = p.short;
      item.addEventListener('click', ev => {
        ev.stopPropagation();
        placeDetail.innerHTML = `<h4>${p.name}</h4><p>${p.long}</p>`;
        placesContainer.classList.add('open');
      });
      placeList.appendChild(item);
    });

    document.addEventListener('click', () => {
      placesContainer.classList.remove('open');
    });
  }

});
