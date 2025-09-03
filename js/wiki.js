
(function() {
  // Liste aller dauerhaft geöffneten Wiki-Fenster
  const openWindows = [];
  // Merkt sich das erste fixierte Fenster als "Wurzel"
  let rootWindow = null;
  const LOCK_DELAY = 5000;

  /**
   * Positioniert ein Wiki-Fenster neben dem Link, über dem sich der Mauszeiger befindet.
   */
  function position(win, link) {
    const rect = link.getBoundingClientRect();
    const width = win.offsetWidth;
    let left = rect.right + window.scrollX + 8;


    // Falls rechts nicht genug Platz ist, Fenster links vom Link anzeigen

    if (left + width > window.scrollX + window.innerWidth) {
      left = rect.left + window.scrollX - width - 8;
    }
    let top = rect.top + window.scrollY;

    // Fensterrand nicht außerhalb des Viewports positionieren
    top = Math.min(top, window.scrollY + window.innerHeight - win.offsetHeight);
    win.style.left = left + 'px';
    win.style.top = top + 'px';
  }

  /**
   * Aktiviert die Wiki-Vorschau für einen einzelnen Link.
   * Beim Überfahren wird der zugehörige Inhalt geladen und angezeigt.
   */
  function initLink(link) {
    // Schutz vor doppelter Initialisierung
    if (link.__wikiInit) return;
    link.__wikiInit = true

    let timeoutId;     // Timer zum Fixieren des Fensters
    let pinned = false; // Ob das Fenster dauerhaft offen bleibt
    let win = null;     // Referenz auf das aktuell geöffnete Fenster
    let progress = null;
    
    // Zeiger betritt den Link → Fenster laden und anzeigen
    link.addEventListener('mouseenter', () => {
      const url = link.dataset.wiki;
      if (!url) return;
      fetch(url).then(r => r.text()).then(html => {
        if (win) return; // bereits offen
        win = document.createElement('div');
        win.className = 'wiki-window';
        win.innerHTML = html;
        progress = document.createElement('div');
        progress.className = 'wiki-progress';
        progress.innerHTML = '<svg viewBox="0 0 32 32"><circle class="bg" cx="16" cy="16" r="14"></circle><circle class="fg" cx="16" cy="16" r="14"></circle></svg>';
        win.appendChild(progress);
        document.body.appendChild(win);
        position(win, link);
        initLinks(win); // Links innerhalb des Fensters aktivieren
        // Klicks im Fenster nicht als Seitenklick zählen
        win.addEventListener('click', ev => ev.stopPropagation());
        const fg = progress.querySelector('.fg');
        fg.style.transition = `stroke-dashoffset ${LOCK_DELAY}ms linear`;
        requestAnimationFrame(() => {
          fg.style.strokeDashoffset = '0';
        });
      });
      // Nach kurzer Zeit Fenster fixieren
      timeoutId = setTimeout(() => {
        pinned = true;
        if (progress) {
          progress.remove();
          progress = null;
        }
        if (win) {
          openWindows.push(win);
          if (!rootWindow) rootWindow = win;
        }
      }, LOCK_DELAY);
    });

    // Zeiger verlässt den Link → Fenster schließen, falls nicht fixiert
    link.addEventListener('mouseleave', () => {
      if (!pinned) {
        clearTimeout(timeoutId);
        if (win) {
          win.remove();
          win = null;
          progress = null;
        }
      }
    });
  }

  // Sucht alle Elemente mit data-wiki-Attribut und aktiviert sie
  function initLinks(root = document) {
    root.querySelectorAll('[data-wiki]').forEach(initLink);
  }

  initLinks();

  document.addEventListener('click', (e) => {
    if (e.target.closest('.wiki-window') || e.target.closest('[data-wiki]')) return;
    openWindows.forEach(w => {
      if (w !== rootWindow) w.remove();
    });
    if (rootWindow) {
      openWindows.length = 1;
      openWindows[0] = rootWindow;
    } else {
      openWindows.length = 0;
    }
  });
})();
