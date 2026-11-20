(() => {
  const words = {
    nl: ["Home", "Alle lampen", "Vernieuwen", "Verbonden", "Niet bereikbaar", "Status onbekend", "Govee · onbevestigd", "Aan", "Uit", "Helderheid", "Kleur", "Nog geen lampen", "Verbindingen", "Apparaten zoeken", "Koppelen", "Opnieuw koppelen", "Apparaat-ID", "LAN-adres", "Certificaat ophalen", "SHA256-vingerafdruk", "Vergelijk deze vingerafdruk via een onafhankelijke, vertrouwde bron. Ga alleen door als je het certificaat vertrouwt.", "Druk vlak voor het koppelen op de fysieke knop van de Hue Bridge.", "Schakel LAN-bediening in via de Govee-app.", "Gemengde groepen", "Groepsnaam", "Opslaan", "Bewerken", "Verwijderen", "Annuleren", "Gelukt", "Onbevestigd", "Overgeslagen", "Mislukt", "Verbinding beheren", "Kies lampen", "Geen apparaten gevonden", "Gegevens laden…", "Onbekende lamp", "Gekoppeld"],
    en: ["Home", "All lights", "Refresh", "Connected", "Unavailable", "Status unknown", "Govee · unconfirmed", "On", "Off", "Brightness", "Color", "No lights yet", "Connections", "Find devices", "Pair", "Reconnect", "Device ID", "LAN address", "Inspect certificate", "SHA256 fingerprint", "Compare this fingerprint through an independent, trusted source. Continue only if you trust the certificate.", "Press the physical Hue Bridge button just before pairing.", "Enable LAN control in the Govee app.", "Mixed groups", "Group name", "Save", "Edit", "Delete", "Cancel", "Accepted", "Unconfirmed", "Skipped", "Failed", "Manage connection", "Choose lights", "No devices found", "Loading…", "Unavailable light", "Paired"],
    de: ["Start", "Alle Lampen", "Aktualisieren", "Verbunden", "Nicht erreichbar", "Status unbekannt", "Govee · unbestätigt", "Ein", "Aus", "Helligkeit", "Farbe", "Noch keine Lampen", "Verbindungen", "Geräte suchen", "Koppeln", "Erneut koppeln", "Geräte-ID", "LAN-Adresse", "Zertifikat abrufen", "SHA256-Fingerabdruck", "Vergleiche diesen Fingerabdruck mit einer unabhängigen, vertrauenswürdigen Quelle. Fahre nur fort, wenn du dem Zertifikat vertraust.", "Drücke kurz vor dem Koppeln die Taste an der Hue Bridge.", "Aktiviere die LAN-Steuerung in der Govee-App.", "Gemischte Gruppen", "Gruppenname", "Speichern", "Bearbeiten", "Löschen", "Abbrechen", "Angenommen", "Unbestätigt", "Übersprungen", "Fehlgeschlagen", "Verbindung verwalten", "Lampen auswählen", "Keine Geräte gefunden", "Wird geladen…", "Nicht erreichbare Lampe", "Gekoppelt"],
    es: ["Inicio", "Todas las luces", "Actualizar", "Conectado", "No disponible", "Estado desconocido", "Govee · sin confirmar", "Encender", "Apagar", "Brillo", "Color", "Aún no hay luces", "Conexiones", "Buscar dispositivos", "Vincular", "Volver a vincular", "ID del dispositivo", "Dirección LAN", "Consultar certificado", "Huella SHA256", "Compara esta huella con una fuente fiable e independiente. Continúa solo si confías en el certificado.", "Pulsa el botón físico del puente Hue justo antes de vincularlo.", "Activa el control LAN en la aplicación Govee.", "Grupos mixtos", "Nombre del grupo", "Guardar", "Editar", "Eliminar", "Cancelar", "Aceptado", "Sin confirmar", "Omitido", "Error", "Gestionar conexión", "Elegir luces", "No se encontraron dispositivos", "Cargando…", "Luz no disponible", "Vinculado"],
  };
  const collectionWords = {
    nl: ["Hue-kamers en zones", "Kamer", "Zone", "Hue-scènes", "Geen kamers of zones gevonden.", "Stop de Hue-test of gemengde muziek op deze bridge en probeer opnieuw."],
    en: ["Hue rooms and zones", "Room", "Zone", "Hue scenes", "No rooms or zones found.", "Stop the Hue test or mixed music on this bridge and try again."],
    de: ["Hue-Räume und -Zonen", "Raum", "Zone", "Hue-Szenen", "Keine Räume oder Zonen gefunden.", "Beende den Hue-Test oder die gemischte Musik auf dieser Bridge und versuche es erneut."],
    es: ["Habitaciones y zonas Hue", "Habitación", "Zona", "Escenas Hue", "No se encontraron habitaciones ni zonas.", "Detén la prueba Hue o la música mixta en este puente e inténtalo de nuevo."],
  };
  const previewWords = {
    nl: ["Afbeelding kiezen", "Afbeelding verwijderen", "Masterfader muziek"],
    en: ["Choose image", "Remove image", "Music master fader"],
    de: ["Bild auswählen", "Bild entfernen", "Musik-Masterfader"],
    es: ["Elegir imagen", "Eliminar imagen", "Control maestro de música"],
  };
  const previewText = () => previewWords[el("language").value] || previewWords.nl;
  const temperatureLabels = {
    nl: "Wittemperatuur", en: "White temperature", de: "Weißtemperatur", es: "Temperatura del blanco",
  };
  const sceneWords = {
    nl: ["Scènes", "Scènenaam", "Groep", "Afspelen", "Groep ontbreekt", "Maak een gemengde groep om een scène op te slaan."],
    en: ["Scenes", "Scene name", "Group", "Apply", "Group missing", "Create a mixed group to save a scene."],
    de: ["Szenen", "Szenenname", "Gruppe", "Anwenden", "Gruppe fehlt", "Erstelle eine gemischte Gruppe, um eine Szene zu speichern."],
    es: ["Escenas", "Nombre de escena", "Grupo", "Aplicar", "Falta el grupo", "Crea un grupo mixto para guardar una escena."],
  };
  const musicWords = {
    nl: ["Muziek starten", "Muziek stoppen", "Wacht op LedFX", "LedFX actief", "Deelnemend", "Overgeslagen"],
    en: ["Start music", "Stop music", "Waiting for LedFX", "LedFX active", "Participating", "Skipped"],
    de: ["Musik starten", "Musik stoppen", "Warte auf LedFX", "LedFX aktiv", "Teilnehmend", "Übersprungen"],
    es: ["Iniciar música", "Detener música", "Esperando a LedFX", "LedFX activo", "Participan", "Omitidas"],
  };
  const timingWords = {
    nl: ["Frameleeftijd", "Opdrachtduur", "Mislukt", "Gemeten in de app, zonder reactietijd van de lamp."],
    en: ["Frame age", "Command duration", "Failed", "Measured in the app, excluding the light’s reaction time."],
    de: ["Frame-Alter", "Befehlsdauer", "Fehlgeschlagen", "In der App gemessen, ohne Reaktionszeit der Lampe."],
    es: ["Antigüedad del fotograma", "Duración del comando", "Fallidos", "Medido en la aplicación, sin el tiempo de reacción de la luz."],
  };
  const hueTestWords = {
    nl: ["Kies een Hue-lamp", "Identificeren", "Aan/uit-test", "Dimtest", "RGB-test", "Regenboog", "Warm/koel wit", "Hue-test stoppen", "Hue-test loopt", "Vorige stand hersteld", "Hue-test mislukt. Controleer de lamp en stop eventuele effecten.", "Vorige stand kon niet worden hersteld.", "Tests gelden voor de hele Hue-lamp. LED-volgorde en richtingstests staan bij Twinkly.", "De bridge heeft het herstel van de vorige stand nog niet bevestigd."],
    en: ["Choose a Hue light", "Identify", "Power test", "Dimmer test", "RGB test", "Rainbow", "Warm/cool white", "Stop Hue test", "Hue test running", "Previous state restored", "Hue test failed. Check the light and stop any effects.", "Could not restore the previous state.", "Tests apply to the whole Hue light. LED order and direction tests are under Twinkly.", "The bridge did not confirm that the previous state was restored."],
    de: ["Hue-Lampe auswählen", "Identifizieren", "Ein-/Aus-Test", "Dimmtest", "RGB-Test", "Regenbogen", "Warm-/Kaltweiß", "Hue-Test stoppen", "Hue-Test läuft", "Vorheriger Zustand wiederhergestellt", "Hue-Test fehlgeschlagen. Prüfe die Lampe und beende aktive Effekte.", "Der vorherige Zustand konnte nicht wiederhergestellt werden.", "Tests gelten für die ganze Hue-Lampe. LED-Reihenfolge und Richtungstests findest du bei Twinkly.", "Die Bridge hat den vorherigen Zustand noch nicht bestätigt."],
    es: ["Elige una luz Hue", "Identificar", "Prueba de encendido", "Prueba de brillo", "Prueba RGB", "Arcoíris", "Blanco cálido/frío", "Detener prueba Hue", "Prueba Hue en curso", "Estado anterior restaurado", "La prueba Hue falló. Comprueba la luz y detén cualquier efecto.", "No se pudo restaurar el estado anterior.", "Las pruebas se aplican a toda la luz Hue. Las pruebas de orden LED y dirección están en Twinkly.", "El puente no ha confirmado que se haya restaurado el estado anterior."],
  };
  const goveeTestWords = {
    nl: ["Kies een Govee-lamp", "Identificeren", "Aan/uit-test", "Dimtest", "RGB-test", "Regenboog", "", "Govee-test stoppen", "Govee-test loopt", "Vorige stand hersteld", "Govee-test mislukt. Controleer LAN-bediening en de lampstatus.", "Vorige stand kon niet worden hersteld.", "Tests gelden voor de hele Govee-lamp. Beschikbaarheid hangt af van de LAN-status.", "De lamp heeft het herstel niet bevestigd."],
    en: ["Choose a Govee light", "Identify", "Power test", "Dimmer test", "RGB test", "Rainbow", "", "Stop Govee test", "Govee test running", "Previous state restored", "Govee test failed. Check LAN control and the light status.", "Could not restore the previous state.", "Tests apply to the whole Govee light. Availability depends on LAN status.", "The light did not confirm restoration."],
    de: ["Govee-Lampe auswählen", "Identifizieren", "Ein-/Aus-Test", "Dimmtest", "RGB-Test", "Regenbogen", "", "Govee-Test stoppen", "Govee-Test läuft", "Vorheriger Zustand wiederhergestellt", "Govee-Test fehlgeschlagen. Prüfe LAN-Steuerung und Lampenstatus.", "Der vorherige Zustand konnte nicht wiederhergestellt werden.", "Tests gelten für die ganze Govee-Lampe. Die Verfügbarkeit hängt vom LAN-Status ab.", "Die Lampe hat die Wiederherstellung nicht bestätigt."],
    es: ["Elige una luz Govee", "Identificar", "Prueba de encendido", "Prueba de brillo", "Prueba RGB", "Arcoíris", "", "Detener prueba Govee", "Prueba Govee en curso", "Estado anterior restaurado", "La prueba Govee falló. Comprueba el control LAN y el estado.", "No se pudo restaurar el estado anterior.", "Las pruebas se aplican a toda la luz Govee. La disponibilidad depende del estado LAN.", "La luz no confirmó la restauración."],
  };
  const brands = {twinkly: "Twinkly", hue: "Philips Hue", govee: "Govee"};
  const wordmarks = {twinkly: "twinkly-nav-logo.svg", hue: "hue-app-icon.webp", govee: "govee-logo.png"};
  const el = id => document.getElementById(id);
  const panel = el("lighting-panel");
  const settings = el("lighting-settings");
  const studio = el("twinkly-lighting");
  const hueCollections = el("hue-collections");
  const feedback = el("lighting-feedback");
  const t = i => (words[el("language").value] || words.nl)[i];
  let data;
  let pending;
  let editing;
  let editingScene;
  let context = "";
  let groupBusy = false;
  let collections = [];
  let collectionsStatus = "loading";
  let collectionsRead = 0;
  const sceneImageRevisions = new Map();

  function node(tag, text, className) {
    const item = document.createElement(tag);
    if (text) item.textContent = text;
    if (className) item.className = className;
    return item;
  }

  function button(text, handler) {
    const item = node("button", text);
    item.type = "button";
    item.addEventListener("click", () => task(item, handler));
    return item;
  }

  async function task(item, callback) {
    item.disabled = true;
    item.dataset.running = "";
    try {
      await callback();
    } catch (error) {
      feedback.textContent = error.message === "hue_bridge_busy"
        ? (collectionWords[el("language").value] || collectionWords.nl)[5]
        : t(error.message === "pairing_permission" ? 21 : 32);
    } finally {
      item.disabled = false;
      delete item.dataset.running;
    }
  }

  async function api(path, body) {
    const response = await fetch(path, body === undefined ? {cache: "no-store"} : {
      method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result;
  }

  function status(light) {
    if (light.provider === "govee") return t(6) + (light.status === "unknown" ? " · " + t(5) : "");
    return t({online: 3, unavailable: 4, unknown: 5}[light.status] ?? 5);
  }

  function stateColor(color) {
    return color?.length === 3 ? "#" + color.map(channel => channel.toString(16).padStart(2, "0")).join("") : null;
  }

  function field(caption, input) {
    const label = node("label", caption);
    label.append(input);
    return label;
  }

  function controls(card, lights, target, state = {}) {
    const available = lights.filter(light => light.status !== "unavailable");
    const capable = key => available.some(light => light.capabilities[key]);
    const row = node("div", "", "lighting-controls");
    const send = async (action, value) => {
      const result = await api("lighting/control", {...target, action, value});
      const outcomes = ["accepted", "unconfirmed", "skipped", "failed"];
      feedback.textContent = outcomes.map((outcome, i) => {
        const count = Object.values(result.results).filter(value => value === outcome).length;
        return count ? t(29 + i) + " · " + count : "";
      }).filter(Boolean).join(" / ");
      await refresh(false);
    };
    if (capable("power")) {
      for (const [value, index] of [[true, 7], [false, 8]]) {
        const toggle = button(t(index), () => send("power", value));
        if (typeof state.on === "boolean") toggle.setAttribute("aria-pressed", String(state.on === value));
        row.append(toggle);
      }
    }
    if (capable("brightness")) {
      const input = node("input");
      input.type = "range";
      input.min = 1;
      input.max = 100;
      input.value = state.brightness ?? 50;
      input.addEventListener("change", () => task(input, () => send("brightness", Number(input.value))));
      row.append(field(t(9) + (state.brightness == null ? "" : " · " + Math.round(state.brightness) + "%"), input));
    }
    if (capable("rgb")) {
      const input = node("input");
      input.type = "color";
      input.value = stateColor(state.color) || "#ffffff";
      input.addEventListener("change", () => task(input, () => send("color",
        input.value.slice(1).match(/../g).map(channel => parseInt(channel, 16)))));
      row.append(field(t(10), input));
    }
    if (target.id && capable("temperature") && lights[0].provider === "hue") {
      const {min, max} = lights[0].temperature_mirek;
      const caption = temperatureLabels[el("language").value] || temperatureLabels.nl;
      const input = node("input");
      input.type = "range";
      input.dir = "rtl";
      input.setAttribute("aria-label", caption);
      input.min = min;
      input.max = max;
      input.value = state.mirek ?? Math.round((min + max) / 2);
      const label = field(caption, input);
      const reading = node("span");
      label.append(reading);
      const update = () => {
        const kelvin = Math.round(1000000 / Number(input.value));
        reading.textContent = kelvin + " K";
        input.setAttribute("aria-valuetext", reading.textContent);
      };
      if (state.mirek != null) update();
      input.addEventListener("input", update);
      input.addEventListener("change", () => task(input, () => send("temperature", Number(input.value))));
      row.append(label);
    }
    if (target.id && capable("temperature") && lights[0].provider === "govee") {
      const caption = temperatureLabels[el("language").value] || temperatureLabels.nl;
      const input = node("input");
      input.type = "range";
      input.min = 2000;
      input.max = 9000;
      input.step = 1;
      input.setAttribute("aria-label", caption);
      input.value = state.color_temperature_kelvin;
      const reading = node("span");
      const label = field(caption, input);
      label.append(reading);
      const update = () => {
        reading.textContent = input.value + " K";
        input.setAttribute("aria-valuetext", reading.textContent);
      };
      update();
      input.addEventListener("input", update);
      input.addEventListener("change", () => task(input, () => send("temperature", Number(input.value))));
      row.append(label);
    }
    card.append(row);
  }

  function lightCard(light) {
    const card = node("article", "", "lighting-card");
    card.dataset.provider = light.provider;
    const head = node("div", "", "lighting-card-head");
    const mark = node("span", "", "lighting-brand-mark");
    const logo = node("img", "", "brand-wordmark brand-wordmark-" + light.provider);
    logo.src = wordmarks[light.provider];
    logo.alt = "";
    mark.append(logo);
    const color = stateColor(light.state?.color);
    if (color && light.state.on !== false) mark.style.setProperty("--lamp-color", color);
    mark.setAttribute("aria-hidden", "true");
    const title = node("div");
    title.append(node("p", brands[light.provider], "lighting-brand"), node("h3", light.name));
    head.append(mark, title);
    card.append(head, node("p", status(light), "lighting-state"));
    controls(card, [light], {id: light.id}, light.state);
    return card;
  }

  function groupList() {
    const section = node("section", "", "lighting-groups");
    section.append(node("h3", t(23)));
    if (!data.groups) {
      section.append(node("p", t(32)));
      return section;
    }
    const lights = new Map(data.lights.map(light => [light.id, light]));
    const grid = node("div", "", "lighting-grid");
    const [startMusic, stopMusic, waitingMusic, activeMusic, participating, skippedMusic] =
      musicWords[el("language").value] || musicWords.nl;
    for (const [id, group] of Object.entries(data.groups)) {
      const card = node("article", "", "lighting-card");
      card.append(node("h3", group.name), node("p", group.members.map(key => lights.get(key)?.name || t(37)).join(" · ")));
      controls(card, group.members.map(key => lights.get(key)).filter(Boolean), {group: id});
      const music = data.music?.group === id;
      if (music) {
        card.append(node("p", data.music.live ? activeMusic : waitingMusic));
        const master = node("input");
        master.type = "range";
        master.min = 1;
        master.max = 100;
        master.value = data.music.level ?? 100;
        const reading = node("output");
        const caption = previewText()[2];
        master.setAttribute("aria-label", caption);
        const label = field(caption, master);
        label.append(reading);
        const readLevel = () => {
          reading.value = master.value + "%";
          master.setAttribute("aria-valuetext", reading.value);
        };
        readLevel();
        master.addEventListener("input", readLevel);
        master.addEventListener("change", () => task(master, async () => {
          const result = await api("lighting/music", {group: id, level: Number(master.value)});
          if (data.music.group === id) data.music.level = result.level;
          const failed = Object.values(result.results).filter(status => status === "failed").length;
          feedback.textContent = failed ? t(32) + " · " + failed : "";
        }));
        card.append(label);
        const timings = Object.entries(data.music.timings || {});
        if (timings.length) {
          const [frame, command, failed, hint] = timingWords[el("language").value] || timingWords.nl;
          const measurements = node("ul", "", "lighting-timings");
          for (const [provider, result] of timings) {
            const failures = result.failed ? " · " + failed + ": " + result.failed : "";
            measurements.append(node("li", brands[provider] + " · " + frame + ": " + result.frame_age_ms +
              " ms · " + command + ": " + result.command_ms + " ms" + failures));
          }
          card.append(measurements, node("small", hint));
        }
      }
      card.append(button(music ? stopMusic : startMusic, async () => {
        const result = await api("lighting/music", music ? {stop: true} : {group: id});
        feedback.textContent = music ? "" :
          participating + " · " + result.eligible.length + " / " + skippedMusic + " · " + result.skipped.length;
        await refresh();
      }));
      card.append(button(t(26), () => {
        editing = id;
        render();
        panel.querySelector(".lighting-group-form input").focus();
      }));
      grid.append(card);
    }
    section.append(grid);
    if (!data.lights.length && editing === undefined) return section;
    const group = data.groups[editing];
    const form = node("form", "", "lighting-group-form");
    const name = node("input");
    name.required = true;
    name.maxLength = 60;
    name.value = group?.name || "";
    form.append(field(t(24), name));
    const choices = node("fieldset");
    choices.append(node("legend", t(34)));
    for (const key of new Set([...lights.keys(), ...(group?.members || [])])) {
      const light = lights.get(key);
      const choice = node("input");
      choice.type = "checkbox";
      choice.name = "members";
      choice.value = key;
      choice.checked = group?.members.includes(key) || false;
      choices.append(field(light ? light.name + " · " + brands[light.provider] : t(37), choice));
    }
    const save = node("button", t(25));
    form.append(choices, save);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const members = new FormData(form).getAll("members");
      if (!members.length) {
        feedback.textContent = t(34);
        return;
      }
      task(save, async () => {
        groupBusy = true;
        try {
          await api("lighting/groups", {id: editing, name: name.value, members});
          editing = undefined;
          await refresh();
        } finally {
          groupBusy = false;
        }
      });
    });
    if (group) {
      form.append(button(t(28), () => { editing = undefined; render(); }),
        button(t(27), async () => {
          if (!window.confirm(t(27) + " · " + group.name + "?")) return;
          await api("lighting/groups", {id: editing, delete: true});
          editing = undefined;
          await refresh();
        }));
    }
    section.append(form);
    return section;
  }

  function sceneList() {
    const [title, nameLabel, groupLabel, applyLabel, missingGroup, needsGroup] =
      sceneWords[el("language").value] || sceneWords.nl;
    const section = node("section", "", "lighting-scenes");
    section.append(node("h3", title));
    if (!data.scenes || !data.groups) {
      section.append(node("p", t(32)));
      return section;
    }
    const grid = node("div", "", "lighting-grid");
    const groups = Object.entries(data.groups);
    for (const [id, scene] of Object.entries(data.scenes)) {
      const card = node("article", "", "lighting-card");
      const group = data.groups[scene.group];
      const options = [group?.name || missingGroup, t(scene.on ? 7 : 8)];
      if (scene.brightness != null) options.push(scene.brightness + "%");
      if (scene.color) options.push(stateColor(scene.color));
      const apply = button(applyLabel, async () => {
        const names = new Map(data.lights.map(light => [light.id, light.name]));
        const {results} = await api("lighting/scenes/" + encodeURIComponent(id) + "/apply", {});
        const outcomes = {accepted: 29, unconfirmed: 30, skipped: 31, failed: 32};
        const actions = {power: t(scene.on ? 7 : 8), brightness: t(9), color: t(10)};
        feedback.textContent = Object.entries(results).map(([key, commands]) => {
          const resultsText = Object.entries(commands).map(([action, outcome]) =>
            actions[action] + " " + t(outcomes[outcome])).join(", ");
          return (names.get(key) || t(37)) + " · " + resultsText;
        }).join(" / ");
        await refresh(false);
      });
      apply.disabled = !group;
      card.append(node("h4", scene.name), node("p", options.join(" · ")), apply,
        button(t(26), () => {
          editingScene = id;
          render();
          panel.querySelector(".lighting-scene-form input").focus();
        }));
      grid.append(card);
    }
    section.append(grid);
    if (!groups.length && editingScene === undefined) {
      section.append(node("p", needsGroup));
      return section;
    }

    const scene = data.scenes[editingScene];
    const form = node("form", "", "lighting-form lighting-scene-form");
    const name = node("input");
    name.required = true;
    name.maxLength = 60;
    name.value = scene?.name || "";
    const group = node("select");
    group.required = true;
    const placeholder = node("option", missingGroup);
    placeholder.value = "";
    placeholder.disabled = true;
    group.append(placeholder);
    for (const [id, row] of groups) {
      const option = node("option", row.name);
      option.value = id;
      group.append(option);
    }
    group.value = scene ? (data.groups[scene.group] ? scene.group : "") : groups[0]?.[0] || "";
    const power = node("select");
    for (const [value, label] of [["on", t(7)], ["off", t(8)]]) {
      const option = node("option", label);
      option.value = value;
      power.append(option);
    }
    power.value = scene?.on === false ? "off" : "on";
    const level = node("input");
    level.type = "number";
    level.min = 1;
    level.max = 100;
    level.placeholder = "1–100%";
    level.value = scene?.brightness ?? "";
    const color = node("input");
    color.type = "color";
    color.value = stateColor(scene?.color) || "#ffbf69";
    color.setAttribute("aria-label", t(10));
    const useColor = node("input");
    useColor.type = "checkbox";
    useColor.checked = Boolean(scene?.color);
    const update = () => {
      const on = power.value === "on";
      level.disabled = useColor.disabled = !on;
      color.disabled = !on || !useColor.checked;
    };
    update();
    power.addEventListener("change", update);
    useColor.addEventListener("change", update);
    const save = node("button", t(25));
    form.append(field(nameLabel, name), field(groupLabel, group), field(t(7) + " / " + t(8), power),
      field(t(9), level), field(t(10), useColor), color, save);
    form.addEventListener("submit", event => {
      event.preventDefault();
      task(save, async () => {
        const on = power.value === "on";
        const payload = {id: editingScene, name: name.value, group: group.value, on};
        if (on && level.value) payload.brightness = Number(level.value);
        if (on && useColor.checked) payload.color = color.value.slice(1).match(/../g).map(channel => parseInt(channel, 16));
        await api("lighting/scenes", payload);
        editingScene = undefined;
        await refresh();
      });
    });
    if (scene) {
      form.append(button(t(28), () => { editingScene = undefined; render(); }),
        button(t(27), async () => {
          if (!window.confirm(t(27) + " · " + scene.name + "?")) return;
          await api("lighting/scenes", {id: editingScene, delete: true});
          editingScene = undefined;
          await refresh();
        }));
    }
    section.append(form);
    return section;
  }

  function connectionCard(brand) {
    const card = node("article", "", "lighting-card");
    card.dataset.provider = brand;
    card.append(node("h3", brands[brand]));
    const connections = data.connections[brand];
    const rows = node("div", "", "lighting-connections");
    if (connections === null) rows.append(node("p", t(32)));
    const setup = node("details");
    setup.append(node("summary", t(33)));
    const id = node("input");
    id.maxLength = 128;
    id.required = true;
    const address = node("input");
    address.required = true;
    const pin = node("input");
    pin.maxLength = 64;
    pin.autocomplete = "off";
    pin.required = brand === "hue";
    const found = node("div", "", "lighting-controls");
    const form = node("form", "", "lighting-form");
    const submit = node("button", t(14));
    function select(identifier, ip, reconnect = false) {
      id.value = identifier;
      address.value = ip;
      pin.value = "";
      submit.textContent = t(reconnect ? 15 : 14);
      setup.open = true;
    }
    for (const row of connections || []) {
      const connection = node("div", "", "lighting-connection");
      connection.append(node("span", row.id + " · " + row.address + " · " + status({...row, provider: brand})),
        button(t(15), () => { select(row.id, row.address, true); address.focus(); }));
      rows.append(connection);
    }
    setup.append(node("p", t(brand === "hue" ? 21 : 22)), button(t(13), async () => {
      const result = await api("providers/" + brand + "/discover", {});
      found.replaceChildren();
      for (const device of result.devices) {
        const ip = device.ip || device.addresses?.[0];
        if (!ip) continue;
        found.append(button((device.name || device.sku || device.bridge_id) + " · " + ip,
          () => select(device.bridge_id || device.device, ip)));
      }
      if (!found.childElementCount) found.append(node("p", t(35)));
    }), found);
    form.append(field(t(16), id), field(t(17), address));
    address.addEventListener("input", () => { pin.value = ""; });
    if (brand === "hue") {
      form.append(field(t(19), pin), button(t(18), async () => {
        const ip = address.value;
        const result = await api("providers/hue/certificate", {address: ip});
        if (address.value === ip && form.isConnected && window.confirm(t(20) + "\n\n" + result.certificate_sha256)) {
          pin.value = result.certificate_sha256;
        }
      }));
    }
    form.append(submit);
    form.addEventListener("submit", event => {
      event.preventDefault();
      task(submit, async () => {
        await api("providers/" + brand + "/connect",
          {id: id.value, address: address.value, certificate_sha256: pin.value});
        pin.value = "";
        feedback.textContent = t(38);
        await refresh();
      });
    });
    setup.append(form);
    card.append(rows, setup);
    return card;
  }

  function lampTestPanel(brand, after) {
    const section = node("section", "", "lighting-surface gap provider-test-" + brand);
    after.after(section);
    let choice = "";
    let testStatus;
    let timer;
    let busy = false;

    async function update() {
      clearTimeout(timer);
      try {
        testStatus = await api("lighting/" + brand + "-test");
      } catch {
        testStatus = {result: "failed"};
      }
      if (context === "tests") renderTests();
    }

    function renderTests() {
      clearTimeout(timer);
      const labels = brand === "hue" ? (hueTestWords[el("language").value] || hueTestWords.nl) :
        (goveeTestWords[el("language").value] || goveeTestWords.nl);
      const lights = (data?.lights || []).filter(light => light.provider === brand);
      section.replaceChildren(node("h3", brands[brand]), node("p", labels[12]));
      const select = node("select");
      select.append(new Option(labels[0], ""));
      for (const light of lights) {
        const option = new Option(light.name + " · " + status(light), light.id);
        option.disabled = light.status === "unavailable";
        select.append(option);
      }
      select.value = lights.some(light => light.id === choice && light.status !== "unavailable") ? choice : "";
      const selected = lights.find(light => light.id === select.value);
      select.onchange = () => {
        choice = select.value;
        renderTests();
        section.querySelector("select").focus();
      };
      section.append(field(labels[0], select));
      const actions = node("div", "", "lighting-controls");
      const run = async test => {
        busy = true;
        clearTimeout(timer);
        try {
          testStatus = await api("lighting/" + brand + "-test", {test, id: selected?.id});
        } catch {
          testStatus = {result: "failed"};
        } finally {
          busy = false;
          if (context === "tests") renderTests();
        }
      };
      const running = testStatus?.result === "running";
      const tests = [["identify", "power"], ["power", "power"], ["brightness", "brightness"],
        ["rgb", "rgb"], ["rainbow", "rgb"], ["temperature", "temperature"]];
      for (const [index, [test, capability]] of tests.entries()) {
        if (brand === "govee" && test === "temperature") continue;
        const action = button(labels[index + 1], () => run(test));
        action.disabled = busy || running || !selected?.capabilities[capability] ||
          (brand === "govee" && capability === "rgb" && Boolean(selected?.state.color_temperature_kelvin));
        actions.append(action);
      }
      const stop = button(labels[7], () => run("stop"));
      stop.disabled = busy || !running;
      actions.append(stop);
      const result = {running: 8, restored: 9, failed: 10, restore_failed: 11, restore_unverified: 13}[testStatus?.result];
      section.append(actions);
      if (result != null) {
        const message = node("p", labels[result]);
        message.setAttribute("role", "status");
        section.append(message);
      }
      if (running && !busy) timer = setTimeout(update, 1000);
    }
    return {section, update, render: renderTests};
  }

  const hueTestPanel = lampTestPanel("hue", el("tests-content"));
  const goveeTestPanel = lampTestPanel("govee", hueTestPanel.section);

  function hueSceneCard(bridge, scene, activate) {
    const [chooseImage, removeImage] = previewText();
    const card = node("div", "", "hue-scene-card");
    const path = "providers/hue/scene-image/" + encodeURIComponent(bridge) + "/" + encodeURIComponent(scene.id);
    const play = button(scene.name, activate);
    const cover = node("span", "", "hue-scene-cover");
    cover.setAttribute("aria-hidden", "true");
    const colors = (scene.palette || []).map(stateColor).filter(Boolean);
    if (colors.length === 1) colors.push(colors[0]);
    if (colors.length) {
      cover.style.backgroundImage = "linear-gradient(165deg, #fff2, transparent 48%, #0008), " +
        "linear-gradient(125deg, " + colors.join(", ") + ")";
    }
    if (scene.has_image) {
      const image = node("img");
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => image.remove(), {once: true});
      image.src = path + "?v=" + (sceneImageRevisions.get(path) || 0);
      cover.append(image);
    }
    play.prepend(cover);
    const upload = node("input");
    upload.type = "file";
    upload.accept = "image/jpeg,image/png,image/webp";
    upload.className = "hue-scene-file";
    upload.setAttribute("aria-label", chooseImage + " · " + scene.name);
    const update = async image => {
      await api(path, {image});
      sceneImageRevisions.set(path, Date.now());
      await loadCollections();
    };
    const choose = node("label", "", "hue-scene-upload");
    choose.append(node("span", chooseImage), upload);
    upload.addEventListener("change", () => {
      if (upload.files.length) task(upload, async () => {
        try {
          await update(await encodeImage(upload.files[0]));
        } finally {
          upload.value = "";
        }
      });
    });
    card.append(play, choose);
    if (scene.has_image) {
      const remove = button(removeImage, () => update(null));
      remove.setAttribute("aria-label", removeImage + " · " + scene.name);
      card.append(remove);
    }
    return card;
  }

  function renderCollections() {
    hueCollections.hidden = context !== "hue";
    if (hueCollections.hidden) return;
    const labels = collectionWords[el("language").value] || collectionWords.nl;
    const title = node("h2", labels[0]);
    title.id = "hue-collections-title";
    const heading = node("div", "", "lighting-heading");
    heading.append(title, button(t(2), loadCollections));
    hueCollections.replaceChildren(heading);
    if (collectionsStatus !== "ready") {
      hueCollections.append(node("p", t(collectionsStatus === "loading" ? 36 : 32)));
      return;
    }
    if (!collections.length) hueCollections.append(node("p", labels[4]));
    for (const bridge of collections) {
      const grid = node("div", "", "lighting-grid hue-collection-grid");
      hueCollections.append(node("h3", "Hue Bridge · " + bridge.address), grid);
      if (bridge.status !== "online" || !bridge.collections.length) {
        grid.append(node("p", bridge.status === "online" ? labels[4] : t(4)));
        continue;
      }
      const send = async (id, action, value) => {
        await api("providers/hue/collections/control", {bridge: bridge.id, id, action, value});
        if (context === "hue") {
          feedback.textContent = t(29);
          await Promise.all([loadCollections(), refresh(false).catch(() => {})]);
        }
      };
      for (const collection of bridge.collections) {
        const card = node("article", "", "lighting-card hue-collection");
        card.append(node("p", collection.kind === "room" ? labels[1] : labels[2]),
          node("h4", collection.name));
        const controls = node("div", "", "lighting-controls");
        if (collection.grouped_light && typeof collection.on === "boolean") {
          for (const [value, index] of [[true, 7], [false, 8]]) {
            const toggle = button(t(index), () => send(collection.grouped_light, "power", value));
            toggle.setAttribute("aria-pressed", String(collection.on === value));
            controls.append(toggle);
          }
        }
        if (collection.grouped_light && Number.isFinite(collection.brightness)) {
          const level = node("input");
          level.type = "range";
          level.min = 1;
          level.max = 100;
          level.value = collection.brightness;
          level.addEventListener("change", () => task(level,
            () => send(collection.grouped_light, "brightness", Number(level.value))));
          controls.append(field(t(9), level));
        }
        if (controls.childElementCount) card.append(controls);
        if (collection.scenes.length) {
          const scenes = node("div", "", "hue-scenes");
          for (const scene of collection.scenes) {
            scenes.append(hueSceneCard(bridge.id, scene, () => send(scene.id, "recall")));
          }
          card.append(node("h5", labels[3]), scenes);
        }
        grid.append(card);
      }
    }
  }

  async function loadCollections() {
    const request = ++collectionsRead;
    try {
      const result = await api("providers/hue/collections");
      if (request !== collectionsRead) return;
      collections = result.bridges;
      collectionsStatus = "ready";
    } catch {
      if (request !== collectionsRead) return;
      collectionsStatus = "failed";
    }
    renderCollections();
  }

  const renderTools = window.createLightingTools({
    mount: el("lighting-tools"), api, node, field, language: () => el("language").value,
  });

  function render() {
    renderTools(context === "home", data);
    panel.hidden = !["home", "hue", "govee"].includes(context);
    if (context === "tests") {
      hueTestPanel.render();
      goveeTestPanel.render();
      return;
    }
    const mount = context === "control" ? studio : context === "settings" ? settings : panel;
    if (!["home", "hue", "govee", "control", "settings", "tests"].includes(context)) return;
    mount.replaceChildren();
    const title = context === "settings" ? t(12) : context === "home" ? t(1) : brands[context] || brands.twinkly;
    const heading = node("div", "", "lighting-heading");
    heading.append(node("h2", title), button(t(2), () => refresh()));
    mount.append(heading);
    if (!data) {
      mount.append(node("p", pending ? t(36) : t(32)));
      return;
    }
    const grid = node("div", "", "lighting-grid");
    if (context === "settings") {
      grid.append(connectionCard("hue"), connectionCard("govee"));
    } else {
      const provider = context === "control" ? "twinkly" : context;
      for (const light of data.lights.filter(light => provider === "home" || light.provider === provider)) {
        grid.append(lightCard(light));
      }
      if (!grid.childElementCount) grid.append(node("p", t(11)));
      if (provider === "hue" || provider === "govee") {
        const link = node("a", t(33));
        link.href = "#instellingen";
        heading.append(link);
      }
    }
    mount.append(grid);
    if (context === "home") mount.append(groupList(), sceneList());
  }

  async function refresh(force = true) {
    const previous = data;
    pending ||= api("lighting").then(value => { data = value; }).finally(() => { pending = null; });
    try {
      await pending;
    } finally {
      renderTools(context === "home", data);
      const settingsInUse = context === "settings" && settings.querySelector("details[open]");
      const groupInUse = context === "home" && (groupBusy || panel.querySelector(".lighting-group-form:focus-within, .lighting-scene-form:focus-within"));
      if (force || (!settingsInUse && !groupInUse && JSON.stringify(previous) !== JSON.stringify(data))) {
        render();
      }
    }
  }

  window.addEventListener("lighting-page", event => {
    const previous = context;
    context = event.detail;
    if (previous !== context) feedback.textContent = "";
    if (previous !== context && context === "tests") {
      hueTestPanel.update();
      goveeTestPanel.update();
    }
    el("nav-home").textContent = t(0);
    render();
    if (previous !== context && context === "hue") {
      collectionsStatus = "loading";
      loadCollections();
    }
    renderCollections();
    if (previous !== context && ["home", "hue", "govee", "control", "settings", "tests"].includes(context)) {
      refresh(false).catch(() => { feedback.textContent = t(32); });
    }
  });

  // The existing studio's first synchronous page event may have fired before this script loaded.
  if (el("nav-home")) showPage();
  setInterval(() => {
    if (document.hidden || pending || groupBusy || !["home", "hue", "govee", "control"].includes(context)) return;
    const mount = context === "control" ? studio : panel;
    if (!mount.contains(document.activeElement) && !mount.querySelector(".lighting-group-form input:checked") &&
        !mount.querySelector("button[data-running]")) refresh(false).catch(() => {});
  }, 15000);
})();
