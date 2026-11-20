window.createLightingTools = ({mount, house, nav, api, node, field, language, productPhoto}) => {
  const labels = {
    nl: ["Showbouwer", "Shownaam", "Scène", "Wachttijd (sec.)", "Stap toevoegen", "Omhoog", "Omlaag", "Verwijderen", "Opslaan", "Afspelen", "Stoppen", "Maak eerst een scène voor een gemengde groep op Home.", "Stap", "Show klaar", "Show gestopt", "Show onderbroken", "Geen bevestiging", "Spatial Light Studio", "Kies een foto", "Kies een lamp", "Plaats in het midden", "Verwijder plaatsing", "Klik op de foto om de gekozen lamp te plaatsen. Verplaats een markering met de pijltjestoetsen.", "Foto wissen", "Kies een geldige JPG, PNG of WebP van maximaal 15 MB.", "Opslaan op de server is mislukt.", "Shows en foto-indeling staan op je Home Assistant-server. Een show loopt door als je de pagina sluit.", "Groep", "Nieuwe show", "Bewerken", "Definieer minimaal één geldige stap.", "Onbekende lamp", "Locatie", "Foto van de ruimte", "Scène of groep ontbreekt", "Opdrachten gedeeltelijk uitgevoerd"],
    en: ["Show builder", "Show name", "Scene", "Hold (sec.)", "Add step", "Move up", "Move down", "Remove", "Save", "Play", "Stop", "First create a scene for a mixed group on Home.", "Step", "Show complete", "Show stopped", "Show interrupted", "Unconfirmed", "Spatial Light Studio", "Choose a photo", "Choose a light", "Place in the centre", "Remove placement", "Click the photo to place the selected light. Move a marker with the arrow keys.", "Clear photo", "Choose a valid JPG, PNG or WebP up to 15 MB.", "Could not save to the server.", "Shows and photo layouts are saved on your Home Assistant server. Playback continues when you close this page.", "Group", "New show", "Edit", "Add at least one valid step.", "Unknown light", "Position", "Photo of the space", "Scene or group missing", "Some commands did not complete"],
    de: ["Show-Editor", "Showname", "Szene", "Haltedauer (Sek.)", "Schritt hinzufügen", "Nach oben", "Nach unten", "Entfernen", "Speichern", "Abspielen", "Stoppen", "Erstelle zuerst auf der Startseite eine Szene für eine gemischte Gruppe.", "Schritt", "Show beendet", "Show gestoppt", "Show unterbrochen", "Unbestätigt", "Spatial Light Studio", "Foto auswählen", "Lampe auswählen", "In der Mitte platzieren", "Position entfernen", "Klicke auf das Foto, um die Lampe zu platzieren. Verschiebe Marker mit den Pfeiltasten.", "Foto löschen", "Wähle ein gültiges JPG, PNG oder WebP bis 15 MB.", "Speichern auf dem Server fehlgeschlagen.", "Shows und Fotolayout liegen auf deinem Home Assistant-Server. Die Wiedergabe läuft nach dem Schließen der Seite weiter.", "Gruppe", "Neue Show", "Bearbeiten", "Füge mindestens einen gültigen Schritt hinzu.", "Unbekannte Lampe", "Position", "Foto des Raums", "Szene oder Gruppe fehlt", "Einige Befehle wurden nicht ausgeführt"],
    es: ["Editor de espectáculos", "Nombre", "Escena", "Pausa (s)", "Añadir paso", "Subir", "Bajar", "Quitar", "Guardar", "Reproducir", "Detener", "Crea primero una escena para un grupo mixto en Inicio.", "Paso", "Espectáculo terminado", "Espectáculo detenido", "Espectáculo interrumpido", "Sin confirmar", "Spatial Light Studio", "Elegir foto", "Elegir luz", "Colocar en el centro", "Quitar posición", "Haz clic en la foto para colocar la luz. Usa las flechas para mover un marcador.", "Borrar foto", "Elige un JPG, PNG o WebP válido de hasta 15 MB.", "No se pudo guardar en el servidor.", "Los espectáculos y la distribución se guardan en tu servidor de Home Assistant. La reproducción continúa al cerrar esta página.", "Grupo", "Nuevo espectáculo", "Editar", "Añade al menos un paso válido.", "Luz desconocida", "Posición", "Foto del espacio", "Falta la escena o el grupo", "Algunos comandos no se completaron"],
  };
  const serverLabels = {
    nl: ["Projecten laden…", "Projecten konden niet worden geladen.", "Gegevens uit deze browser overzetten", "Gegevens overgezet.", "Er staat al een foto op de server. Je oude foto blijft in deze browser.", "Er is een conflict. Vernieuw de bewerking en probeer opnieuw.", "Show wordt gestopt…", "Foto vervangen? De huidige lampplaatsingen worden gewist."],
    en: ["Loading projects…", "Could not load projects.", "Import from this browser", "Projects imported.", "The server already has a photo. Your original photo remains in this browser.", "There is a conflict. Reload the edit and try again.", "Stopping show…", "Replace photo? Current light placements will be cleared."],
    de: ["Projekte werden geladen…", "Projekte konnten nicht geladen werden.", "Daten aus diesem Browser importieren", "Projekte importiert.", "Auf dem Server liegt bereits ein Foto. Das alte Foto bleibt in diesem Browser.", "Es gibt einen Konflikt. Lade die Bearbeitung neu und versuche es erneut.", "Show wird gestoppt…", "Foto ersetzen? Die aktuellen Lampenpositionen werden gelöscht."],
    es: ["Cargando proyectos…", "No se pudieron cargar los proyectos.", "Importar desde este navegador", "Proyectos importados.", "Ya hay una foto en el servidor. La foto anterior permanece en este navegador.", "Hay un conflicto. Vuelve a abrir la edición e inténtalo de nuevo.", "Deteniendo el espectáculo…", "¿Sustituir la foto? Se borrarán las posiciones de luces actuales."],
  };
  const houseLabels = {
    nl: ["Mijn Huis", "Lampen", "Grootte", "Nog geen lampen gevonden", "Kies een lamp en tik op de foto om hem te plaatsen. Versleep de lamp om hem te verplaatsen en sleep aan de ronde hoekgreep voor de grootte.", "Geplaatst"],
    en: ["My Home", "Lights", "Size", "No lights found", "Choose a light and tap the photo to place it. Drag the light to move it and drag its round corner handle to resize it.", "Placed"],
    de: ["Mein Zuhause", "Lampen", "Größe", "Keine Lampen gefunden", "Wähle eine Lampe und tippe auf das Foto. Ziehe die Lampe zum Verschieben und den runden Eckgriff zum Skalieren.", "Platziert"],
    es: ["Mi casa", "Luces", "Tamaño", "No hay luces", "Elige una luz y toca la foto para colocarla. Arrastra la luz para moverla y el tirador redondo para cambiar su tamaño.", "Colocada"],
  };
  const effectLabels = {
    nl: ["Kleurveeg", "Richting", "Links naar rechts", "Rechts naar links", "Boven naar beneden", "Beneden naar boven", "Tijd tussen lampen (ms)", "Volgorde tonen", "Lampen die meedoen", "RGB-lampen die als ingeschakeld bekend zijn, doen mee. Na de veeg blijft de gekozen kleur actief.", "Laatste uitgevoerde stap", "Opdrachttijd in de app", "Kleurveeg klaar", "Kleurveeg gestopt", "Kleurveeg mislukt", "Kleurveeg wordt voorbereid…", "Geaccepteerd", "Overgeslagen", "Mislukt"],
    en: ["Colour sweep", "Direction", "Left to right", "Right to left", "Top to bottom", "Bottom to top", "Time between lights (ms)", "Show order", "Participating lights", "Lights with RGB and a known on state take part. The selected colour stays active after the sweep.", "Last completed step", "Command time in the app", "Sweep complete", "Sweep stopped", "Sweep failed", "Preparing sweep…", "Accepted", "Skipped", "Failed"],
    de: ["Farbverlauf", "Richtung", "Links nach rechts", "Rechts nach links", "Oben nach unten", "Unten nach oben", "Zeit zwischen Lampen (ms)", "Reihenfolge anzeigen", "Teilnehmende Lampen", "RGB-Lampen mit bestätigtem Ein-Zustand nehmen teil. Die gewählte Farbe bleibt danach aktiv.", "Zuletzt ausgeführter Schritt", "Befehlsdauer in der App", "Farbverlauf abgeschlossen", "Farbverlauf gestoppt", "Farbverlauf fehlgeschlagen", "Farbverlauf wird vorbereitet…", "Angenommen", "Übersprungen", "Fehlgeschlagen"],
    es: ["Barrido de color", "Dirección", "Izquierda a derecha", "Derecha a izquierda", "Arriba abajo", "Abajo arriba", "Tiempo entre luces (ms)", "Mostrar orden", "Luces participantes", "Participan las luces RGB cuyo estado encendido es conocido. El color elegido permanece al terminar.", "Último paso ejecutado", "Tiempo de comando en la aplicación", "Barrido terminado", "Barrido detenido", "Barrido fallido", "Preparando barrido…", "Aceptado", "Omitido", "Fallido"],
  };
  const directions = {right: [0, 1], left: [0, -1], down: [1, 1], up: [1, -1]};
  const timingLabels = {
    nl: ["Effect", "Kleurverloop", "Eindkleur", "Timingcorrectie (ms)", "Stuur de opdracht voor deze lamp eerder als hij trager reageert.", "Kleurverloop klaar", "Kleurverloop gestopt", "Kleurverloop mislukt", "Kleurverloop wordt voorbereid…", "Het verloop verdeelt de kleuren over de lampposities in de gekozen richting."],
    en: ["Effect", "Colour gradient", "End colour", "Timing correction (ms)", "Send the command earlier for this light if it responds more slowly.", "Gradient complete", "Gradient stopped", "Gradient failed", "Preparing gradient…", "The gradient distributes colours over the light positions in the selected direction."],
    de: ["Effekt", "Farbgradient", "Endfarbe", "Zeitkorrektur (ms)", "Sende den Befehl für diese Lampe früher, wenn sie langsamer reagiert.", "Gradient abgeschlossen", "Gradient gestoppt", "Gradient fehlgeschlagen", "Gradient wird vorbereitet…", "Der Gradient verteilt die Farben in der gewählten Richtung auf die Lampenpositionen."],
    es: ["Efecto", "Degradado", "Color final", "Corrección de tiempo (ms)", "Envía la orden antes para esta luz si tarda más en responder.", "Degradado terminado", "Degradado detenido", "Degradado fallido", "Preparando degradado…", "El degradado distribuye los colores por la posición de las luces en la dirección elegida."],
  };
  const sweep = {mode: "sweep", end: "#4b90ff", direction: "right", color: "#ffbd63", delay: 550, preview: false};
  const showKey = "christmas-mixed-shows-v1";
  const spatialKey = "christmas-spatial-layout-v1";
  const maxSteps = 20;
  const maxShows = 20;
  const showSection = node("section", "", "lighting-tool");
  const spatialSection = node("section", "", "lighting-tool");
  const showStatus = node("p");
  const spatialStatus = node("p");
  const effectStatus = node("p");
  effectStatus.setAttribute("role", "status");
  const reports = [node("details", "", "house-effect-report"), node("details", "", "house-effect-report")];
  let refreshEffectButtons;
  showStatus.setAttribute("role", "status");
  spatialStatus.setAttribute("role", "status");
  showSection.append(showStatus);
  spatialSection.append(spatialStatus);
  const houseTitle = node("h2");
  houseTitle.id = "house-title";
  mount.append(showSection);
  house.append(houseTitle, spatialSection);

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  let legacyShows = read(showKey, []);
  if (!Array.isArray(legacyShows)) legacyShows = [];
  let legacyLayout = read(spatialKey, {});
  let shows = [];
  let layout = {revision: null, photoVersion: null, points: new Map()};
  let playback = {state: "idle"};
  let inventory;
  let signature;
  let draft = {name: "", group: "", steps: []};
  let selected = "";
  let initialized = false;
  let busy = false;
  let reading = false;
  let generation = 0;
  let timer;
  let activePage;
  let gesture;
  let photoElement = node("img");
  const syncStatus = node("p");
  syncStatus.setAttribute("role", "status");
  mount.prepend(syncStatus);
  const t = index => (labels[language()] || labels.nl)[index];
  const g = index => (timingLabels[language()] || timingLabels.nl)[index];
  const e = index => (effectLabels[language()] || effectLabels.nl)[index];
  const h = index => (houseLabels[language()] || houseLabels.nl)[index];
  const msg = index => (serverLabels[language()] || serverLabels.nl)[index];
  const isPlaying = () => ["playing", "stopping"].includes(playback.state);

  function receive(data, focusId) {
    const showsChanged = !initialized || JSON.stringify(shows) !== JSON.stringify(data.shows);
    const layoutChanged = !initialized || layout.revision !== data.layout.revision;
    const runningChanged = !initialized || isPlaying() !== ["playing", "stopping"].includes(data.playback.state)
      || playback.state !== data.playback.state;
    initialized = true;
    shows = data.shows;
    if (layout.photoVersion !== data.layout.photo_version) {
      photoElement = node("img");
      layout.photoVersion = data.layout.photo_version;
      if (layout.photoVersion) photoElement.src = "lighting/projects/photo?v=" + encodeURIComponent(layout.photoVersion);
    }
    layout.revision = data.layout.revision;
    layout.points = new Map(data.layout.points);
    const changed = JSON.stringify(playback) !== JSON.stringify(data.playback);
    playback = data.playback;
    if (changed) {
      updatePlaybackStatus();
      refreshEffectButtons?.();
    }
    if (inventory && (showsChanged || runningChanged)) renderShows();
    if (inventory && layoutChanged) renderSpatial(focusId);
  }

  function updatePlaybackStatus() {
    const state = playback.state;
    if (state === "idle") {
      for (const details of reports) details.hidden = true;
      return;
    }
    const spatial = playback.kind === "spatial";
    const gradient = playback.effect === "gradient";
    const effectName = gradient ? g(1) : e(0);
    const headline = state === "playing" ? (spatial && playback.step === 0 ? (gradient ? g(8) : e(15))
      : t(12) + " " + playback.step + " / " + playback.total)
      : state === "stopping" ? (spatial ? effectName + " · " + t(10) + "…" : msg(6))
      : spatial ? (gradient ? g({complete: 5, stopped: 6, failed: 7}[state]) : e({complete: 12, stopped: 13, failed: 14}[state]))
      : t({complete: 13, stopped: 14, failed: 15}[state]);
    const status = [headline, playback.uncertain && t(16), playback.partial && t(35)].filter(Boolean).join(" · ");
    showStatus.textContent = spatial && isPlaying() ? effectName + " · " + status : spatial ? "" : status;
    effectStatus.textContent = spatial ? status : isPlaying() ? t(0) + " · " + status : "";
    const names = new Map((inventory?.lights || []).map(light => [light.id, light.name]));
    for (const [index, details] of reports.entries()) {
      const last = playback.last;
      details.hidden = !last || spatial !== Boolean(index);
      if (details.hidden) continue;
      const label = result => ({accepted: e(16), skipped: e(17), failed: e(18), unconfirmed: t(16)})[result] || result;
      const list = node("ul");
      for (const [id, commands] of Object.entries(last.results)) {
        list.append(node("li", (names.get(id) || t(31)) + " · " + Object.values(commands).map(label).join(" / ")));
      }
      details.replaceChildren(node("summary", e(10) + " " + last.step + " · " + e(11) + " " + last.milliseconds + " ms"), list);
    }
  }

  async function refresh() {
    if (busy || reading || gesture || (mount.hidden && house.hidden)) return;
    reading = true;
    const request = generation;
    try {
      const data = await api("lighting/projects");
      if (request !== generation || gesture) return;
      if (!initialized || syncStatus.textContent === msg(1)) syncStatus.textContent = "";
      receive(data);
    } catch {
      if (request === generation) syncStatus.textContent = msg(1);
    } finally {
      reading = false;
    }
  }

  async function change(body, status, focusId) {
    if (busy) return;
    busy = true;
    generation++;
    try {
      const data = await api("lighting/projects", body);
      status.textContent = "";
      receive(data, focusId);
      return data;
    } catch (error) {
      status.textContent = error.message === "project_conflict" ? msg(5) : t(25);
    } finally {
      busy = false;
    }
  }

  function action(caption, handle, disabled = false) {
    const button = node("button", caption);
    button.type = "button";
    button.disabled = disabled;
    button.onclick = handle;
    return button;
  }

  function dropdown(pairs, selectedValue, placeholder) {
    const select = node("select");
    if (placeholder) select.add(new Option(placeholder, ""));
    for (const [id, name] of pairs) select.add(new Option(name, id));
    select.value = selectedValue;
    return select;
  }

  const scenes = group => Object.entries(inventory.scenes || {})
    .filter(([, scene]) => scene.group === group)
    .map(([id, scene]) => [id, scene.name]);

  function valid(show) {
    const sceneIds = new Set(scenes(show.group).map(([id]) => id));
    return Boolean(inventory.groups?.[show.group] && show.steps.length &&
      show.steps.every(step => sceneIds.has(step.scene)));
  }

  function renderShows() {
    const list = node("div", "", "lighting-controls");
    for (const show of shows) {
      const card = node("article", "", "lighting-card");
      const playable = valid(show);
      card.append(node("h4", show.name), node("p", playable ? inventory.groups[show.group].name : t(34)),
        action(t(9), () => change({action: "play", id: show.id}, showStatus), isPlaying() || !playable),
        action(t(29), () => {
          draft = {...show, steps: show.steps.map(step => ({...step}))};
          renderShows();
        }, isPlaying()),
        action(t(7), async () => {
          if (!window.confirm(t(7) + " · " + show.name + "?")) return;
          if (await change({action: "delete", id: show.id, revision: show.revision}, showStatus)) {
            if (draft.id === show.id) draft = {name: "", group: "", steps: []};
            renderShows();
          }
        }, isPlaying()));
      list.append(card);
    }

    const groups = Object.entries(inventory.groups || {}).filter(([id]) => scenes(id).length)
      .map(([id, group]) => [id, group.name]);
    const form = node("form", "", "lighting-show-form");
    if (groups.length && !isPlaying()) {
      if (!draft.group) draft.group = groups[0][0];
      const name = node("input");
      name.maxLength = 60;
      name.required = true;
      name.value = draft.name;
      name.oninput = () => { draft.name = name.value; };
      const group = dropdown(groups, draft.group, t(27));
      group.onchange = () => {
        draft.group = group.value;
        draft.steps = [];
        renderShows();
      };
      form.append(field(t(1), name), field(t(27), group));
      const available = scenes(draft.group);
      draft.steps.forEach((step, index) => {
        const row = node("div", "", "lighting-controls lighting-show-step");
        const scene = dropdown(available, step.scene, t(2));
        scene.required = true;
        scene.onchange = () => { step.scene = scene.value; };
        const seconds = node("input");
        Object.assign(seconds, {type: "number", min: "1", max: "300", required: true, value: step.seconds});
        seconds.oninput = () => { step.seconds = seconds.valueAsNumber; };
        const move = offset => {
          const next = index + offset;
          [draft.steps[index], draft.steps[next]] = [draft.steps[next], draft.steps[index]];
          renderShows();
        };
        row.append(node("strong", String(index + 1)), field(t(2), scene), field(t(3), seconds),
          action(t(5), () => move(-1), index === 0),
          action(t(6), () => move(1), index === draft.steps.length - 1),
          action(t(7), () => { draft.steps.splice(index, 1); renderShows(); }));
        form.append(row);
      });
      const controls = node("div", "", "lighting-controls");
      const submit = node("button", t(8));
      submit.type = "submit";
      controls.append(action(t(4), () => {
        draft.steps.push({scene: available[0][0], seconds: 3});
        renderShows();
      }, !available.length || draft.steps.length >= maxSteps), submit);
      if (draft.id) controls.append(action(t(28), () => {
        draft = {name: "", group: "", steps: []};
        renderShows();
      }));
      form.append(controls);
      form.onsubmit = async event => {
        event.preventDefault();
        const name = draft.name.trim();
        if (!name || !valid(draft) || (!draft.id && shows.length >= maxShows) ||
            draft.steps.some(step => !Number.isInteger(step.seconds) || step.seconds < 1 || step.seconds > 300)) {
          showStatus.textContent = t(30);
          return;
        }
        const show = {...draft, name};
        submit.disabled = true;
        try {
          if (await change({...show, action: "save"}, showStatus)) {
            draft = {name: "", group: show.group, steps: []};
            renderShows();
          }
        } finally {
          submit.disabled = false;
        }
      };
    } else if (!isPlaying()) {
      form.append(node("p", t(11)));
    }
    const header = node("div", "", "lighting-heading");
    header.append(node("h3", t(0)));
    if (isPlaying()) header.append(action(t(10), () => change({action: "stop"}, showStatus), playback.state === "stopping"));
    showSection.replaceChildren(header, node("p", t(26)), showStatus, reports[0], list, form);
    if (legacyShows.length || legacyLayout.photo) showSection.append(action(msg(2), () => migrate()));
  }

  async function importPhoto(file) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 15 * 1024 * 1024) {
      throw new Error("invalid_photo");
    }
    const source = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = node("canvas");
      const scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#161b22";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.82, 0.7, 0.55, 0.4]) {
        const encoded = canvas.toDataURL("image/jpeg", quality).split(",")[1];
        if (encoded?.length <= 600000) return encoded;
      }
      throw new Error("invalid_photo");
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  async function migrate(status = showStatus) {
    const body = {action: "import", shows: legacyShows, points: legacyLayout.points || []};
    if (!layout.photoVersion && /^data:image\/jpeg;base64,/.test(legacyLayout.photo || "")) {
      try {
        body.photo = await importPhoto(await (await fetch(legacyLayout.photo)).blob());
      } catch {
        status.textContent = t(24);
        return;
      }
    }
    const data = await change(body, status);
    if (!data) return;
    if (!legacyLayout.photo || data.imported_photo) {
      legacyLayout = {};
      try { localStorage.removeItem(spatialKey); } catch {}
    }
    legacyShows = [];
    try { localStorage.removeItem(showKey); } catch {}
    status.textContent = legacyLayout.photo ? msg(4) : msg(3);
    renderShows();
    renderSpatial();
  }

  function updateLayout(points, options = {}, focusId) {
    return change({action: "layout", revision: layout.revision, points: [...points], ...options},
      spatialStatus, focusId);
  }

  const defaultSize = 12;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function setPosition(id, x, y, size = defaultSize, focusId = id) {
    const points = new Map(layout.points);
    const point = [clamp(x, 0, 100), clamp(y, 0, 100), clamp(size, 4, 40)];
    const advance = points.get(id)?.[3];
    if (advance) point.push(advance);
    points.set(id, point);
    return updateLayout(points, {}, focusId);
  }

  function lampImage(light) {
    const fallback = () => {
      const illustration = node("span", "", "house-lamp-art");
      illustration.setAttribute("aria-hidden", "true");
      illustration.append(node("span"));
      return illustration;
    };
    const key = productPhoto(light);
    if (!key) return fallback();
    const image = node("img", "", "house-lamp-image");
    image.src = "product-photo/" + encodeURIComponent(key) + "?v=2";
    image.alt = "";
    image.draggable = false;
    image.onerror = () => image.replaceWith(fallback());
    return image;
  }

  function lampMarker(photo, light, point) {
    const [x, y, size = defaultSize] = point;
    const item = node("div", "", "house-marker");
    item.dataset.lamp = light.id;
    const marker = action("", () => {
      selected = light.id;
      renderSpatial(light.id);
    });
    marker.className = "house-marker-lamp";
    marker.append(lampImage(light));
    marker.setAttribute("aria-label", light.name + " · " + t(32) + " " + Math.round(x) + "%, " + Math.round(y) + "%");
    marker.setAttribute("aria-pressed", String(light.id === selected));
    item.classList.toggle("is-selected", light.id === selected);
    const handle = action("", () => {});
    handle.type = "button";
    handle.className = "house-resize-handle";
    handle.setAttribute("aria-label", h(2) + " · " + light.name);
    handle.title = h(2);
    handle.hidden = light.id !== selected;
    item.classList.toggle("handle-left", x >= 50);
    item.classList.toggle("handle-top", y >= 50);

    function display(left, top, width) {
      item.style.left = left + "%";
      item.style.top = top + "%";
      item.style.width = width + "%";
    }
    display(x, y, size);

    function wire(control, resize) {
      let moved = false;
      control.onpointerdown = event => {
        if (!event.isPrimary || event.button !== 0 || gesture || busy) return;
        const rect = photo.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        moved = false;
        const startX = event.clientX, startY = event.clientY;
        let values = [x, y, size];
        selected = light.id;
        gesture = control;
        control.setPointerCapture(event.pointerId);
        control.onpointermove = move => {
          if (gesture !== control || move.pointerId !== event.pointerId) return;
          const deltaX = move.clientX - startX, deltaY = move.clientY - startY;
          moved ||= Math.hypot(deltaX, deltaY) > 3;
          if (!moved) return;
          values = resize
            ? [x, y, clamp(size + (x >= 50 ? -2 : 2) * 100 * deltaX / rect.width, 4, 40)]
            : [clamp(x + 100 * deltaX / rect.width, 0, 100), clamp(y + 100 * deltaY / rect.height, 0, 100), size];
          display(...values);
        };
        const finish = async end => {
          if (gesture !== control || end.pointerId !== event.pointerId) return;
          gesture = undefined;
          if (end.type === "pointerup" && moved) {
            if (!await setPosition(light.id, ...values)) renderSpatial(light.id);
          } else if (end.type !== "pointerup") {
            renderSpatial(light.id);
          }
        };
        control.onpointerup = finish;
        control.onpointercancel = finish;
        control.onlostpointercapture = finish;
      };
      control.addEventListener("click", event => {
        if (moved && event.detail) event.stopImmediatePropagation();
      }, true);
    }
    wire(marker, false);
    wire(handle, true);
    marker.onkeydown = event => {
      const nudge = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}[event.key];
      if (!nudge) return;
      event.preventDefault();
      selected = light.id;
      setPosition(light.id, x + nudge[0], y + nudge[1], size);
    };
    handle.onkeydown = event => {
      const delta = {ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1}[event.key];
      if (!delta) return;
      event.preventDefault();
      setPosition(light.id, x, y, size + delta, "resize");
    };
    item.append(marker, handle);
    return {item, marker, handle};
  }

  const rgbFromHex = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16));

  function effectControls(stage) {
    const section = node("section", "", "house-effects");
    const controls = node("div", "", "lighting-controls");
    const mode = dropdown([["sweep", e(0)], ["gradient", g(1)]], sweep.mode);
    const direction = dropdown(Object.keys(directions).map((key, index) => [key, e(index + 2)]), sweep.direction);
    const speed = node("input");
    Object.assign(speed, {type: "number", min: 250, max: 2000, step: 50, required: true, value: sweep.delay});
    speed.onchange = () => { sweep.delay = Number(speed.value); };
    const color = node("input");
    Object.assign(color, {type: "color", value: sweep.color, title: e(0)});
    color.oninput = () => { sweep.color = color.value; drawOrder(); };
    const end = node("input");
    Object.assign(end, {type: "color", value: sweep.end});
    end.oninput = () => { sweep.end = end.value; drawOrder(); };
    const endField = field(g(2), end);
    const speedField = field(e(6), speed);
    const gradientHelp = node("p", g(9));
    const preview = node("input");
    Object.assign(preview, {type: "checkbox", checked: sweep.preview});
    const summary = node("p");
    const play = action(t(9), () => {
      const gradient = sweep.mode === "gradient";
      if (!gradient && !speed.reportValidity()) return;
      const rgb = rgbFromHex(sweep.color);
      const endRgb = rgbFromHex(sweep.end);
      if (!rgb.some(Boolean) || (gradient && !endRgb.some(Boolean))) {
        effectStatus.textContent = gradient ? g(7) : e(14);
        return;
      }
      const command = {action: "spatial", revision: layout.revision, direction: sweep.direction,
        color: rgb, delay: gradient ? 550 : Number(speed.value)};
      if (gradient) command.end_color = endRgb;
      return change(command, effectStatus);
    });
    const stop = action(t(10), () => change({action: "stop"}, effectStatus));
    function drawOrder() {
      const available = new Set((inventory.lights || []).filter(light => light.status !== "unavailable"
        && light.capabilities?.rgb && light.state?.on === true).map(light => light.id));
      const [axis, sign] = directions[sweep.direction];
      const ordered = [...layout.points].filter(([id]) => available.has(id))
        .sort((a, b) => sign * (a[1][axis] - b[1][axis]));
      const gradient = sweep.mode === "gradient";
      endField.hidden = gradientHelp.hidden = !gradient;
      speedField.hidden = gradient;
      const first = ordered[0]?.[1][axis];
      const span = ordered.at(-1)?.[1][axis] - first;
      const startRgb = rgbFromHex(sweep.color), endRgb = rgbFromHex(sweep.end);
      const numbers = new Map(ordered.map(([id, point], index) => {
        const ratio = span ? (point[axis] - first) / span : 0;
        const previewColor = startRgb.map((channel, i) => Math.round(channel + (endRgb[i] - channel) * ratio));
        return [id, {number: index + 1, color: "rgb(" + previewColor.join(",") + ")"}];
      }));
      for (const marker of stage.querySelectorAll(".house-marker")) {
        const entry = numbers.get(marker.dataset.lamp);
        if (sweep.preview && entry) marker.dataset.order = entry.number;
        else delete marker.dataset.order;
        if (gradient && sweep.preview && entry) marker.style.setProperty("--gradient-preview", entry.color);
        else marker.style.removeProperty("--gradient-preview");
      }
      summary.textContent = e(8) + " · " + ordered.length + " / " + layout.points.size;
      play.disabled = isPlaying() || !ordered.length;
      stop.hidden = !isPlaying();
      stop.disabled = playback.state === "stopping";
    }
    refreshEffectButtons = drawOrder;
    mode.onchange = () => { sweep.mode = mode.value; drawOrder(); };
    direction.onchange = () => { sweep.direction = direction.value; drawOrder(); };
    preview.onchange = () => { sweep.preview = preview.checked; drawOrder(); };
    const colorLabel = {nl: "Kleur", en: "Colour", de: "Farbe", es: "Color"}[language()] || "Colour";
    controls.append(field(g(0), mode), field(e(1), direction), field(colorLabel, color), endField, speedField,
      field(e(7), preview), play, stop);
    section.append(node("h3", g(0)), node("p", e(9)), gradientHelp, controls, summary, effectStatus, reports[1]);
    drawOrder();
    updatePlaybackStatus();
    return section;
  }

  function renderSpatial(focusId) {
    const lights = new Map((inventory.lights || []).map(light => [light.id, light]));
    for (const id of layout.points.keys()) {
      if (!lights.has(id)) lights.set(id, {id, name: t(31) + " · " + id});
    }
    const upload = node("input");
    upload.type = "file";
    upload.accept = "image/jpeg,image/png,image/webp";
    upload.onchange = async () => {
      const file = upload.files[0];
      if (!file) return;
      if (layout.photoVersion && !window.confirm(msg(7))) {
        upload.value = "";
        return;
      }
      const revision = layout.revision;
      upload.disabled = true;
      try {
        const photo = await importPhoto(file);
        await updateLayout(new Map(), {photo, revision});
      } catch {
        spatialStatus.textContent = t(24);
      } finally {
        upload.disabled = false;
        upload.value = "";
      }
    };
    const toolbar = node("div", "", "lighting-controls");
    toolbar.append(field(t(18), upload));
    if (legacyLayout.photo) toolbar.append(action(msg(2), () => migrate(spatialStatus)));
    if (!layout.photoVersion) {
      refreshEffectButtons = undefined;
      spatialSection.replaceChildren(spatialStatus, toolbar);
      return;
    }
    const photo = photoElement;
    photo.className = "house-room-photo";
    photo.alt = t(33);
    const stage = node("div", "", "lighting-spatial-stage");
    stage.append(photo);
    photo.onclick = event => {
      const rect = photo.getBoundingClientRect();
      if (selected && lights.has(selected)) setPosition(selected, 100 * (event.clientX - rect.left) / rect.width,
        100 * (event.clientY - rect.top) / rect.height, layout.points.get(selected)?.[2]);
    };
    const cards = node("div", "", "house-lamp-list");
    let focus;
    for (const light of lights.values()) {
      const point = layout.points.get(light.id);
      const choose = action("", () => {
        selected = light.id;
        renderSpatial("list");
      });
      choose.className = "house-lamp-choice";
      choose.setAttribute("aria-pressed", String(light.id === selected));
      choose.append(lampImage(light), node("span", light.name));
      if (point) choose.append(node("small", h(5)));
      cards.append(choose);
      if (focusId === "list" && light.id === selected) focus = choose;
      if (!point) continue;
      const {item, marker, handle} = lampMarker(photo, light, point);
      stage.append(item);
      if (light.id === selected && focusId === "resize") focus = handle;
      if (light.id === focusId) focus = marker;
    }
    if (!lights.size) cards.append(node("p", h(3)));
    const panel = node("aside", "", "house-lamp-panel");
    panel.append(node("h3", h(1)), cards);
    toolbar.append(action(t(23), () => {
      if (window.confirm(t(23) + "?")) return updateLayout(new Map(), {photo: null});
    }));
    const settings = node("div", "", "lighting-controls");
    const selectedPoint = layout.points.get(selected);
    if (selectedPoint) {
      const range = node("input");
      Object.assign(range, {type: "range", min: 4, max: 40, value: selectedPoint[2] ?? defaultSize});
      range.onchange = () => setPosition(selected, selectedPoint[0], selectedPoint[1], Number(range.value), "range");
      settings.append(field(h(2), range), action(t(21), () => {
        const points = new Map(layout.points);
        points.delete(selected);
        return updateLayout(points);
      }));
      const advance = node("input");
      Object.assign(advance, {type: "number", min: 0, max: 1000, step: 1, required: true,
        value: selectedPoint[3] || 0, title: g(4)});
      const lampId = selected;
      advance.onchange = () => {
        if (!advance.reportValidity()) return;
        const points = new Map(layout.points);
        const [x, y, size = defaultSize] = points.get(lampId);
        points.set(lampId, advance.valueAsNumber ? [x, y, size, advance.valueAsNumber] : [x, y, size]);
        return updateLayout(points, {}, "advance");
      };
      settings.append(field(g(3), advance), node("small", g(4)));
      if (focusId === "range") focus = range;
      if (focusId === "advance") focus = advance;
    } else if (lights.has(selected)) {
      settings.append(action(t(20), () => setPosition(selected, 50, 50)));
    }
    const editor = node("div", "", "house-editor");
    const canvas = node("div", "", "house-canvas");
    canvas.append(stage, settings);
    editor.append(canvas, panel);
    spatialSection.replaceChildren(toolbar, spatialStatus, node("p", h(4)), editor, effectControls(stage));
    focus?.focus();
  }

  return (page, data) => {
    const visible = page === "home" || page === "house";
    const opening = visible && page !== activePage;
    activePage = page;
    mount.hidden = page !== "home";
    house.hidden = page !== "house";
    nav.textContent = houseTitle.textContent = h(0);
    nav.setAttribute("aria-current", page === "house" ? "page" : "false");
    if (!visible) {
      clearInterval(timer);
      timer = undefined;
      return;
    }
    if (opening) {
      (page === "house" ? house : mount).append(syncStatus);
      if (!initialized) syncStatus.textContent = msg(0);
      refresh();
      timer ??= setInterval(refresh, 1500);
    }
    if (!data || gesture) return;
    inventory = data;
    const nextSignature = JSON.stringify([language(), data.groups, data.scenes,
      (data.lights || []).map(light => [light.id, light.name, light.product_code])]);
    if (initialized && signature !== nextSignature) {
      signature = nextSignature;
      renderShows();
      renderSpatial();
      updatePlaybackStatus();
    }
    if (page === "house") refreshEffectButtons?.();
  };
};
