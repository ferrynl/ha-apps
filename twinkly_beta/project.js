(() => {
  const translations = {
    nl: {
      back: "Naar Home", changelog: "Changelog", roadmap: "Roadmap", version: "Versie",
      search: "Zoek op versie of wijziging", empty: "Geen versies gevonden.",
      failed: "Deze informatie kon niet worden geladen. Probeer de pagina opnieuw te openen.",
      changelogIntro: "Bekijk wat er is toegevoegd, verbeterd of opgelost in elke versie.",
      roadmapIntro: "Bekijk wat al in de bèta zit en wat op de planning staat.",
    },
    en: {
      back: "Back to Home", changelog: "Changelog", roadmap: "Roadmap", version: "Version",
      search: "Search by version or change", empty: "No versions found.",
      failed: "This information could not be loaded. Try reopening the page.",
      changelogIntro: "See the features, improvements and fixes in each version.",
      roadmapIntro: "See what is available in beta and what is planned.",
    },
    de: {
      back: "Zur Startseite", changelog: "Änderungsprotokoll", roadmap: "Roadmap", version: "Version",
      search: "Nach Version oder Änderung suchen", empty: "Keine Versionen gefunden.",
      failed: "Diese Informationen konnten nicht geladen werden. Öffne die Seite erneut.",
      changelogIntro: "Hier findest du die Neuerungen, Verbesserungen und Korrekturen jeder Version.",
      roadmapIntro: "Hier siehst du, was in der Beta verfügbar und was geplant ist.",
    },
    es: {
      back: "Volver a Inicio", changelog: "Registro de cambios", roadmap: "Hoja de ruta", version: "Versión",
      search: "Buscar por versión o cambio", empty: "No se encontraron versiones.",
      failed: "No se pudo cargar esta información. Vuelve a abrir la página.",
      changelogIntro: "Consulta las novedades, mejoras y correcciones de cada versión.",
      roadmapIntro: "Consulta qué está disponible en la beta y qué está previsto.",
    },
  };

  const versionHeading = /^#{1,2} (\d+\.\d+\.\d+(?:-[\w.-]+)?)\s*$/;
  const footerVersion = document.querySelector("[data-project-version]");
  const content = document.getElementById("project-entries");
  const languageControl = document.getElementById("language");
  let currentVersion = "";

  function language() {
    const selected = languageControl?.value || localStorage.getItem("twinkly-language");
    return Object.hasOwn(translations, selected) ? selected : "nl";
  }

  function translateLabels() {
    const labels = translations[language()];
    document.querySelectorAll("[data-project-label]").forEach(element => {
      element.textContent = labels[element.dataset.projectLabel];
    });
    footerVersion.textContent = currentVersion ? labels.version + " " + currentVersion : labels.changelog;
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function appendInline(node, text) {
    for (const segment of text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)) {
      if (segment.startsWith("**") && segment.endsWith("**")) {
        node.append(element("strong", segment.slice(2, -2)));
      } else if (segment.startsWith("`") && segment.endsWith("`")) {
        node.append(element("code", segment.slice(1, -1)));
      } else {
        node.append(segment);
      }
    }
  }

  async function readMarkdown(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Cannot load " + path);
    return (await response.text()).split(/\r?\n/);
  }

  function parseReleases(lines) {
    const releases = [];
    for (const line of lines) {
      const heading = versionHeading.exec(line);
      if (heading) {
        releases.push({version: heading[1], lines: []});
      } else if (line.trim() && !line.startsWith("#")) {
        releases.at(-1)?.lines.push(line.trim());
      }
    }
    if (!releases.length) throw new Error("Changelog has no releases");
    return releases;
  }

  async function showVersion() {
    const releases = parseReleases(await readMarkdown("CHANGELOG.md"));
    currentVersion = releases[0].version;
    footerVersion.href = "project.html#release-" + currentVersion;
    translateLabels();
    return releases;
  }

  function releaseCard(release, index) {
    const card = element("details", "", "release-entry");
    card.id = "release-" + release.version;
    card.open = index === 0;
    card.append(element("summary", release.version));
    let list;
    for (const line of release.lines) {
      if (line.startsWith("- ")) {
        if (!list) {
          list = element("ul");
          card.append(list);
        }
        const item = element("li");
        appendInline(item, line.slice(2));
        list.append(item);
      } else {
        list = null;
        const paragraph = element("p");
        appendInline(paragraph, line);
        card.append(paragraph);
      }
    }
    return card;
  }

  function showChangelog(releases, labels, status) {
    const cards = releases.map(releaseCard);
    content.append(...cards);
    const search = document.getElementById("project-query");
    document.getElementById("project-search").hidden = false;
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let matches = 0;
      cards.forEach((card, index) => {
        card.hidden = !card.textContent.toLowerCase().includes(query);
        card.open = !card.hidden && (query !== "" || index === 0);
        if (!card.hidden) matches += 1;
      });
      status.textContent = matches ? "" : labels.empty;
    });
    function revealRelease() {
      const selected = cards.find(card => "#" + card.id === location.hash);
      if (selected) {
        search.value = "";
        search.dispatchEvent(new Event("input"));
        selected.open = true;
        selected.scrollIntoView();
      }
    }
    revealRelease();
    window.addEventListener("hashchange", revealRelease);
  }

  async function showRoadmap() {
    const lines = await readMarkdown("ROADMAP.md");
    content.lang = "nl";
    let grid;
    let list;
    for (const line of lines) {
      if (line.startsWith("# ")) {
        const section = element("section", "", "roadmap-version");
        grid = element("div", "", "roadmap-grid");
        list = null;
        section.append(element("h2", line.slice(2)), grid);
        content.append(section);
      } else if (line.startsWith("## ") && grid) {
        const card = element("section", "", "roadmap-item");
        list = element("ul");
        card.append(element("h3", line.slice(3)), list);
        grid.append(card);
      } else if (line.startsWith("- ") && list) {
        const item = element("li");
        appendInline(item, line.slice(2));
        list.append(item);
      }
    }
    if (!content.childElementCount) throw new Error("Roadmap has no sections");
  }

  translateLabels();
  languageControl?.addEventListener("change", translateLabels);
  const releases = showVersion();
  if (!content) {
    releases.catch(() => {}); // Keep the changelog link usable when the version can't be read.
    return;
  }

  const labels = translations[language()];
  const roadmap = new URLSearchParams(location.search).get("view") === "roadmap";
  const view = roadmap ? "roadmap" : "changelog";
  document.documentElement.lang = language();
  document.title = labels[view] + " · Christmas Control Center";
  document.getElementById("project-title").textContent = labels[view];
  document.getElementById("project-intro").textContent = labels[view + "Intro"];
  document.querySelector('[data-project-view="' + view + '"]').setAttribute("aria-current", "page");
  const status = document.getElementById("project-status");
  if (roadmap) {
    releases.catch(() => {});
    showRoadmap().catch(() => { status.textContent = labels.failed; });
  } else {
    releases.then(entries => showChangelog(entries, labels, status))
      .catch(() => { status.textContent = labels.failed; });
  }
})();
