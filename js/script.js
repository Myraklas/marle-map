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

// --- Nationen laden (unsichtbar, aber klickbar) ---
fetch(CFG.data.nationsUrl)
  .then(r => r.ok ? r.json() : null)
  .then(data => {
    if (!data) return;

    // Sidebar-Helper
    const sidebar = document.getElementById('sidebar');
    const sidebarContent = document.getElementById('sidebarContent');
    const sidebarClose = document.getElementById('sidebarClose');
    function buildObsidianUrl(vault, file) {
      if (!file) return null;
      const v = vault ? `vault=${encodeURIComponent(vault)}&` : '';
      return `obsidian://open?${v}file=${encodeURIComponent(file)}`;
    }
    function openSidebar(props) {
      const name = props?.name ?? 'Unbenannte Nation';
      const descLong = props?.long ?? props?.desc ?? '';
      const meta = props?.meta ?? '';
      const url = props?.url || buildObsidianUrl(props?.vault, props?.obsidian);
      sidebarContent.innerHTML = `
        <h2>${name}</h2>
        ${meta ? `<div class="meta">${meta}</div>` : ''}
        ${descLong ? `<div class="long">${descLong}</div>` : '<p><i>Keine längere Beschreibung gespeichert.</i></p>'}
        ${url ? `<p style="margin-top:10px"><a class="btn" href="${url}">↗ Öffnen</a></p>` : ''}
      `;
      sidebar.classList.remove('hidden');
      sidebar.classList.add('open');
    }
    sidebarClose?.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebar.classList.add('hidden');
    });

    L.geoJSON(data, {
      // Unsichtbar, aber klickbar
      style: () => ({
        stroke: false,
        fillColor: "#000",
        fillOpacity: 0.001, // unsichtbar, aber ordentliche Hitbox
        interactive: true
      }),
      onEachFeature: (f, layer) => {
        const p = f?.properties ?? {};
        // Popup: Name + Kurzbeschreibung + Buttons
        const name = p.name ?? 'Nation';
        const short = p.desc ?? '';
        const url = p.url || buildObsidianUrl(p.vault, p.obsidian);
        const popupHtml = `
          <h3 style="margin:0">${name}</h3>
          ${short ? `<p style="margin:.35rem 0 0">${short}</p>` : ''}
          <div class="popup-actions">
            <button type="button" data-action="more">Mehr&nbsp;anzeigen</button>
            ${url ? `<a href="${url}" target="_blank" rel="noopener">↗ Öffnen</a>` : ''}
          </div>
        `;
        layer.bindPopup(popupHtml);

        // Klick auf Fläche: Sidebar öffnen
        layer.on('click', () => openSidebar(p));

        // Klicks aus dem Popup abfangen (für den "Mehr"-Button)
        layer.on('popupopen', (e) => {
          const btn = e.popup.getElement().querySelector('button[data-action="more"]');
          if (btn) btn.addEventListener('click', () => openSidebar(p));
        });
      }
    }).addTo(map);
  })
  .catch(() => {});

});
