(function () {
  const BATCH_SIZE = 5;
  const INITIAL_BATCH = 10;
  const PREFS_KEY = 'gospelscroll_prefs';

  let passages = [];
  let queue = [];
  let index = 0;
  let readCount = 0;

  // Fisher-Yates shuffle
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function refillQueue() {
    queue = shuffle(passages);
    index = 0;
  }

  function nextPassages(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
      if (index >= queue.length) refillQueue();
      result.push(queue[index++]);
    }
    return result;
  }

  function formatRef(p) {
    if (p.startVerse === p.endVerse) {
      return p.book + ' ' + p.chapter + ':' + p.startVerse;
    }
    return p.book + ' ' + p.chapter + ':' + p.startVerse + '-' + p.endVerse;
  }

  function createCard(p) {
    const article = document.createElement('article');
    article.className = 'passage-card';

    const h2 = document.createElement('h2');
    h2.className = 'passage-header';
    h2.textContent = p.header;

    const textWrap = document.createElement('div');
    textWrap.className = 'passage-text';
    const paragraphs = p.text.split('\n\n');
    for (const para of paragraphs) {
      const pg = document.createElement('p');
      pg.textContent = para;
      textWrap.appendChild(pg);
    }

    const cite = document.createElement('cite');
    cite.className = 'passage-ref';
    cite.textContent = formatRef(p);

    article.append(h2, cite, textWrap);
    return article;
  }

  function appendBatch(count) {
    const feed = document.getElementById('feed');
    const batch = nextPassages(count);
    for (const p of batch) {
      feed.appendChild(createCard(p));
    }
  }

  // Settings
  function loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function savePrefs(prefs) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }

  function applyPrefs() {
    const prefs = loadPrefs();
    const root = document.documentElement;

    if (prefs.theme) {
      root.dataset.theme = prefs.theme;
    }
    if (prefs.fontSize) {
      root.dataset.fontsize = prefs.fontSize;
      document.getElementById('font-size-select').value = prefs.fontSize;
    }

    updateThemeIcon();
  }

  function updateThemeIcon() {
    const btn = document.getElementById('theme-toggle');
    btn.innerHTML = document.documentElement.dataset.theme === 'dark' ? '&#9788;' : '&#9790;';
  }

  function initControls() {
    const select = document.getElementById('font-size-select');
    select.addEventListener('change', function () {
      document.documentElement.dataset.fontsize = this.value;
      const prefs = loadPrefs();
      prefs.fontSize = this.value;
      savePrefs(prefs);
    });

    const toggle = document.getElementById('theme-toggle');
    toggle.addEventListener('click', function () {
      const root = document.documentElement;
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      const prefs = loadPrefs();
      prefs.theme = next;
      savePrefs(prefs);
      updateThemeIcon();
    });
  }

  // Init
  async function init() {
    applyPrefs();
    initControls();

    const res = await fetch('/data/gospels.json');
    const data = await res.json();
    passages = data.passages;

    refillQueue();
    appendBatch(INITIAL_BATCH);

    const sentinel = document.getElementById('sentinel');
    const observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        appendBatch(BATCH_SIZE);
      }
    }, { rootMargin: '200px' });

    observer.observe(sentinel);

    // Session read counter — increment when a card scrolls into view
    const readObserver = new IntersectionObserver(function (entries) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          readCount++;
          document.getElementById('read-counter').textContent = readCount + ' read';
          readObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.5 });

    // Observe existing and future cards
    const feedObserver = new MutationObserver(function (mutations) {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.classList && node.classList.contains('passage-card')) {
            readObserver.observe(node);
          }
        }
      }
    });
    feedObserver.observe(feed, { childList: true });

    // Observe initial cards
    for (const card of feed.querySelectorAll('.passage-card')) {
      readObserver.observe(card);
    }
  }

  init();

  // Register the service worker for offline reading + installability.
  // Non-fatal: the site works normally if this fails or is unsupported.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
})();
