window.createLightingTools = ({mount, house, nav, api, node, field, language}) => {
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
  const radialLabels = {
    nl: ["Van midden naar buiten", "Van buiten naar midden", "Deze kleurveeg gebruikt de afstand tot het midden van de foto."],
    en: ["Centre out", "Edges in", "This colour sweep uses the distance from the centre of the photo."],
    de: ["Von der Mitte nach außen", "Von außen zur Mitte", "Die Farbwelle nutzt den Abstand zur Mitte des Fotos."],
    es: ["Del centro hacia fuera", "De fuera hacia el centro", "El barrido usa la distancia hasta el centro de la foto."],
  };
  const radialModes = {outward: 0, inward: 1};
  const directions = {right: [0, 1], left: [0, -1], down: [1, 1], up: [1, -1]};
  const planLabels = {
    nl: ["3D-weergave", "Sluiten", "Sleep om te draaien. Gebruik de pijltjes of schuifknop om te draaien en te zoomen.", "Zoom", "Links draaien", "Rechts draaien", "Voeg muurmaten of een foto toe.", "Echte ledposities", "Ledmapping ontbreekt", "Ledmapping ophalen…", "Muur plaatsen", "Kamer en wandzijde", "Kamer", "Voor", "Rechts", "Achter", "Links", "Alle kamers", "Beginstand", "Vernieuwen", "Bij een bezette plek wisselen de twee muren van plaats.", "Plek opgeslagen", "Open 3D-weergave en kies voor elke muur de kamer en wandzijde."],
    en: ["3D view", "Close", "Drag to orbit. Use the arrow keys to turn and the slider to zoom.", "Zoom", "Turn left", "Turn right", "Add wall dimensions or a photo.", "Physical LED positions", "LED mapping unavailable", "Loading LED mapping…", "Place wall", "Room and wall side", "Room", "Front", "Right", "Back", "Left", "All rooms", "Reset view", "Refresh", "If a spot is occupied, the two walls swap positions.", "Position saved", "Open the 3D view and select a room and side for each wall."],
    de: ["3D-Ansicht", "Schließen", "Zum Drehen ziehen. Pfeiltasten drehen, der Schieberegler zoomt.", "Zoom", "Nach links drehen", "Nach rechts drehen", "Füge Wandmaße oder ein Foto hinzu.", "Physische LED-Positionen", "LED-Mapping fehlt", "LED-Mapping wird geladen…", "Wand platzieren", "Raum und Wandseite", "Raum", "Vorne", "Rechts", "Hinten", "Links", "Alle Räume", "Ansicht zurücksetzen", "Aktualisieren", "Ist ein Platz belegt, tauschen die beiden Wände ihre Position.", "Position gespeichert", "Öffne die 3D-Ansicht und wähle für jede Wand einen Raum und eine Seite."],
    es: ["Vista 3D", "Cerrar", "Arrastra para girar. Usa las flechas para girar y el control deslizante para ampliar.", "Zoom", "Girar a la izquierda", "Girar a la derecha", "Sube primero una foto de pared.", "Posiciones físicas de los LED", "Mapa LED no disponible", "Cargando mapa LED…", "Colocar pared", "Habitación y lado de la pared", "Habitación", "Delante", "Derecha", "Detrás", "Izquierda", "Todas las habitaciones", "Restablecer vista", "Actualizar", "Si el lugar está ocupado, las dos paredes intercambian posiciones.", "Posición guardada", "Abre la vista 3D y elige una habitación y un lado para cada pared."],
  };
  const wallLabels = {
    nl: ["Muur", "Muur 1", "Naam muur", "Muur toevoegen", "Naam wijzigen", "Muur verwijderen", "Deze muur met foto en lampplaatsingen verwijderen?"],
    en: ["Wall", "Wall 1", "Wall name", "Add wall", "Rename wall", "Delete wall", "Delete this wall, including its photo and light placements?"],
    de: ["Wand", "Wand 1", "Name der Wand", "Wand hinzufügen", "Wand umbenennen", "Wand löschen", "Diese Wand samt Foto und Lampenpositionen löschen?"],
    es: ["Pared", "Pared 1", "Nombre de la pared", "Añadir pared", "Cambiar nombre", "Eliminar pared", "¿Eliminar esta pared con su foto y posiciones de luces?"],
  };
  const dimensionLabels = {
    nl: ["Breedte (m)", "Hoogte (m)", "Muurmaten opslaan", "Lege muur"],
    en: ["Width (m)", "Height (m)", "Save wall dimensions", "Blank wall"],
    de: ["Breite (m)", "Höhe (m)", "Wandmaße speichern", "Leere Wand"],
    es: ["Ancho (m)", "Altura (m)", "Guardar medidas de la pared", "Pared sin foto"],
  };
  const wallGuide = {
    nl: ["Handleiding Mijn Huis", "Maak één foto per muur.", "Fotografeer de muur recht van voren, in goed licht. Zorg dat de hele muur en de plekken voor je lampen zichtbaar zijn.",
      "Voeg een muur toe, geef hem een naam en upload de bijbehorende foto.", "Kies een lamp uit de lijst en tik op de plek waar die hangt. Versleep de markering om de positie aan te passen en gebruik de hoekgreep of schuifregelaar voor de grootte.",
      "Kies onder Effect een kleurveeg of kleurverloop. Zet Volgorde tonen aan om het effect vooraf op je foto te bekijken.",
      "Elke muur bewaart zijn eigen foto en lampplaatsingen. Als je een foto vervangt, wist de app de plaatsingen op die muur."],
    en: ["My Home guide", "Take one photo per wall.", "Photograph the wall straight on in good light. Include the whole wall and the spots where your lights will go.",
      "Add and name a wall, then enter its dimensions or upload a photo.", "Choose a light from the list and tap where it hangs. Drag its marker to reposition it and use the corner handle or slider to resize it.",
      "Under Effect, choose a colour sweep or gradient. Turn on Show order to preview it on your photo.",
      "Each wall saves its own photo and light placements. Replacing a photo clears the placements on that wall."],
    de: ["Anleitung für Mein Zuhause", "Mache ein Foto pro Wand.", "Fotografiere die Wand frontal und bei gutem Licht. Die ganze Wand und alle vorgesehenen Lampenpositionen sollten sichtbar sein.",
      "Füge eine Wand hinzu, benenne sie und lade ihr Foto hoch.", "Wähle eine Lampe aus der Liste und tippe auf ihre Position. Ziehe die Markierung, um sie zu verschieben. Ändere die Größe mit dem Eckgriff oder Schieberegler.",
      "Wähle unter Effekt einen Farbverlauf oder eine Farbwelle. Aktiviere Reihenfolge anzeigen für die Vorschau auf deinem Foto.",
      "Jede Wand speichert ihr eigenes Foto und ihre Lampenpositionen. Beim Ersetzen eines Fotos werden die Positionen dieser Wand gelöscht."],
    es: ["Guía de Mi casa", "Haz una foto por pared.", "Fotografía la pared de frente y con buena luz. Incluye toda la pared y los lugares donde colocarás las luces.",
      "Añade una pared, ponle un nombre y sube su foto.", "Elige una luz y toca el lugar donde está instalada. Arrastra el marcador para moverlo y usa el tirador o el control deslizante para cambiar su tamaño.",
      "Elige un barrido o un degradado en Efecto. Activa Mostrar orden para ver una vista previa en la foto.",
      "Cada pared guarda su propia foto y sus posiciones de luces. Al sustituir una foto se borran las posiciones de esa pared."],
  };
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
  const guide = node("details", "", "house-guide");
  guide.open = true;
  let guideLanguage;
  const wallPicker = node("div", "", "house-wall-picker");
  const wallStatus = node("p");
  wallStatus.setAttribute("role", "status");
  const plan = node("section", "", "house-3d");
  plan.hidden = true;
  const openPlan = action("", () => {
    plan.hidden = !plan.hidden;
    openPlan.setAttribute("aria-expanded", String(!plan.hidden));
    if (!plan.hidden) renderHouse3d();
  });
  openPlan.setAttribute("aria-expanded", "false");
  house.append(houseTitle, guide, openPlan, plan, wallPicker, spatialSection);
  function renderWallGuide() {
    const current = language();
    if (guideLanguage === current) return;
    guideLanguage = current;
    const [title, first, photo, upload, place, effect, limit] = wallGuide[current] || wallGuide.nl;
    const steps = node("ol");
    const firstStep = node("li");
    firstStep.append(node("strong", first), document.createTextNode(" " + photo));
    steps.append(firstStep, node("li", upload), node("li", place), node("li", effect), node("li", v(22)));
    guide.replaceChildren(node("summary", title), steps, node("p", limit));
  }

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  let legacyShows = read(showKey, []);
  if (!Array.isArray(legacyShows)) legacyShows = [];
  let legacyLayout = read(spatialKey, {});
  let shows = [];
  let layout = {revision: null, photoVersion: null, points: new Map()};
  let walls = [{id: "default", name: ""}];
  let wallId = "default";
  let requestedWall;
  let pickerSignature;
  const wallPath = (id, path = "lighting/projects") => id === "default" ? path : path + "?wall=" + encodeURIComponent(id);
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
  const radialText = index => (radialLabels[language()] || radialLabels.nl)[index];
  const v = index => (planLabels[language()] || planLabels.nl)[index];
  const ledMaps = new Map();
  const h = index => (houseLabels[language()] || houseLabels.nl)[index];
  const msg = index => (serverLabels[language()] || serverLabels.nl)[index];
  const isPlaying = () => ["playing", "stopping"].includes(playback.state);

  function renderWallPicker() {
    const current = language();
    const signature = JSON.stringify([current, walls, wallId, requestedWall]);
    if (pickerSignature === signature) return;
    pickerSignature = signature;
    const [label, first, nameLabel, add, rename, remove, confirmRemove] = wallLabels[current] || wallLabels.nl;
    const selector = dropdown(walls.map(wall => [wall.id, wall.name || first]), requestedWall ?? wallId);
    selector.setAttribute("aria-label", label);
    selector.onchange = () => {
      if (busy || gesture) {
        selector.value = requestedWall ?? wallId;
        return;
      }
      generation++;
      requestedWall = selector.value;
      wallStatus.textContent = "";
      spatialSection.hidden = true;
      renderWallPicker();
      wallPicker.querySelector("select").focus();
      refresh();
    };
    const name = node("input");
    Object.assign(name, {type: "text", maxLength: 60, required: true});
    const form = node("form", "", "lighting-controls");
    const addButton = node("button", add);
    addButton.type = "submit";
    addButton.disabled = Boolean(requestedWall) || walls.length >= 8;
    form.onsubmit = event => {
      event.preventDefault();
      if (name.value.trim()) change({action: "add_wall", name: name.value}, wallStatus);
    };
    form.append(field(nameLabel, name), addButton, action(rename, () => {
      if (name.reportValidity() && name.value.trim()) {
        return change({action: "rename_wall", name: name.value, revision: layout.revision}, wallStatus);
      }
    }, Boolean(requestedWall)));
    if (wallId !== "default") form.append(action(remove, () => {
      if (window.confirm(confirmRemove)) return change({action: "delete_wall", revision: layout.revision}, wallStatus);
    }, Boolean(requestedWall)));
    wallPicker.replaceChildren(field(label, selector), form, wallStatus);
  }

  function receive(data, focusId) {
    const nextWall = data.wall_id || "default";
    const switched = wallId !== nextWall || Boolean(requestedWall);
    wallId = nextWall;
    requestedWall = undefined;
    walls = data.walls || walls;
    spatialSection.hidden = false;
    renderWallPicker();
    const showsChanged = !initialized || JSON.stringify(shows) !== JSON.stringify(data.shows);
    const layoutChanged = !initialized || switched || layout.revision !== data.layout.revision;
    const refreshPlan = initialized && layoutChanged && !plan.hidden && !movingWall;
    const runningChanged = !initialized || isPlaying() !== ["playing", "stopping"].includes(data.playback.state)
      || playback.state !== data.playback.state;
    initialized = true;
    shows = data.shows;
    if (switched || layout.photoVersion !== data.layout.photo_version) {
      photoElement = node("img");
      layout.photoVersion = data.layout.photo_version;
      if (layout.photoVersion) photoElement.src = roomPhotoPath(wallId, layout.photoVersion);
    }
    layout.revision = data.layout.revision;
    layout.dimensions = data.layout.dimensions;
    layout.points = new Map(data.layout.points);
    const changed = JSON.stringify(playback) !== JSON.stringify(data.playback);
    playback = data.playback;
    if (changed) {
      updatePlaybackStatus();
      refreshEffectButtons?.();
    }
    if (inventory && (showsChanged || runningChanged)) renderShows();
    if (inventory && layoutChanged) renderSpatial(focusId);
    if (refreshPlan && activePage === "house") renderHouse3d();
  }

  function updatePlaybackStatus() {
    const state = playback.state;
    if (state === "idle") {
      for (const details of reports) details.hidden = true;
      return;
    }
    const spatial = playback.kind === "spatial";
    const gradient = playback.effect === "gradient";
    const radial = radialModes[playback.effect];
    const effectName = radial !== undefined ? radialText(radial) : gradient ? g(1) : e(0);
    const headline = state === "playing" ? (spatial && playback.step === 0 ? (gradient ? g(8) : e(15))
      : t(12) + " " + playback.step + " / " + playback.total)
      : state === "stopping" ? (spatial ? effectName + " · " + t(10) + "…" : msg(6))
      : spatial ? (gradient ? g({complete: 5, stopped: 6, failed: 7}[state]) : e({complete: 12, stopped: 13, failed: 14}[state]))
      : t({complete: 13, stopped: 14, failed: 15}[state]);
    const status = [headline, playback.uncertain && t(16), playback.partial && t(35)].filter(Boolean).join(" · ");
    showStatus.textContent = spatial && isPlaying() ? effectName + " · " + status : spatial ? "" : status;
    effectStatus.textContent = spatial ? (radial !== undefined && state !== "stopping" ? effectName + " · " + status : status)
      : isPlaying() ? t(0) + " · " + status : "";
    const names = new Map((inventory?.lights || []).map(light => [light.id, light.name]));
    for (const [id, group] of Object.entries(inventory?.spatial_groups || {})) names.set(id, group.name);
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
      const data = await api(wallPath(requestedWall ?? wallId));
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
    if (busy || requestedWall) return;
    busy = true;
    generation++;
    try {
      const data = await api(wallPath(wallId), body);
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
    const targetWall = wallId;
    const body = {action: "import", shows: legacyShows, points: legacyLayout.points || []};
    if (!layout.photoVersion && /^data:image\/jpeg;base64,/.test(legacyLayout.photo || "")) {
      try {
        body.photo = await importPhoto(await (await fetch(legacyLayout.photo)).blob());
      } catch {
        status.textContent = t(24);
        return;
      }
    }
    if (targetWall !== wallId || requestedWall) return;
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
    const point = [clamp(x, 0, 100), clamp(y, 0, 100), clamp(size, 4, 40)];
    const advance = wallPoints().get(id)?.[3];
    if (advance) point.push(advance);
    return saveWallPoint(id, point, focusId);
  }

  function wallGroupOwners() {
    const owners = new Map();
    for (const [id, group] of Object.entries(inventory.spatial_groups || {})) {
      for (const member of group.members) if (!owners.has(member)) owners.set(member, id);
    }
    return owners;
  }

  function wallPoints(source = layout.points) {
    const owners = wallGroupOwners();
    const points = new Map(source);
    for (const [id, point] of source) {
      const group = owners.get(id);
      if (!group) continue;
      if (!points.has(group)) points.set(group, point);
      points.delete(id);
    }
    return points;
  }

  function saveWallPoint(id, point, focusId) {
    const points = new Map(layout.points);
    const owners = wallGroupOwners();
    for (const key of points.keys()) if (owners.get(key) === id) points.delete(key);
    if (point) points.set(id, point);
    else points.delete(id);
    return updateLayout(points, {}, focusId);
  }

  function roomPhotoPath(id, version) {
    return wallPath(id, "lighting/projects/photo") + (id === "default" ? "?" : "&") + "v=" + encodeURIComponent(version);
  }

  function ledCoordinates(light) {
    const cached = ledMaps.get(light.id);
    if (cached && cached.until > Date.now()) return cached.result;
    const [, identifier] = JSON.parse(light.id);
    const grouped = Boolean(light.members);
    const query = encodeURIComponent(grouped ? identifier.slice("twinkly:".length) : identifier);
    const entry = {until: Infinity};
    entry.result = api((grouped ? "group-layout?id=" : "layout?id=") + query).then(data => {
      if (grouped) return (data.members || []).flatMap(member => member.points.map(point => point.slice(0, 2)));
      if (!data.layout || data.layout.synthesized) return [];
      const settings = data.settings || {};
      const angle = (settings.rotation || 0) * Math.PI / 180;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      return data.layout.points.map(([, x, y]) => {
        x *= settings.mirror_x ? -1 : 1;
        y *= settings.mirror_y ? -1 : 1;
        return [x * cos - y * sin, x * sin + y * cos];
      });
    }).catch(() => []).then(points => {
      const clean = points.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
      entry.until = Date.now() + (clean.length ? 120000 : 15000);
      return clean;
    });
    ledMaps.set(light.id, entry);
    return entry.result;
  }

  function ledDrawing(light, showStatus) {
    const frame = node("span", "", "house-led-map");
    const drawing = node("canvas");
    drawing.width = drawing.height = 160;
    drawing.setAttribute("aria-hidden", "true");
    const label = node("small", v(9));
    frame.title = v(9);
    frame.append(drawing);
    if (showStatus) frame.append(label);
    ledCoordinates(light).then(points => {
      const ctx = drawing.getContext("2d");
      if (points.length) {
        let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
        for (const [x, y] of points) {
          xmin = Math.min(xmin, x); ymin = Math.min(ymin, y);
          xmax = Math.max(xmax, x); ymax = Math.max(ymax, y);
        }
        const dx = xmax - xmin, dy = ymax - ymin;
        const scale = 144 / (Math.max(dx, dy) || 1);
        ctx.fillStyle = "#ffe6a5";
        for (const [x, y] of points) {
          ctx.fillRect(79 + (x - xmin - dx / 2) * scale, 79 + (y - ymin - dy / 2) * scale, 3, 3);
        }
      }
      frame.dataset.ledCount = String(points.length);
      frame.title = label.textContent = points.length ? points.length + " · " + v(7) : v(8);
    });
    return frame;
  }

  let planGeneration = 0;
  let planWall;
  let planRoom = "";
  let movingWall = false;
  const camera = {yaw: 28, pitch: -15, zoom: null};
  const planPath = "lighting/projects/overview";
  const roomLabel = room => v(12) + " " + (room + 1);
  const wallPixelsPerMeter = 65;

  function showDimensions(dimensions) {
    const format = new Intl.NumberFormat(language(), {maximumFractionDigits: 2});
    return format.format(dimensions.width_m) + " × " + format.format(dimensions.height_m) + " m";
  }

  function planPlacement(snapshot, walls) {
    if (!snapshot.revision) return undefined;
    const wallNames = walls.map(wall => [wall.id, wall.name || (wallLabels[language()] || wallLabels.nl)[1]]);
    if (!walls.some(wall => wall.id === planWall)) planWall = walls.find(wall => wall.id === wallId)?.id || walls[0].id;
    const selectWall = dropdown(wallNames, planWall);
    const slots = Array.from({length: 8}, (_, slot) => [String(slot), roomLabel(Math.floor(slot / 4)) + " · " + v(13 + slot % 4)]);
    const currentSlot = () => String(walls.find(wall => wall.id === planWall).slot);
    const destination = dropdown(slots, currentSlot());
    const feedback = node("p");
    feedback.setAttribute("role", "status");
    const save = action(t(8), async () => {
      if (movingWall) return;
      movingWall = selectWall.disabled = destination.disabled = save.disabled = true;
      try {
        const updated = await api(planPath, {wall: planWall, slot: Number(destination.value), revision: snapshot.revision});
        if (!plan.hidden) renderHouse3d(updated, v(21));
      } catch (error) {
        if (error.message === "project_conflict" && !plan.hidden) {
          renderHouse3d(undefined, msg(5));
        } else {
          feedback.textContent = t(25);
        }
      } finally {
        movingWall = selectWall.disabled = destination.disabled = save.disabled = false;
      }
    });
    selectWall.onchange = () => {
      planWall = selectWall.value;
      destination.value = currentSlot();
    };
    const row = node("div", "", "lighting-controls");
    row.append(field(v(10), selectWall), field(v(11), destination), save);
    const panel = node("div", "", "house-3d-placement");
    panel.append(row, node("p", v(20)), feedback);
    return panel;
  }

  async function renderHouse3d(snapshot, message) {
    const request = ++planGeneration;
    const close = action(v(1), () => { plan.hidden = true; openPlan.setAttribute("aria-expanded", "false"); openPlan.focus(); });
    const header = node("div", "", "lighting-controls");
    header.append(node("h3", v(0)), action(v(19), () => renderHouse3d()), close);
    const status = node("p");
    status.setAttribute("role", "status");
    plan.replaceChildren(header, status);
    try {
      snapshot ??= await api(planPath);
      if (request !== planGeneration || plan.hidden) return;
      const layoutWalls = snapshot.walls.map((wall, index) => ({...wall, slot: wall.slot ?? index}));
      if (!layoutWalls.length) {
        status.textContent = v(6);
        return;
      }
      const placement = planPlacement(snapshot, layoutWalls);
      if (placement) plan.append(placement);
      const scene = node("div", "", "house-3d-scene");
      scene.tabIndex = 0;
      scene.setAttribute("aria-label", v(0));
      const world = node("div", "", "house-3d-world");
      scene.append(world);
      const groups = inventory?.spatial_groups || {};
      const lights = new Map((inventory?.lights || []).map(light => [light.id, light]));
      for (const [id, group] of Object.entries(groups)) lights.set(id, {...group, id});
      const rooms = [...new Set(layoutWalls.map(wall => Math.floor(wall.slot / 4)))].sort();
      if (planRoom && !rooms.includes(Number(planRoom))) planRoom = "";
      const visibleRooms = planRoom ? rooms.filter(room => room === Number(planRoom)) : rooms;
      const roomCount = visibleRooms.length;
      const visibleWalls = layoutWalls.filter(wall => visibleRooms.includes(Math.floor(wall.slot / 4)));
      const roomSpan = Math.max(260, ...visibleWalls.map(wall => (wall.dimensions?.width_m || 0) * wallPixelsPerMeter));
      const heightSpan = Math.max(160, ...visibleWalls.map(wall => (wall.dimensions?.height_m || 0) * wallPixelsPerMeter));
      const fit = Math.min(1, 260 / roomSpan, 290 / heightSpan);
      for (const [index, roomId] of visibleRooms.entries()) {
        const room = node("div", "", "house-3d-room");
        room.style.transform = "translateX(" + (index - (roomCount - 1) / 2) * (roomSpan + 22) + "px)";
        room.append(node("div", "", "house-3d-floor"));
        for (const wall of layoutWalls.filter(wall => Math.floor(wall.slot / 4) === roomId)) {
          const face = node("div", "", "house-3d-wall");
          face.dataset.wall = wall.id;
          face.style.transform = "rotateY(" + (wall.slot % 4) * 90 + "deg) translateZ(130px)";
          const name = wall.name || (wallLabels[language()] || wallLabels.nl)[1];
          if (wall.dimensions) {
            const width = wall.dimensions.width_m * wallPixelsPerMeter;
            const height = wall.dimensions.height_m * wallPixelsPerMeter;
            Object.assign(face.style, {width: width + "px", height: height + "px",
              left: (260 - width) / 2 + "px", top: (160 - height) + "px"});
          }
          if (wall.photo_version) {
            const image = node("img");
            image.alt = name;
            image.src = roomPhotoPath(wall.id, wall.photo_version);
            image.draggable = false;
            face.append(image);
          } else {
            face.classList.add("house-3d-wall-empty");
          }
          const caption = wall.dimensions ? name + " · " + showDimensions(wall.dimensions) : name;
          face.append(node("span", caption, "house-3d-name"));
          if (inventory) {
            for (const [id, [x, y, size = defaultSize]] of wallPoints(wall.points)) {
              const light = lights.get(id);
              if (!light) continue;
              const marker = node("span", "", "house-3d-light");
              marker.title = light.name;
              marker.style.left = x + "%";
              marker.style.top = y + "%";
              marker.style.width = size + "%";
              marker.append(lampImage(light));
              face.append(marker);
            }
          }
          room.append(face);
        }
        world.append(room);
      }
      const zoom = node("input");
      const initialZoom = roomCount === 1 ? 76 : 54;
      Object.assign(zoom, {type: "range", min: 35, max: 125, value: camera.zoom ?? initialZoom});
      const rotate = () => {
        camera.pitch = clamp(camera.pitch, -75, 75);
        world.style.transform = "rotateX(" + camera.pitch + "deg) rotateY(" + camera.yaw + "deg) scale(" + (Number(zoom.value) / 100 * fit) + ")";
      };
      zoom.oninput = () => { camera.zoom = Number(zoom.value); rotate(); };
      let drag;
      scene.onpointerdown = event => {
        if (event.button !== 0) return;
        drag = [event.clientX, event.clientY, camera.yaw, camera.pitch];
        scene.setPointerCapture(event.pointerId);
      };
      scene.onpointermove = event => {
        if (!drag) return;
        camera.yaw = drag[2] + (event.clientX - drag[0]) * .5;
        camera.pitch = drag[3] - (event.clientY - drag[1]) * .5;
        rotate();
      };
      scene.onlostpointercapture = () => { drag = undefined; };
      scene.onkeydown = event => {
        const offset = {ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12]}[event.key];
        if (!offset) return;
        event.preventDefault();
        camera.yaw += offset[0]; camera.pitch += offset[1]; rotate();
      };
      const controls = node("div", "", "lighting-controls");
      if (rooms.length > 1) {
        const roomFilter = dropdown([["", v(17)], ...rooms.map(room => [String(room), roomLabel(room)])], planRoom);
        roomFilter.onchange = () => {
          planRoom = roomFilter.value;
          renderHouse3d(snapshot);
          plan.querySelector(".house-3d-room-filter")?.focus();
        };
        roomFilter.className = "house-3d-room-filter";
        controls.append(field(v(12), roomFilter));
      }
      controls.append(action(v(4), () => { camera.yaw -= 30; rotate(); }), action(v(5), () => { camera.yaw += 30; rotate(); }),
        field(v(3), zoom), action(v(18), () => {
          Object.assign(camera, {yaw: 28, pitch: -15, zoom: null});
          zoom.value = initialZoom;
          rotate();
        }));
      status.textContent = [message, v(2), !layoutWalls.some(wall => wall.photo_version || wall.dimensions) && v(6)].filter(Boolean).join(" ");
      plan.append(controls, scene);
      rotate();
      if (message) placement?.querySelector("button")?.focus();
    } catch {
      if (request === planGeneration && !plan.hidden) status.textContent = msg(1);
    }
  }

  function lampImage(light, showStatus = false) {
    if (light.provider === "twinkly") return ledDrawing(light, showStatus);
    const archetype = typeof light.archetype === "string" ? light.archetype : "";
    let shape = "device";
    if (light.members) shape = "group";
    else if (/strip|tube/.test(archetype)) shape = "strip";
    else if (/spot/.test(archetype)) shape = "spot";
    else if (/bulb|candle/.test(archetype)) shape = "bulb";
    else if (/ceiling|panel|pendant/.test(archetype)) shape = "panel";
    const illustration = node("span", "", "house-lamp-art house-art-" + shape);
    illustration.setAttribute("aria-hidden", "true");
    illustration.append(node("span"));
    return illustration;
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
    const mode = dropdown([["sweep", e(0)], ["gradient", g(1)],
      ...Object.entries(radialModes).map(([key, index]) => [key, radialText(index)])], sweep.mode);
    mode.setAttribute("aria-label", g(0));
    const direction = dropdown(Object.keys(directions).map((key, index) => [key, e(index + 2)]), sweep.direction);
    const speed = node("input");
    Object.assign(speed, {type: "number", min: 250, max: 2000, step: 50, required: true, value: sweep.delay});
    speed.onchange = () => { sweep.delay = Number(speed.value); drawOrder(); };
    const color = node("input");
    Object.assign(color, {type: "color", value: sweep.color, title: e(0)});
    color.oninput = () => { sweep.color = color.value; drawOrder(); };
    const end = node("input");
    Object.assign(end, {type: "color", value: sweep.end});
    end.oninput = () => { sweep.end = end.value; drawOrder(); };
    const endField = field(g(2), end);
    const speedField = field(e(6), speed);
    const gradientHelp = node("p", g(9));
    const radialHelp = node("p", radialText(2));
    const directionField = field(e(1), direction);
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
      if (Object.hasOwn(radialModes, sweep.mode)) command.effect = sweep.mode;
      return change(command, effectStatus);
    });
    const stop = action(t(10), () => change({action: "stop"}, effectStatus));
    function drawOrder() {
      const available = new Set((inventory.lights || []).filter(light => light.status !== "unavailable"
        && light.capabilities?.rgb && light.state?.on === true).map(light => light.id));
      const [axis, sign] = directions[sweep.direction];
      const points = wallPoints();
      const groups = inventory.spatial_groups || {};
      const claimed = new Set();
      const radial = Object.hasOwn(radialModes, sweep.mode);
      const position = point => radial
        ? (sweep.mode === "outward" ? 1 : -1) * ((point[0] - 50) ** 2 + (point[1] - 50) ** 2)
        : sign * point[axis];
      const ordered = [...points].sort((a, b) => position(a[1]) - position(b[1])).filter(([id]) => {
        const eligible = (groups[id]?.members || [id]).filter(key => available.has(key) && !claimed.has(key));
        eligible.forEach(key => claimed.add(key));
        return eligible.length > 0;
      });
      const gradient = sweep.mode === "gradient";
      endField.hidden = gradientHelp.hidden = !gradient;
      speedField.hidden = gradient;
      directionField.hidden = radial;
      radialHelp.hidden = !radial;
      const first = ordered[0]?.[1][axis];
      const span = ordered.at(-1)?.[1][axis] - first;
      const startRgb = rgbFromHex(sweep.color), endRgb = rgbFromHex(sweep.end);
      const dispatch = radial ? ordered.map(([id, point], index) => ({id, point,
        due: index * Number(speed.value) - (point[3] || 0)})).sort((a, b) => a.due - b.due)
        : ordered.map(([id, point]) => ({id, point}));
      const numbers = new Map(dispatch.map(({id, point}, index) => {
        const ratio = span ? (point[axis] - first) / span : 0;
        const previewColor = startRgb.map((channel, i) => Math.round(channel + (endRgb[i] - channel) * ratio));
        return [id, {number: index + 1, color: "rgb(" + previewColor.join(",") + ")"}];
      }));
      for (const marker of stage.querySelectorAll(".house-marker")) {
        const entry = numbers.get(marker.dataset.lamp);
        if (sweep.preview && entry) marker.dataset.order = entry.number;
        else delete marker.dataset.order;
        if ((gradient || radial) && sweep.preview && entry) marker.style.setProperty("--gradient-preview", radial ? sweep.color : entry.color);
        else marker.style.removeProperty("--gradient-preview");
      }
      summary.textContent = e(8) + " · " + ordered.length + " / " + points.size;
      play.disabled = isPlaying() || !ordered.length;
      stop.hidden = !isPlaying();
      stop.disabled = playback.state === "stopping";
    }
    refreshEffectButtons = drawOrder;
    mode.onchange = () => { sweep.mode = mode.value; drawOrder(); };
    direction.onchange = () => { sweep.direction = direction.value; drawOrder(); };
    preview.onchange = () => { sweep.preview = preview.checked; drawOrder(); };
    const colorLabel = {nl: "Kleur", en: "Colour", de: "Farbe", es: "Color"}[language()] || "Colour";
    controls.append(field(g(0), mode), directionField, field(colorLabel, color), endField, speedField,
      field(e(7), preview), play, stop);
    section.append(node("h3", g(0)), node("p", e(9)), gradientHelp, radialHelp, controls, summary, effectStatus, reports[1]);
    drawOrder();
    updatePlaybackStatus();
    return section;
  }

  function dimensionsForm() {
    const [widthLabel, heightLabel, saveLabel] = dimensionLabels[language()] || dimensionLabels.nl;
    const input = value => Object.assign(node("input"),
      {type: "number", min: 0.25, max: 20, step: 0.01, value: value ?? "", required: true});
    const width = input(layout.dimensions?.width_m);
    const height = input(layout.dimensions?.height_m);
    const form = node("form", "", "lighting-controls house-dimensions");
    const save = node("button", saveLabel);
    save.type = "submit";
    form.append(field(widthLabel, width), field(heightLabel, height), save);
    form.onsubmit = async event => {
      event.preventDefault();
      save.disabled = true;
      try {
        await change({action: "wall_dimensions", revision: layout.revision,
          width_m: width.valueAsNumber, height_m: height.valueAsNumber}, spatialStatus, "dimensions");
      } finally {
        save.disabled = false;
      }
    };
    return form;
  }

  function renderSpatial(focusId) {
    const owners = wallGroupOwners();
    const placements = wallPoints();
    const lights = new Map(Object.entries(inventory.spatial_groups || {}).map(([id, group]) => [id, {...group, id}]));
    for (const light of inventory.lights || []) if (!owners.has(light.id)) lights.set(light.id, light);
    for (const id of placements.keys()) {
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
      const targetWall = wallId;
      upload.disabled = true;
      try {
        const photo = await importPhoto(file);
        if (targetWall === wallId && !requestedWall) await updateLayout(layout.photoVersion ? new Map() : placements, {photo, revision});
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
    const dimensions = dimensionsForm();
    if (!layout.photoVersion && !layout.dimensions) {
      refreshEffectButtons = undefined;
      spatialSection.replaceChildren(spatialStatus, dimensions, toolbar);
      return;
    }
    const photo = layout.photoVersion ? photoElement : node("div", "", "house-blank-wall");
    const stage = node("div", "", "lighting-spatial-stage");
    if (layout.photoVersion) {
      photo.className = "house-room-photo";
      photo.alt = t(33);
    } else {
      const blankLabel = (dimensionLabels[language()] || dimensionLabels.nl)[3];
      photo.setAttribute("role", "img");
      photo.setAttribute("aria-label", blankLabel + " · " + showDimensions(layout.dimensions));
      stage.style.width = Math.min(720, 480 * layout.dimensions.width_m / layout.dimensions.height_m) + "px";
      photo.style.aspectRatio = layout.dimensions.width_m + " / " + layout.dimensions.height_m;
    }
    stage.append(photo);
    photo.onclick = event => {
      const rect = photo.getBoundingClientRect();
      if (selected && lights.has(selected)) setPosition(selected, 100 * (event.clientX - rect.left) / rect.width,
        100 * (event.clientY - rect.top) / rect.height, placements.get(selected)?.[2]);
    };
    const cards = node("div", "", "house-lamp-list");
    let focus;
    for (const light of lights.values()) {
      const point = placements.get(light.id);
      const choose = action("", () => {
        selected = light.id;
        renderSpatial("list");
      });
      choose.className = "house-lamp-choice";
      choose.setAttribute("aria-pressed", String(light.id === selected));
      const icon = lampImage(light, true);
      choose.append(icon, node("span", light.name));
      const mappingStatus = icon.querySelector("small");
      if (mappingStatus) choose.append(mappingStatus);
      const model = [light.product_name, light.product_code || light.model].filter(value => value && value !== light.name);
      if (model.length) choose.append(node("small", model.join(" · ")));
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
    if (layout.photoVersion) toolbar.append(action(t(23), () => {
      if (window.confirm(t(23) + "?")) return updateLayout(new Map(), {photo: null});
    }));
    const settings = node("div", "", "lighting-controls");
    const selectedPoint = placements.get(selected);
    if (selectedPoint) {
      const range = node("input");
      Object.assign(range, {type: "range", min: 4, max: 40, value: selectedPoint[2] ?? defaultSize});
      range.onchange = () => setPosition(selected, selectedPoint[0], selectedPoint[1], Number(range.value), "range");
      settings.append(field(h(2), range), action(t(21), () => {
        return saveWallPoint(selected, null);
      }));
      const advance = node("input");
      Object.assign(advance, {type: "number", min: 0, max: 1000, step: 1, required: true,
        value: selectedPoint[3] || 0, title: g(4)});
      const lampId = selected;
      advance.onchange = () => {
        if (!advance.reportValidity()) return;
        const [x, y, size = defaultSize] = placements.get(lampId);
        const point = advance.valueAsNumber ? [x, y, size, advance.valueAsNumber] : [x, y, size];
        return saveWallPoint(lampId, point, "advance");
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
    spatialSection.replaceChildren(dimensions, toolbar, spatialStatus, node("p", h(4)), editor, effectControls(stage));
    if (focusId === "dimensions") focus = dimensions.querySelector("button");
    focus?.focus();
  }

  return (page, data) => {
    const visible = page === "home" || page === "house";
    const opening = visible && page !== activePage;
    activePage = page;
    mount.hidden = page !== "home";
    house.hidden = page !== "house";
    nav.textContent = houseTitle.textContent = h(0);
    if (page === "house") {
      renderWallGuide();
      openPlan.textContent = v(0);
      if (initialized) renderWallPicker();
    }
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
    const nextSignature = JSON.stringify([language(), data.groups, data.scenes, data.spatial_groups,
      (data.lights || []).map(light => [light.id, light.name, light.product_code, light.model, light.product_name, light.archetype])]);
    if (initialized && signature !== nextSignature) {
      signature = nextSignature;
      renderShows();
      renderSpatial();
      if (page === "house" && !plan.hidden && !movingWall) renderHouse3d();
      updatePlaybackStatus();
    }
    if (page === "house") refreshEffectButtons?.();
  };
};
