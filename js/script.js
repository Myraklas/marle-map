/**
 * Hauptskript für die Kartenanwendung: lädt Hintergrundbild,
 * Nationen und Orte und steuert deren Darstellung.
 */
document.addEventListener("DOMContentLoaded", () => {
  const CFG = window.MARLE_CONFIG;
  // Karte im einfachen CRS-Modus anlegen
  const map = L.map("map", { crs: L.CRS.Simple, zoomSnap: 0.25, wheelPxPerZoomLevel: 120 });
  // Layer für Marker von Orten vorbereiten
  const placesLayer = L.layerGroup();

  const { width: W, height: H, name: IMG } = CFG.image;
  const bounds = [[0,0],[H,W]];
  L.imageOverlay(IMG, bounds).addTo(map);

  // Basis-View + Grenzen
  map.fitBounds(bounds);
  const fitZoom = map.getZoom();
  const placesMinZoom = fitZoom + (CFG.places?.minExtra ?? 0);
  map.setMinZoom(fitZoom + (CFG.zoom.minExtra ?? -6));
  map.setMaxZoom(fitZoom + (CFG.zoom.maxExtra ?? +6));

  function updatePlacesVisibility() {
    const show = map.getZoom() >= placesMinZoom;
    if (show && !map.hasLayer(placesLayer)) {
      map.addLayer(placesLayer);
    } else if (!show && map.hasLayer(placesLayer)) {
      map.removeLayer(placesLayer);
    }
  }
  map.on('zoomend', updatePlacesVisibility);

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
const sidebar = document.getElementById('sidebar'); // rechte Sidebar
const sidebarContent = document.getElementById('sidebarContent');
const sidebarClose = document.getElementById('sidebarClose');
const placesSidebar = document.getElementById('placesSidebar'); // linke Sidebar
const placeList = document.getElementById('placeList');
const placesClose = document.getElementById('placesClose');
const placePopup = document.getElementById('placePopup');

placesSidebar?.addEventListener('click', ev => ev.stopPropagation());
placePopup?.addEventListener('click', ev => ev.stopPropagation());
document.addEventListener('click', () => {
  placePopup?.classList.add('hidden');
});

function openSidebar(props) {
  const name = props?.name ?? 'Unbenannte Nation';
  const descLong = props?.long ?? props?.desc ?? '';
  const places = Array.isArray(props?.places) ? props.places : [];
  const icon = props?.icon ?? '';
  const image = props?.image ?? '';

  sidebarContent.innerHTML = `
    <div class="nation-header">
      <h2>${name}</h2>
      ${icon ? `<img class="nation-icon" src="${icon}" alt="Wappen von ${name}">` : ''}
    </div>
    ${image ? `<img class="nation-image" src="${image}" alt="Landschaft von ${name}">` : ''}
    ${descLong ? `<div class="long">${descLong}</div>` : '<p><i>Keine längere Beschreibung gespeichert.</i></p>'}
  `;

  placePopup?.classList.add('hidden');

  if (placesSidebar && placeList) {
    placeList.innerHTML = '';

    if (places.length) {
      placesSidebar.classList.remove('hidden');
      placesSidebar.classList.add('open');
    } else {
      placesSidebar.classList.remove('open');
      placesSidebar.classList.add('hidden');
    }

    places.forEach(p => {
      const item = document.createElement('div');
      item.className = 'place-item';

      const nameDiv = document.createElement('div');
      nameDiv.className = 'place-name';
      nameDiv.textContent = p.name;
      item.appendChild(nameDiv);

      if (p.short) {
        const descDiv = document.createElement('div');
        descDiv.className = 'place-desc';
        descDiv.textContent = p.short;
        item.appendChild(descDiv);
      }

      nameDiv.addEventListener('click', ev => {
        ev.stopPropagation();
        item.classList.toggle('open');
        placePopup?.classList.add('hidden');

        const marker = p.__marker;
        if (marker) {
          const targetZoom = Math.max(map.getZoom(), placesMinZoom);
          map.once('moveend', () => marker.openPopup());
          map.setView(marker.getLatLng(), targetZoom);
        }
      });

      placeList.appendChild(item);
    });
  }

  sidebar.classList.remove('hidden');
  sidebar.classList.add('open');
}
sidebarClose?.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebar.classList.add('hidden');
  placesSidebar?.classList.remove('open');
  placesSidebar?.classList.add('hidden');
  placePopup?.classList.add('hidden');
});

placesClose?.addEventListener('click', () => {
  placesSidebar?.classList.remove('open');
  placesSidebar?.classList.add('hidden');
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
    geoList.forEach(g => {
      g.features?.forEach(f => {
        const places = Array.isArray(f.properties?.places) ? f.properties.places : [];
        places.forEach(p => {
          if (Array.isArray(p.coords)) {
            const [x, y] = p.coords;
            const icon = p.icon ? L.icon({ iconUrl: p.icon, iconSize: [24,24], iconAnchor: [12,24] }) : undefined;
            const marker = L.marker([y, x], icon ? { icon } : {});
            const popupHtml = `<strong>${p.name ?? ''}</strong>${p.short ? `<br/>${p.short}` : ''}`;
            marker.bindPopup(popupHtml);
            marker.addTo(placesLayer);
            p.__marker = marker;
          }
        });
      });
      nationsLayer.addData(g);
    });
    updatePlacesVisibility();
    console.log('Nationen geladen (Layer):', nationsLayer.getLayers().length);
  })
  .catch(err => console.warn('Nationen-Load-Fehler', err));

});
