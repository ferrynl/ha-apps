(() => {
  "use strict";
  const root = document.getElementById("govee-cloud");
  const language = document.getElementById("language");
  const base = "providers/govee/cloud";
  const words = {
    nl: ["Govee-cloud", "Vraag een API-sleutel aan in Govee Home en vul govee_api_key in bij de appconfiguratie in Home Assistant. Herstart de app daarna.", "Cloudlampen ophalen", "Gegevens ophalen…", "Geen lampen gevonden in dit Govee-account.", "Lamp", "Scène", "Scène toepassen", "Segmenten", "Segmentkleur", "Segmenthelderheid", "Toepassen", "Govee heeft de opdracht geaccepteerd.", "Dit model geeft geen ondersteunde scènes of segmentbediening door.", "Govee is niet bereikbaar of de opdracht is geweigerd.", "Govee weigert de API-sleutel. Controleer de appconfiguratie.", "Te veel verzoeken. Probeer het over een moment opnieuw.", "Stop eerst de actieve test of muziekbediening voor deze lamp.", "Kies {min} tot {max} segmenten.", "De dynamische scènes konden niet worden opgehaald.", "API-sleutel aanvragen"],
    en: ["Govee Cloud", "Request an API key in Govee Home and enter govee_api_key in the app configuration in Home Assistant. Then restart the app.", "Load cloud lights", "Loading…", "No lights found in this Govee account.", "Light", "Scene", "Apply scene", "Segments", "Segment colour", "Segment brightness", "Apply", "Govee accepted the command.", "This model reports no supported scenes or segment controls.", "Govee is unavailable or rejected the command.", "Govee rejected the API key. Check the app configuration.", "Too many requests. Try again in a moment.", "Stop the running test or music control for this light first.", "Select {min} to {max} segments.", "Could not fetch dynamic scenes.", "Request an API key"],
    de: ["Govee-Cloud", "Beantrage einen API-Schlüssel in Govee Home und trage govee_api_key in die App-Konfiguration von Home Assistant ein. Starte die App danach neu.", "Cloud-Lampen laden", "Daten werden geladen…", "In diesem Govee-Konto wurden keine Lampen gefunden.", "Lampe", "Szene", "Szene anwenden", "Segmente", "Segmentfarbe", "Segmenthelligkeit", "Anwenden", "Govee hat den Befehl angenommen.", "Dieses Modell meldet keine unterstützten Szenen oder Segmentsteuerung.", "Govee ist nicht erreichbar oder hat den Befehl abgelehnt.", "Govee hat den API-Schlüssel abgelehnt. Prüfe die App-Konfiguration.", "Zu viele Anfragen. Versuche es gleich erneut.", "Beende zuerst den aktiven Test oder die Musiksteuerung dieser Lampe.", "Wähle {min} bis {max} Segmente.", "Dynamische Szenen konnten nicht abgerufen werden.", "API-Schlüssel anfordern"],
    es: ["Nube de Govee", "Solicita una clave API en Govee Home e introduce govee_api_key en la configuración de la aplicación en Home Assistant. Reinicia la aplicación.", "Cargar luces de la nube", "Cargando…", "No se encontraron luces en esta cuenta de Govee.", "Luz", "Escena", "Aplicar escena", "Segmentos", "Color de segmento", "Brillo de segmento", "Aplicar", "Govee ha aceptado el comando.", "Este modelo no indica escenas ni controles de segmentos compatibles.", "Govee no está disponible o ha rechazado el comando.", "Govee ha rechazado la clave API. Comprueba la configuración.", "Demasiadas solicitudes. Inténtalo de nuevo en un momento.", "Detén primero la prueba o el control musical de esta luz.", "Selecciona de {min} a {max} segmentos.", "No se pudieron obtener las escenas dinámicas.", "Solicitar clave API"],
  };
  const errors = {key_rejected: 15, rate_limited: 16, device_busy: 17};
  let visible = false;
  let revision = 0;

  const t = index => (words[language.value] || words.nl)[index];
  function element(tag, text) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    return node;
  }
  function field(name, control) {
    const label = element("label", name);
    label.append(control);
    return label;
  }
  function button(name, handler) {
    const control = element("button", name);
    control.type = "button";
    control.onclick = handler;
    return control;
  }
  async function api(path, body) {
    const response = await fetch(base + path, body === undefined ? {cache: "no-store"} :
      {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result;
  }
  function select(rows) {
    const control = element("select");
    for (const [value, text] of rows) control.add(new Option(text, value));
    return control;
  }

  function controls(container, device, details) {
    const status = element("p");
    status.setAttribute("role", "status");
    let busy = false;
    const buttons = [];
    const command = async body => {
      if (busy) return;
      busy = true;
      for (const control of buttons) control.disabled = true;
      status.textContent = t(3);
      try {
        await api("/apply", {device, ...body});
        status.textContent = t(12);
      } catch (error) {
        status.textContent = t(errors[error.message] ?? 14);
      } finally {
        busy = false;
        for (const control of buttons) control.disabled = false;
      }
    };
    if (details.scenes.length) {
      const scene = select(details.scenes.map(row => [row.id, row.name]));
      const apply = button(t(7), () => command({action: "scene", scene: scene.value}));
      buttons.push(apply);
      const row = element("div");
      row.className = "lighting-controls";
      row.append(field(t(6), scene), apply);
      container.append(row);
    }
    if (details.scene_error) container.append(element("p", t(19) + " " + t(errors[details.scene_error] ?? 14)));
    for (const [action, spec] of Object.entries(details.segments)) {
      const group = element("fieldset");
      const legend = t(action === "color" ? 9 : 10);
      group.append(element("legend", legend));
      const indices = element("div");
      indices.className = "govee-segments";
      for (const index of spec.indices) {
        const check = element("input");
        Object.assign(check, {type: "checkbox", value: index});
        indices.append(field(t(8) + " " + (index + 1), check));
      }
      const hint = t(18).replace("{min}", spec.minimum).replace("{max}", spec.limit);
      const value = element("input");
      if (action === "color") Object.assign(value, {type: "color", value: "#ff7e33"});
      else Object.assign(value, {type: "number", min: spec.low, max: spec.high, step: spec.step, value: spec.high, required: true});
      const apply = button(t(11), () => {
        const segments = Array.from(indices.querySelectorAll("input:checked"), input => Number(input.value));
        if (segments.length < spec.minimum || segments.length > spec.limit) {
          status.textContent = hint;
          return;
        }
        if (!value.reportValidity()) return;
        command({action, segments, value: action === "color"
          ? value.value.slice(1).match(/../g).map(channel => parseInt(channel, 16)) : value.valueAsNumber});
      });
      buttons.push(apply);
      const row = element("div");
      row.className = "lighting-controls";
      row.append(field(legend, value), apply);
      group.append(element("p", hint), indices, row);
      container.append(group);
    }
    if (!details.scenes.length && !Object.keys(details.segments).length && !details.scene_error) {
      container.append(element("p", t(13)));
    }
    container.append(status);
  }

  async function show() {
    const token = ++revision;
    const content = element("div");
    content.className = "govee-cloud-content";
    const status = element("p", t(3));
    status.setAttribute("role", "status");
    root.replaceChildren(element("h2", t(0)), status, content);
    try {
      const meta = await api("");
      if (token !== revision || !visible) return;
      status.textContent = "";
      if (!meta.configured) {
        const help = element("a", t(20));
        help.href = "https://developer.govee.com/reference/apply-you-govee-api-key";
        help.target = "_blank";
        help.rel = "noopener noreferrer";
        content.append(element("p", t(1)), help);
        return;
      }
      const devices = element("div");
      const load = button(t(2), async () => {
        load.disabled = true;
        status.textContent = t(3);
        devices.replaceChildren();
        try {
          const result = await api("/devices", {});
          if (token !== revision || !visible) return;
          if (!result.devices.length) {
            status.textContent = t(4);
            return;
          }
          const device = select(result.devices.map(row => [row.id, row.name + " · " + row.sku]));
          const detail = element("div");
          let selection = 0;
          async function choose() {
            const request = ++selection;
            const id = device.value;
            status.textContent = t(3);
            detail.replaceChildren();
            try {
              const result = await api("/details", {device: id});
              if (request !== selection || token !== revision || !visible) return;
              status.textContent = "";
              controls(detail, id, result);
            } catch (error) {
              if (request === selection) status.textContent = t(errors[error.message] ?? 14);
            }
          }
          device.onchange = choose;
          devices.replaceChildren(field(t(5), device), detail);
          await choose();
        } catch (error) {
          status.textContent = t(errors[error.message] ?? 14);
        } finally {
          load.disabled = false;
        }
      });
      content.append(load, devices);
    } catch {
      status.textContent = t(14);
    }
  }

  function page(name) {
    const next = name === "govee";
    root.hidden = !next;
    if (next && !visible) {
      visible = true;
      show();
    }
    if (!next && visible) {
      visible = false;
      revision++;
    }
  }
  window.addEventListener("lighting-page", event => page(event.detail));
  language.addEventListener("change", () => { if (visible) show(); });
  if (location.hash === "#govee") page("govee");
})();
