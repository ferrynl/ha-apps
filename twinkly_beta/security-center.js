(() => {
  "use strict";
  const root = document.getElementById("security-modules");
  const language = document.getElementById("language");
  const words = {
    nl: ["Broncode en release", "Docker en bibliotheken", "Lokale beveiligingscontroles", "Controles verversen", "Bezig met controleren…",
      "Gegevens ophalen mislukt.", "Broncode", "GitHub-tests en beveiligingsrapporten", "Geïnstalleerde bèta", "Python en architectuur",
      "Draait als root", "Draait als niet-root", "Pakketten volgens lockfile", "Afwijkingen", "Geen versie gevonden", "Lockfile onleesbaar",
      "De app test de eigen toegangsregels met gesimuleerde aanvragen.", "Gecontroleerd om", "Geslaagd", "Afwijking", "Niet ingesteld", "Onbeschikbaar",
      "Ingress-regels actief", "Toegang via Ingress toegestaan", "Rechtstreekse toegang geblokkeerd", "POST vereist JSON",
      "Healthcheck lokaal toegestaan", "Healthcheck via Ingress geblokkeerd", "Toegangsrechten van de sleutelopslag"],
    en: ["Source and release", "Docker and libraries", "Local security checks", "Refresh checks", "Checking…",
      "Could not load the results.", "Source code", "GitHub tests and security reports", "Installed beta", "Python and architecture",
      "Running as root", "Running as non-root", "Packages in the lockfile", "Mismatches", "Version missing", "Lockfile unavailable",
      "The app checks its access rules with simulated requests.", "Checked at", "Passed", "Mismatch", "Not configured", "Unavailable",
      "Ingress rules installed", "Ingress accepted", "Direct access blocked", "POST requires JSON",
      "Local health check allowed", "Health check blocked through ingress", "Credential file permissions"],
    de: ["Quellcode und Release", "Docker und Bibliotheken", "Lokale Sicherheitsprüfungen", "Prüfungen aktualisieren", "Prüfung läuft…",
      "Ergebnisse konnten nicht geladen werden.", "Quellcode", "GitHub-Tests und Sicherheitsberichte", "Installierte Beta", "Python und Architektur",
      "Läuft als Root", "Läuft ohne Root", "Pakete aus der Lockdatei", "Abweichungen", "Version fehlt", "Lockdatei nicht verfügbar",
      "Die App prüft ihre Zugriffsregeln mit simulierten Anfragen.", "Geprüft um", "Bestanden", "Abweichung", "Nicht eingerichtet", "Nicht verfügbar",
      "Ingress-Regeln aktiv", "Ingress erlaubt", "Direkter Zugriff blockiert", "POST erfordert JSON",
      "Lokaler Healthcheck erlaubt", "Healthcheck über Ingress blockiert", "Berechtigungen der Schlüsseldatei"],
    es: ["Código y versión", "Docker y bibliotecas", "Comprobaciones locales", "Actualizar comprobaciones", "Comprobando…",
      "No se pudieron cargar los resultados.", "Código fuente", "Pruebas e informes en GitHub", "Beta instalada", "Python y arquitectura",
      "Ejecutándose como root", "Ejecutándose sin root", "Paquetes del archivo de bloqueo", "Diferencias", "Falta la versión", "Archivo de bloqueo no disponible",
      "La aplicación comprueba sus reglas de acceso con peticiones simuladas.", "Comprobado a las", "Correcto", "Diferencia", "Sin configurar", "No disponible",
      "Reglas de Ingress activas", "Ingress permitido", "Acceso directo bloqueado", "POST requiere JSON",
      "Comprobación local permitida", "Comprobación vía Ingress bloqueada", "Permisos del archivo de credenciales"],
  };
  const ids = ["middleware_installed", "ingress_access", "direct_access", "json_only",
    "health_loopback", "health_ingress_denied", "credentials_permissions"];
  const results = {pass: 18, fail: 19, not_configured: 20, unavailable: 21};
  const repository = "https://github.com/ferrynl/ha-apps";
  let active = false;
  let loading = false;
  let failed = false;
  let report;
  let dependenciesOpen = false;

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function link(text, path) {
    const element = node("a", text);
    element.href = repository + path;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
    return element;
  }

  function show() {
    const t = words[language.value] || words.nl;
    const refresh = node("button", t[3]);
    refresh.type = "button";
    refresh.disabled = loading;
    refresh.onclick = () => load(true);
    const notification = node("p", loading ? t[4] : failed ? t[5] : "");
    notification.setAttribute("role", "status");
    const cards = node("div", "", "lighting-grid");
    const source = node("article", "", "lighting-card");
    source.append(node("h3", t[0]), link(t[6], "/tree/main/twinkly_beta"),
      link(t[7], "/actions/workflows/twinkly-beta-bundled-previews.yml"));
    const runtime = node("article", "", "lighting-card");
    runtime.append(node("h3", t[1]));
    const checks = node("article", "", "lighting-card");
    checks.append(node("h3", t[2]), node("p", t[16]));
    if (report) {
      source.append(node("p", t[8] + " · " + (report.version || t[14])));
      runtime.append(node("p", t[9] + " · " + report.runtime.python + " · " + report.runtime.architecture),
        node("p", t[report.runtime.root ? 10 : 11]));
      if (report.dependencies) {
        const total = report.dependencies.length;
        const mismatches = report.dependencies.filter(pkg => pkg.expected !== pkg.installed).length;
        const detail = node("details");
        detail.open = dependenciesOpen;
        detail.ontoggle = () => { dependenciesOpen = detail.open; };
        const list = node("ul");
        for (const pkg of report.dependencies) {
          const summary = pkg.expected === pkg.installed ? pkg.installed
            : (pkg.installed || t[14]) + " → " + pkg.expected;
          list.append(node("li", pkg.name + " · " + summary));
        }
        detail.append(node("summary", t[12] + " · " + (total - mismatches) + " / " + total), list);
        runtime.append(node("p", t[13] + " · " + mismatches), detail);
      } else runtime.append(node("p", t[15]));
      const items = node("ul");
      for (const check of report.checks) {
        const index = ids.indexOf(check.id);
        if (index !== -1) items.append(node("li", t[22 + index] + " · " + t[results[check.result] ?? 21]));
      }
      const time = new Date(report.checked_at).toLocaleTimeString(language.value || "nl");
      checks.append(items, node("p", t[17] + " " + time));
    }
    cards.append(source, runtime, checks);
    root.replaceChildren(refresh, notification, cards);
  }

  async function load(restoreFocus = false) {
    if (loading) return;
    loading = true;
    failed = false;
    show();
    try {
      const response = await fetch("security-center/status", {cache: "no-store"});
      if (!response.ok) throw new Error("Security status unavailable");
      report = await response.json();
    } catch {
      failed = true;
    } finally {
      loading = false;
      show();
      if (restoreFocus && active) root.querySelector("button").focus();
    }
  }

  function pageChanged() {
    const visible = /^#(?:security-center|netwerk)$/.test(location.hash);
    if (visible && !active) load();
    active = visible;
  }

  window.addEventListener("hashchange", pageChanged);
  language.addEventListener("change", () => { if (active) show(); });
  pageChanged();
})();
