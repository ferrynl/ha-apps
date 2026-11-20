window.createLightingTools = ({mount, api, node, field, language}) => {
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
  const showKey = "christmas-mixed-shows-v1";
  const spatialKey = "christmas-spatial-layout-v1";
  const maxSteps = 20;
  const maxShows = 20;
  const showSection = node("section", "", "lighting-tool");
  const spatialSection = node("section", "", "lighting-tool");
  const showStatus = node("p");
  const spatialStatus = node("p");
  showStatus.setAttribute("role", "status");
  spatialStatus.setAttribute("role", "status");
  showSection.append(showStatus);
  spatialSection.append(spatialStatus);
  mount.append(showSection, spatialSection);

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
  let photoElement = node("img");
  const syncStatus = node("p");
  syncStatus.setAttribute("role", "status");
  mount.prepend(syncStatus);
  const t = index => (labels[language()] || labels.nl)[index];
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
    if (changed) updatePlaybackStatus();
    if (inventory && (showsChanged || runningChanged)) renderShows();
    if (inventory && layoutChanged) renderSpatial(focusId);
  }

  function updatePlaybackStatus() {
    const state = playback.state;
    if (state === "idle") return;
    const headline = state === "playing" ? t(12) + " " + playback.step + " / " + playback.total
      : state === "stopping" ? msg(6)
      : t({complete: 13, stopped: 14, failed: 15}[state]);
    showStatus.textContent = [headline, playback.uncertain && t(16), playback.partial && t(35)]
      .filter(Boolean).join(" · ");
  }

  async function refresh() {
    if (busy || reading || mount.hidden) return;
    reading = true;
    const request = generation;
    try {
      const data = await api("lighting/projects");
      if (request !== generation) return;
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
    showSection.replaceChildren(header, node("p", t(26)), showStatus, list, form);
    if (legacyShows.length || legacyLayout.photo) showSection.append(action(msg(2), migrate));
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

  async function migrate() {
    const body = {action: "import", shows: legacyShows, points: legacyLayout.points || []};
    if (!layout.photoVersion && /^data:image\/jpeg;base64,/.test(legacyLayout.photo || "")) {
      try {
        body.photo = await importPhoto(await (await fetch(legacyLayout.photo)).blob());
      } catch {
        showStatus.textContent = t(24);
        return;
      }
    }
    const data = await change(body, showStatus);
    if (!data) return;
    if (!legacyLayout.photo || data.imported_photo) {
      legacyLayout = {};
      try { localStorage.removeItem(spatialKey); } catch {}
    }
    legacyShows = [];
    try { localStorage.removeItem(showKey); } catch {}
    showStatus.textContent = legacyLayout.photo ? msg(4) : msg(3);
    renderShows();
  }

  function updateLayout(points, options = {}, focusId) {
    return change({action: "layout", revision: layout.revision, points: [...points], ...options},
      spatialStatus, focusId);
  }

  function setPosition(id, x, y) {
    const points = new Map(layout.points);
    const clamp = value => Math.max(0, Math.min(100, value));
    points.set(id, [clamp(x), clamp(y)]);
    return updateLayout(points, {}, id);
  }

  function renderSpatial(focusId) {
    const lights = (inventory.lights || []).map(light => [light.id, light.name]);
    const names = new Map(lights);
    for (const id of layout.points.keys()) {
      if (!names.has(id)) {
        const name = t(31) + " · " + id;
        lights.push([id, name]);
        names.set(id, name);
      }
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
    if (!layout.photoVersion) {
      spatialSection.replaceChildren(node("h3", t(17)), spatialStatus, toolbar);
      return;
    }
    const select = dropdown(lights, selected, t(19));
    select.onchange = () => { selected = select.value; renderSpatial(); };
    const photo = photoElement;
    photo.alt = t(33);
    const stage = node("div", "", "lighting-spatial-stage");
    stage.append(photo);
    photo.onclick = event => {
      const rect = photo.getBoundingClientRect();
      if (selected && names.has(selected)) setPosition(selected,
        100 * (event.clientX - rect.left) / rect.width, 100 * (event.clientY - rect.top) / rect.height);
    };
    const markerKeys = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
    let focus;
    for (const [id, [x, y]] of layout.points) {
      const name = names.get(id) || t(31);
      const marker = action(name, () => { selected = id; renderSpatial(id); });
      marker.className = "lighting-spatial-marker";
      marker.style.left = x + "%";
      marker.style.top = y + "%";
      marker.setAttribute("aria-label", name + " · " + t(32) + " " + Math.round(x) + "%, " + Math.round(y) + "%");
      marker.setAttribute("aria-pressed", String(id === selected));
      marker.onkeydown = event => {
        const offset = markerKeys[event.key];
        if (!offset) return;
        event.preventDefault();
        setPosition(id, x + offset[0], y + offset[1]);
      };
      stage.append(marker);
      if (id === focusId) focus = marker;
    }
    toolbar.append(field(t(19), select),
      action(t(20), () => setPosition(selected, 50, 50), !names.has(selected)),
      action(t(21), () => {
        const points = new Map(layout.points);
        points.delete(selected);
        return updateLayout(points);
      }, !layout.points.has(selected)),
      action(t(23), () => {
        if (!window.confirm(t(23) + "?")) return;
        return updateLayout(new Map(), {photo: null});
      }));
    spatialSection.replaceChildren(node("h3", t(17)), spatialStatus, toolbar, node("p", t(22)), stage);
    focus?.focus();
  }

  return (visible, data) => {
    const opening = mount.hidden && visible;
    mount.hidden = !visible;
    if (!visible) {
      clearInterval(timer);
      timer = undefined;
      return;
    }
    if (opening) {
      if (!initialized) syncStatus.textContent = msg(0);
      refresh();
      timer = setInterval(refresh, 1500);
    }
    if (!data) return;
    inventory = data;
    const nextSignature = JSON.stringify([language(), data.groups, data.scenes,
      (data.lights || []).map(light => [light.id, light.name])]);
    if (initialized && signature !== nextSignature) {
      signature = nextSignature;
      renderShows();
      renderSpatial();
    }
  };
};
