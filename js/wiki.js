(function() {
  const openWindows = [];
  let rootWindow = null;
  const LOCK_DELAY = 5000;

  function position(win, link) {
    const rect = link.getBoundingClientRect();
    const width = win.offsetWidth;
    let left = rect.right + window.scrollX + 8;
    if (left + width > window.scrollX + window.innerWidth) {
      left = rect.left + window.scrollX - width - 8;
    }
    let top = rect.top + window.scrollY;
    top = Math.min(top, window.scrollY + window.innerHeight - win.offsetHeight);
    win.style.left = left + 'px';
    win.style.top = top + 'px';
  }

  function initLink(link) {
    if (link.__wikiInit) return;
    link.__wikiInit = true;
    let timeoutId;
    let pinned = false;
    let win = null;
    let progress = null;

    link.addEventListener('mouseenter', () => {
      const url = link.dataset.wiki;
      if (!url) return;
      fetch(url).then(r => r.text()).then(html => {
        if (win) return;
        win = document.createElement('div');
        win.className = 'wiki-window';
        win.innerHTML = html;
        progress = document.createElement('div');
        progress.className = 'wiki-progress';
        progress.innerHTML = '<svg viewBox="0 0 32 32"><circle class="bg" cx="16" cy="16" r="14"></circle><circle class="fg" cx="16" cy="16" r="14"></circle></svg>';
        win.appendChild(progress);
        document.body.appendChild(win);
        position(win, link);
        initLinks(win);
        win.addEventListener('click', ev => ev.stopPropagation());
        const fg = progress.querySelector('.fg');
        fg.style.transition = `stroke-dashoffset ${LOCK_DELAY}ms linear`;
        requestAnimationFrame(() => {
          fg.style.strokeDashoffset = '0';
        });
      });
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
