window.createLightingTools = ({mount, api, node, field, language}) => {
  const labels = {
    nl: ["Showbouwer", "Shownaam", "Scène", "Wachttijd (sec.)", "Stap toevoegen", "Omhoog", "Omlaag", "Verwijderen", "Opslaan", "Afspelen", "Stoppen", "Maak eerst een scène voor een gemengde groep op Home.", "Stap", "Show klaar", "Show gestopt", "Show onderbroken", "Geen bevestiging", "Spatial Light Studio", "Kies een foto", "Kies een lamp", "Plaats in het midden", "Verwijder plaatsing", "Klik op de foto om de gekozen lamp te plaatsen. Verplaats een markering met de pijltjestoetsen.", "Foto wissen", "Kies een geldige JPG, PNG of WebP van maximaal 15 MB.", "Opslaan in deze browser is mislukt.", "Shows en foto-indeling worden bewaard in deze browser. Laat deze pagina open tijdens het afspelen.", "Groep", "Nieuwe show", "Bewerken", "Definieer minimaal één geldige stap.", "Onbekende lamp", "Locatie", "Foto van de ruimte", "Scène of groep ontbreekt", "Opdrachten gedeeltelijk uitgevoerd"],
    en: ["Show builder", "Show name", "Scene", "Hold (sec.)", "Add step", "Move up", "Move down", "Remove", "Save", "Play", "Stop", "First create a scene for a mixed group on Home.", "Step", "Show complete", "Show stopped", "Show interrupted", "Unconfirmed", "Spatial Light Studio", "Choose a photo", "Choose a light", "Place in the centre", "Remove placement", "Click the photo to place the selected light. Move a marker with the arrow keys.", "Clear photo", "Choose a valid JPG, PNG or WebP up to 15 MB.", "Could not save in this browser.", "Shows and the photo layout are saved in this browser. Keep this page open during playback.", "Group", "New show", "Edit", "Add at least one valid step.", "Unknown light", "Position", "Photo of the space", "Scene or group missing", "Some commands did not complete"],
    de: ["Show-Editor", "Showname", "Szene", "Haltedauer (Sek.)", "Schritt hinzufügen", "Nach oben", "Nach unten", "Entfernen", "Speichern", "Abspielen", "Stoppen", "Erstelle zuerst auf der Startseite eine Szene für eine gemischte Gruppe.", "Schritt", "Show beendet", "Show gestoppt", "Show unterbrochen", "Unbestätigt", "Spatial Light Studio", "Foto auswählen", "Lampe auswählen", "In der Mitte platzieren", "Position entfernen", "Klicke auf das Foto, um die Lampe zu platzieren. Verschiebe Marker mit den Pfeiltasten.", "Foto löschen", "Wähle ein gültiges JPG, PNG oder WebP bis 15 MB.", "Speichern im Browser fehlgeschlagen.", "Shows und das Fotolayout werden in diesem Browser gespeichert. Lasse diese Seite während der Wiedergabe geöffnet.", "Gruppe", "Neue Show", "Bearbeiten", "Füge mindestens einen gültigen Schritt hinzu.", "Unbekannte Lampe", "Position", "Foto des Raums", "Szene oder Gruppe fehlt", "Einige Befehle wurden nicht ausgeführt"],
    es: ["Editor de espectáculos", "Nombre", "Escena", "Pausa (s)", "Añadir paso", "Subir", "Bajar", "Quitar", "Guardar", "Reproducir", "Detener", "Crea primero una escena para un grupo mixto en Inicio.", "Paso", "Espectáculo terminado", "Espectáculo detenido", "Espectáculo interrumpido", "Sin confirmar", "Spatial Light Studio", "Elegir foto", "Elegir luz", "Colocar en el centro", "Quitar posición", "Haz clic en la foto para colocar la luz. Usa las flechas para mover un marcador.", "Borrar foto", "Elige un JPG, PNG o WebP válido de hasta 15 MB.", "No se pudo guardar en este navegador.", "Los espectáculos y la distribución se guardan en este navegador. Mantén abierta esta página durante la reproducción.", "Grupo", "Nuevo espectáculo", "Editar", "Añade al menos un paso válido.", "Luz desconocida", "Posición", "Foto del espacio", "Falta la escena o el grupo", "Algunos comandos no se completaron"],
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

  const saved = read(showKey, []);
  let shows = Array.isArray(saved) ? saved : [];
  const storedLayout = read(spatialKey, {});
  let layout = {photo: storedLayout.photo || "", points: new Map(Array.isArray(storedLayout.points) ? storedLayout.points : [])};
  let inventory = {};
  let signature;
  let draft = {name: "", group: "", steps: []};
  let active;
  let selected = "";
  let photoRequest = 0;
  const t = index => (labels[language()] || labels.nl)[index];

  function save(key, value, status) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      status.textContent = "";
      return true;
    } catch {
      status.textContent = t(25);
      return false;
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

  function hold(seconds, signal) {
    return new Promise(resolve => {
      if (signal.aborted) return resolve();
      const finish = () => {
        clearTimeout(timer);
        signal.removeEventListener("abort", finish);
        resolve();
      };
      const timer = setTimeout(finish, seconds * 1000);
      signal.addEventListener("abort", finish, {once: true});
    });
  }

  async function play(show) {
    const controller = new AbortController();
    active = controller;
    renderShows();
    let outcome = 13;
    let uncertain = false;
    let partial = false;
    try {
      for (const [index, step] of show.steps.entries()) {
        if (controller.signal.aborted) break;
        if (!valid(show)) throw new Error("missing_scene");
        showStatus.textContent = t(12) + " " + (index + 1) + " / " + show.steps.length;
        const {results} = await api("lighting/scenes/" + encodeURIComponent(step.scene) + "/apply", {});
        const states = Object.values(results).flatMap(commands => Object.values(commands));
        if (!states.some(state => state === "accepted" || state === "unconfirmed")) throw new Error("scene_failed");
        uncertain ||= states.includes("unconfirmed");
        partial ||= states.includes("failed") || states.includes("skipped");
        await hold(step.seconds, controller.signal);
      }
    } catch {
      outcome = 15;
    } finally {
      if (controller.signal.aborted) outcome = 14;
      active = undefined;
      showStatus.textContent = [t(outcome), uncertain && t(16), partial && t(35)].filter(Boolean).join(" · ");
      renderShows();
    }
  }

  function renderShows() {
    const list = node("div", "", "lighting-controls");
    for (const show of shows) {
      const card = node("article", "", "lighting-card");
      const playable = valid(show);
      card.append(node("h4", show.name), node("p", playable ? inventory.groups[show.group].name : t(34)),
        action(t(9), () => play(show), Boolean(active) || !playable),
        action(t(29), () => {
          draft = {...show, steps: show.steps.map(step => ({...step}))};
          renderShows();
        }, Boolean(active)),
        action(t(7), () => {
          if (!window.confirm(t(7) + " · " + show.name + "?")) return;
          const remaining = shows.filter(item => item.id !== show.id);
          if (!save(showKey, remaining, showStatus)) return;
          shows = remaining;
          if (draft.id === show.id) draft = {name: "", group: "", steps: []};
          renderShows();
        }, Boolean(active)));
      list.append(card);
    }

    const groups = Object.entries(inventory.groups || {}).filter(([id]) => scenes(id).length)
      .map(([id, group]) => [id, group.name]);
    const form = node("form", "", "lighting-show-form");
    if (groups.length && !active) {
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
      form.onsubmit = event => {
        event.preventDefault();
        const name = draft.name.trim();
        if (!name || !valid(draft) || (!draft.id && shows.length >= maxShows) ||
            draft.steps.some(step => !Number.isInteger(step.seconds) || step.seconds < 1 || step.seconds > 300)) {
          showStatus.textContent = t(30);
          return;
        }
        const show = {...draft, name, id: draft.id || (Date.now().toString(36) + Math.random().toString(36).slice(2))};
        const updated = draft.id ? shows.map(item => item.id === draft.id ? show : item) : [...shows, show];
        if (!save(showKey, updated, showStatus)) return;
        shows = updated;
        draft = {name: "", group: show.group, steps: []};
        renderShows();
      };
    } else if (!active) {
      form.append(node("p", t(11)));
    }
    const header = node("div", "", "lighting-heading");
    header.append(node("h3", t(0)));
    if (active) header.append(action(t(10), () => active?.abort()));
    showSection.replaceChildren(header, node("p", t(26)), showStatus, list, form);
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
      return canvas.toDataURL("image/jpeg", 0.82);
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  function updateLayout(photo, points) {
    if (!save(spatialKey, {photo, points: [...points]}, spatialStatus)) return false;
    layout = {photo, points};
    return true;
  }

  function setPosition(id, x, y) {
    const points = new Map(layout.points);
    const clamp = value => Math.max(0, Math.min(100, value));
    points.set(id, [clamp(x), clamp(y)]);
    if (updateLayout(layout.photo, points)) renderSpatial(id);
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
      const token = ++photoRequest;
      try {
        const photo = await importPhoto(file);
        if (token === photoRequest && updateLayout(photo, new Map())) renderSpatial();
      } catch {
        if (token === photoRequest) spatialStatus.textContent = t(24);
      } finally {
        upload.value = "";
      }
    };
    const toolbar = node("div", "", "lighting-controls");
    toolbar.append(field(t(18), upload));
    if (!layout.photo) {
      spatialSection.replaceChildren(node("h3", t(17)), spatialStatus, toolbar);
      return;
    }
    const select = dropdown(lights, selected, t(19));
    select.onchange = () => { selected = select.value; renderSpatial(); };
    const photo = node("img");
    photo.src = layout.photo;
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
        if (updateLayout(layout.photo, points)) renderSpatial();
      }, !layout.points.has(selected)),
      action(t(23), () => {
        if (!window.confirm(t(23) + "?")) return;
        photoRequest++;
        if (updateLayout("", new Map())) renderSpatial();
      }));
    spatialSection.replaceChildren(node("h3", t(17)), spatialStatus, toolbar, node("p", t(22)), stage);
    focus?.focus();
  }

  return (visible, data) => {
    mount.hidden = !visible;
    if (!visible) {
      active?.abort();
      return;
    }
    if (!data) return;
    inventory = data;
    const nextSignature = JSON.stringify([language(), data.groups, data.scenes,
      (data.lights || []).map(light => [light.id, light.name])]);
    if (signature !== nextSignature) {
      signature = nextSignature;
      renderShows();
      renderSpatial();
    }
  };
};
