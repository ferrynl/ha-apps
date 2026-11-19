(() => {
  const words = {
    nl: ["Home", "Alle lampen", "Vernieuwen", "Verbonden", "Niet bereikbaar", "Status onbekend", "Govee · onbevestigd", "Aan", "Uit", "Helderheid", "Kleur", "Nog geen lampen", "Verbindingen", "Apparaten zoeken", "Koppelen", "Opnieuw koppelen", "Apparaat-ID", "LAN-adres", "Certificaat ophalen", "SHA256-vingerafdruk", "Vergelijk deze vingerafdruk via een onafhankelijke, vertrouwde bron. Ga alleen door als je het certificaat vertrouwt.", "Druk vlak voor het koppelen op de fysieke knop van de Hue Bridge.", "Schakel LAN-bediening in via de Govee-app.", "Gemengde groepen", "Groepsnaam", "Opslaan", "Bewerken", "Verwijderen", "Annuleren", "Gelukt", "Onbevestigd", "Overgeslagen", "Mislukt", "Verbinding beheren", "Kies lampen", "Geen apparaten gevonden", "Gegevens laden…", "Onbekende lamp", "Gekoppeld"],
    en: ["Home", "All lights", "Refresh", "Connected", "Unavailable", "Status unknown", "Govee · unconfirmed", "On", "Off", "Brightness", "Color", "No lights yet", "Connections", "Find devices", "Pair", "Reconnect", "Device ID", "LAN address", "Inspect certificate", "SHA256 fingerprint", "Compare this fingerprint through an independent, trusted source. Continue only if you trust the certificate.", "Press the physical Hue Bridge button just before pairing.", "Enable LAN control in the Govee app.", "Mixed groups", "Group name", "Save", "Edit", "Delete", "Cancel", "Accepted", "Unconfirmed", "Skipped", "Failed", "Manage connection", "Choose lights", "No devices found", "Loading…", "Unavailable light", "Paired"],
    de: ["Start", "Alle Lampen", "Aktualisieren", "Verbunden", "Nicht erreichbar", "Status unbekannt", "Govee · unbestätigt", "Ein", "Aus", "Helligkeit", "Farbe", "Noch keine Lampen", "Verbindungen", "Geräte suchen", "Koppeln", "Erneut koppeln", "Geräte-ID", "LAN-Adresse", "Zertifikat abrufen", "SHA256-Fingerabdruck", "Vergleiche diesen Fingerabdruck mit einer unabhängigen, vertrauenswürdigen Quelle. Fahre nur fort, wenn du dem Zertifikat vertraust.", "Drücke kurz vor dem Koppeln die Taste an der Hue Bridge.", "Aktiviere die LAN-Steuerung in der Govee-App.", "Gemischte Gruppen", "Gruppenname", "Speichern", "Bearbeiten", "Löschen", "Abbrechen", "Angenommen", "Unbestätigt", "Übersprungen", "Fehlgeschlagen", "Verbindung verwalten", "Lampen auswählen", "Keine Geräte gefunden", "Wird geladen…", "Nicht erreichbare Lampe", "Gekoppelt"],
    es: ["Inicio", "Todas las luces", "Actualizar", "Conectado", "No disponible", "Estado desconocido", "Govee · sin confirmar", "Encender", "Apagar", "Brillo", "Color", "Aún no hay luces", "Conexiones", "Buscar dispositivos", "Vincular", "Volver a vincular", "ID del dispositivo", "Dirección LAN", "Consultar certificado", "Huella SHA256", "Compara esta huella con una fuente fiable e independiente. Continúa solo si confías en el certificado.", "Pulsa el botón físico del puente Hue justo antes de vincularlo.", "Activa el control LAN en la aplicación Govee.", "Grupos mixtos", "Nombre del grupo", "Guardar", "Editar", "Eliminar", "Cancelar", "Aceptado", "Sin confirmar", "Omitido", "Error", "Gestionar conexión", "Elegir luces", "No se encontraron dispositivos", "Cargando…", "Luz no disponible", "Vinculado"],
  };
  const temperatureLabels = {
    nl: "Wittemperatuur", en: "White temperature", de: "Weißtemperatur", es: "Temperatura del blanco",
  };
  const sceneWords = {
    nl: ["Scènes", "Scènenaam", "Groep", "Afspelen", "Groep ontbreekt", "Maak een gemengde groep om een scène op te slaan."],
    en: ["Scenes", "Scene name", "Group", "Apply", "Group missing", "Create a mixed group to save a scene."],
    de: ["Szenen", "Szenenname", "Gruppe", "Anwenden", "Gruppe fehlt", "Erstelle eine gemischte Gruppe, um eine Szene zu speichern."],
    es: ["Escenas", "Nombre de escena", "Grupo", "Aplicar", "Falta el grupo", "Crea un grupo mixto para guardar una escena."],
  };
  const brands = {twinkly: "Twinkly", hue: "Philips Hue", govee: "Govee"};
  const wordmarks = {twinkly: "twinkly-nav-logo.svg", hue: "hue-app-icon.webp", govee: "govee-logo.png"};
  const el = id => document.getElementById(id);
  const panel = el("lighting-panel");
  const settings = el("lighting-settings");
  const studio = el("twinkly-lighting");
  const feedback = el("lighting-feedback");
  const t = i => (words[el("language").value] || words.nl)[i];
  let data;
  let pending;
  let editing;
  let editingScene;
  let context = "";
  let groupBusy = false;

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
      feedback.textContent = t(error.message === "pairing_permission" ? 21 : 32);
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
    for (const [id, group] of Object.entries(data.groups)) {
      const card = node("article", "", "lighting-card");
      card.append(node("h3", group.name), node("p", group.members.map(key => lights.get(key)?.name || t(37)).join(" · ")));
      controls(card, group.members.map(key => lights.get(key)).filter(Boolean), {group: id});
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

  function render() {
    panel.hidden = !["home", "hue", "govee"].includes(context);
    const mount = context === "control" ? studio : context === "settings" ? settings : panel;
    if (!["home", "hue", "govee", "control", "settings"].includes(context)) return;
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
    el("nav-home").textContent = t(0);
    render();
    if (previous !== context && ["home", "hue", "govee", "control", "settings"].includes(context)) {
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
