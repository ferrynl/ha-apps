## 2.0.0-beta.23

- Beperk de toegang tot bestanden met GIF's, effecten en productafbeeldingen.
- Laad het Twinkly-logo lokaal en geef technische LedFX-foutdetails niet door aan de browser.
- Bouw op Debian Trixie, voer de app zonder rootrechten uit en controleer lokaal of de app reageert.

## 2.0.0-beta.22

- Open **Mijn Huis** via het hoofdmenu. De foto-editor heeft een eigen pagina met een lampenlijst en productfoto’s voor herkende Twinkly-modellen. Andere lampen hebben een algemene lampillustratie.
- Plaats lampen op je foto, versleep ze en pas de grootte aan met de hoekgreep of schuifregelaar. De grootte wordt samen met de positie op je Home Assistant-server bewaard. Eerdere foto’s en posities blijven beschikbaar.

## 2.0.0-beta.21

- Bewaar shows, foto's en lampplaatsingen op je Home Assistant-server en open ze vanaf elk apparaat met toegang tot de app.
- Zet bestaande shows en de foto-indeling over via **Gegevens uit deze browser overzetten** op Home. Een bestaande serverfoto blijft behouden.
- Start en stop shows vanaf verschillende apparaten. Een lopende show blijft afspelen wanneer je de app sluit.

## 2.0.0-beta.20

- Plaats Twinkly-, Hue- en Govee-lampen op een eigen foto in Spatial Light Studio op Home. De foto en plaatsingen worden in je browser bewaard.
- Bouw op Home een show met opgeslagen scènes van dezelfde gemengde groep. Bepaal de volgorde en wachttijd per stap. Bewaar shows in deze browser en laat Home open tijdens het afspelen.
- Scan beide bèta-containerarchitecturen op bekende kwetsbaarheden. Elke run toont een samenvatting en bevat downloadbare JSON-rapporten met het bètanummer.

## 2.0.0-beta.19

- Toon automatisch previews voor Hue-scènes met kleur, wittemperatuur of alleen helderheid. Scènes zonder lichtgegevens krijgen een neutrale preview. Als een eigen afbeelding niet laadt, blijft de automatische preview zichtbaar.

## 2.0.0-beta.18

- Toon een kleurpreview bij opgeslagen Hue-scènes waar Hue kleuren rapporteert. Kies desgewenst zelf een JPG-, PNG- of WebP-afbeelding per scène.
- Regel het niveau van gemengde LedFX-muziek met een masterfader. Twinkly dimt de pixelframes. Hue en Govee volgen waar helderheid en de vorige stand bekend zijn.
- Stel warm of koel wit in bij Govee-lampen die via LAN een geldige wittemperatuur melden.
- Genereer in GitHub een SPDX-onderdelenlijst (SBOM) voor de bèta-container op AMD64 en ARM64.

## 2.0.0-beta.17

- Bekijk de roadmap en changelog in dezelfde appomgeving als Home, met het Christmas-logo en het volledige menu.
- Bedien Hue-kamers en -zones per Bridge. Schakel ze aan of uit en dim ze als de Bridge die functie rapporteert.
- Activeer bestaande Hue-scènes vanuit de bijbehorende kamer of zone.
- Werk de installatie- en bedieningshandleiding in Home Assistant bij met de juiste appnamen en uitleg over Hue, de changelog en de roadmap.

## 2.0.0-beta.16

- Open vanuit de footer bij het versienummer de wijzigingen van deze versie.
- Doorzoek de changelog op versie of wijziging en klap eerdere versies uit.
- Bekijk in de app welke onderdelen van 2.0 in de bèta zitten, welke punten nog openstaan en wat gepland is voor 2.x en 3.0. Voor 3.0 staan Matter-lampen en Matter-stopcontacten op de roadmap.

## 2.0.0-beta.15

- Add Govee LAN identification, on/off, dimming, RGB and rainbow tests to the Test Center.
- Require readable LAN state before making changes and verify restoration with a fresh status report.

## 2.0.0-beta.14

- Verify the previous Hue lamp state by reading it back from the bridge after each test. Report when the restore command is accepted but the original settings cannot be confirmed.

## 2.0.0-beta.13

- Add Philips Hue to the Test Center with identification, power, dimming, RGB, rainbow and warm/cool white checks per light.
- Use the lamp's advertised capabilities and restore its previous settings after the test or when stopped. Keep pixel mapping checks in the Twinkly section.

## 2.0.0-beta.12

- Smooth shared LedFX color changes for Hue and Govee while keeping the existing update limit.
- Show how old the LedFX frame was when sending and how long each brand's latest command batch took. These measurements exclude the physical reaction of the lights.

## 2.0.0-beta.11

- Start or stop LedFX music from a mixed group on Home. Twinkly receives the existing pixel effects. Supported, switched-on Philips Hue and Govee lights follow one sampled color from the same stream, with at most one color update per second.
- Restore previously known colors on silence or stop. The group displays whether LedFX is playing and shows how many lights can participate.

## 2.0.0-beta.10

- Save named scenes on Home for mixed Twinkly, Hue and Govee groups. Set power and optionally brightness and RGB color.
- Apply a scene to the current group members and see the result of each command per light.

## 2.0.0-beta.9

- Show Philips Hue reachability per light on Home, the Hue page and the network map. Keep known lights visible if the bridge temporarily drops offline.
- Adjust warm or cool white on supported Hue lights from Home and the Hue page, within the limits reported by each light.
- Bring the four Python dependency security updates from the source repository into the beta build.

## 2.0.0-beta.8

- Use the same local brand wordmarks in the navigation and on light cards.

## 2.0.0-beta.7

- Match the visible height of the three navigation wordmarks and display the Hue artwork without the white background or duplicate label.

## 2.0.0-beta.6

- Lock direct and transitive Python dependencies for reproducible builds and Aikido scanning.

## 2.0.0-beta.5

- Use the official Twinkly wordmark and the Philips Hue app icon in the navigation.

## 2.0.0-beta.4

- Reorder the navigation, add local brand logos and place the network map in Security Center.
- Show configured Hue Bridges and their lights on the network map, alongside Twinkly devices.

## 2.0.0-beta.3

- Unified Home and dedicated Twinkly, Philips Hue and Govee pages, with pairing, certificate management and discovery in Settings.
- Create cross-brand groups for power, brightness and RGB. Group commands report accepted, unconfirmed, skipped and failed lights separately.
- Label Govee LAN state and commands as unconfirmed, and expose controls only for capabilities advertised in a local status reply.

## 2.0.0-beta.2

- Start the LED Order test at the upper mapped end of each controller while following its physical wiring.

## 0.1.44-beta.23

- Recover a locally standalone Join controller when its native mapping ID matches every member and its LEDs fill the unique missing offset-zero segment.
- Combine individual physical mapping segments by native offset when the controllers share a mapping ID. Keep the group's coordinate system for spatial tests.

## 0.1.44-beta.22

- Merge native group and movie sync metadata and recover a missing Join master from its reported hardware identity.
- Show and log the specific reason a group mapping or spatial test is blocked. Keep basic tests available for the discovered controllers.
- Allow a missing Join master to be explicitly associated or removed on the Test page. Check offsets, LED totals and the controller's full physical map before saving.

## 0.1.44-beta.21

- Rename beta to Christmas Control Center; preserve addon slug, ports and settings. Philips Hue planned for 2.0, not included yet.

- Studio: compact graphite interface, gold selection, clearer navigation, responsive controls and consistent focus states.
- Preserve existing hardware control and diagnostic routes.
- Add desktop/mobile browser smoke tests and screenshot artifacts.

## 0.1.44-beta.20

- Compact device cards with collapsible effects and responsive controls.
- Individual mapping and diagnostic exports moved to Test Control; device details and removal moved to Settings.
- Translate mapping controls into all four supported languages.

## 0.1.44-beta.19

- Dedicated Test Control page with group selection, combined mapping and visual expected-result cards in four languages.
- Keep group homepage cards focused on normal controls.

## 0.1.44-beta.18

- Combined group mapping preview, local mapping overrides and diagnostic metadata export.
- Physical group tests: identification, RGB, LED order, rainbow and horizontal/vertical sweeps; 15-second timeout.
- Join loads the master layout only and rejects incomplete offsets or coordinates.
- Physical hardware verification remains pending.

## 0.1.44-beta.17

- Use physical coordinates for Sync and Area and require complete master layout and native offsets for Join. Reject missing mappings rather than guessing.
- Area still uses horizontal tiles; native global Area placement is not imported.

## 0.1.44-beta.16

- Join, Sync and Area group modes with distinct realtime pixel routing for patterns and music.
- Area uses ordered horizontal tiles of mapped controllers; native spatial mapping is not yet imported.
- Shared pattern cache and group-mode selector.

# 0.1.44-beta.15

- Geef Kerstrood, Groen en Paars verzadigde snelkleuren.

# 0.1.44-beta.14

- Voeg onder Klassiek een realtime RGB-test toe voor het gekozen apparaat.

# 0.1.44-beta.13

- Log automatisch één waarschuwing wanneer een lamp offline gaat. Blijf op de achtergrond proberen en log het herstel zodra de lamp terug is.
- Laat de netwerkkaart de bestaande wachttijd voor offline lampen respecteren.

# 0.1.44-beta.12

- Toon herkende Twinkly-groepen in Instellingen en als één bedienbaar apparaat op de homepage.
- Vermeld per groep de afzonderlijke lampen. Individuele bediening blijft beschikbaar via de uitklapbare lijst.

# 0.1.44-beta.11

- Geef groepen rechtstreeks op de netwerkkaart een naam. Namen voor herkende Twinkly-groepen blijven aan hun groeps-ID gekoppeld.

# 0.1.44-beta.10

- Herken groepen die Twinkly via `summary.group.uid` rapporteert.
- Toon de groepskaart boven de afzonderlijke lampen en verbind elke lamp met een groepslijn. Toon Koppelen als afgeleid type bij een gedeelde ledindeling.
- Sorteer lampen op hun ledpositie, toon de totale indeling en herken de gezamenlijke naam bij genummerde lampen zoals Muur 1 en Muur 3.

# 0.1.44-beta.9

- Toon op de netwerkkaart of een lamp groepsleider of groepslid meldt, ook als de groeps-ID ontbreekt.
- Maak een door Twinkly gemelde groep en een lokale groep herkenbaar. Een groepsnaam of modus wordt niet uit de rol afgeleid.

# 0.1.44-beta.8

- Toon groepen op de netwerkkaart als één bedienbare kaart met aan/uit, groepsleden en offline-aantal.
- Herken groepen uit de Twinkly-app als de controllers een gedeelde groeps-ID rapporteren. Gebruik de knop Toon losse lampen voor de afzonderlijke verbindingen.

# 0.1.44-beta.7

- Vergroot de netwerkkaart en voeg een schermvullende weergave toe.
- Versleep apparaten, verschuif en zoom de kaart, en zet alle apparaten weer in beeld met één knop. Versleepte posities blijven lokaal bewaard.
- Registreer tot 80 Twinkly-apparaten.

# 0.1.44-beta.6

- Bekijk op de nieuwe pagina Netwerk alle geregistreerde lampen, hun wifi-signaal en de gemeten verbindingsduur.
- Toon bevestigde directe verbindingen tussen Twinkly-lampen als stippellijnen.

# 0.1.44-beta.5

- Verwijder de donkere horizontale en verticale strepen uit de zeven meegeleverde effectpreviews.

# 0.1.44-beta.4

- Toon automatisch geanimeerde previews van Rainbow, Peachy, 24K Future, Paradise, Cotton Candy, Flare en Solar Sparks bij gelijknamige opgeslagen Twinkly-effecten.
- Eigen afbeeldingen en GIF’s hebben voorrang. Na verwijderen verschijnt de meegeleverde preview weer.

# 0.1.44-beta.3

- Koppel een geanimeerde GIF aan een opgeslagen Twinkly-effect. De preview volgt de ID van de animatie als de lamp de volgorde wijzigt.

# 0.1.44-beta.2

- Toon productfoto’s met een transparante achtergrond. De PNG-bestanden worden met de bèta meegeleverd.

# 0.1.44-beta.1

- Herken de Twinkly Curtain TWW210SPP met 210 RGB+W-leds en toon de officiële productfoto.
- Breid modelherkenning en foto’s uit naar 28 productreeksen. Opgehaalde foto’s worden lokaal bewaard.
- Toon het Twinkly-icoon bij onbekende modellen en bij ontbrekende foto’s. Ook offline lampen met een opgeslagen modelcode tonen hun productinformatie.

# 0.1.43-beta.1

Bètaversie van Twinkly Control Center.

# 0.1.43

- Toon onbereikbare lampen als Offline en voeg een verwijderknop toe.
- Schrijf verbindingsfouten, herstel en verwijdering naar de Home Assistant-app-logboeken.

# 0.1.42

- Geef beide Home Assistant-appkaarten een eigen icoon en een korte beschrijving.
- Voeg een logo en introductie toe aan beide apppagina’s.

# 0.1.41

- Kies in Home Assistant tussen de stabiele app en een afzonderlijke bèta zodra die beschikbaar is.
- GitHub valideert beide installatievarianten en controleert de containerstart vóór publicatie.
- Werk de beschrijving en installatiehandleiding bij.

# 0.1.40

- Voeg tien LedFX-muziekstijlen toe, elk met een geanimeerd kerstboomvoorbeeld.

# 0.1.39

- Herstel de opstartfout van 0.1.38.
- Controleer Python-syntax, dashboard en geanimeerde muziek-GIF’s tijdens de Docker-build.

# 0.1.38

- Voorkom dat de browser na een update een oude Twinkly-interface blijft gebruiken.

# 0.1.37

- Kies uit zestien bewegende kerstboom-GIF’s in de muziekgalerij.
- Pas een muziekstijl met één klik toe en herken de actieve stijl aan de groene rand.

# 0.1.36

- Voeg zes LedFX-muziekstijlen toe aan de bediening en scènes.
- Bekijk en download een geanimeerd kerstboomvoorbeeld per muziekstijl.
- Neem live LedFX-frames op als kerstboom-GIF.

# 0.1.35

- Detecteer automatisch de broadcastadressen van actieve netwerkinterfaces.
- Controleer de lokale LedFX-API en Sendspin en toon installatie- en startinstructies.

# Wijzigingslogboek

## 0.1.34

- Bouw en speel lichtshows met livepatronen, GIF’s en muziekstappen.
- Stel per stap een groep, duur en helderheid in.
- Bewaar maximaal acht favorieten op de mengtafel.

## 0.1.33

- Meld definitieve lampfouten met UTC-tijd, lampnaam, IP en opdracht.
- Groepeer terugkerende fouten en laat automatische herstelpogingen geleidelijk minder vaak lopen.
- Vraag openbare apparaatinfo eerst zonder toegangstoken op.

## 0.1.32

- Toon de Matrix-GIF-galerij direct rechts onder het muziekkanaal.
- Voeg 50 nieuwe animaties toe in Ruimte, Tropisch, Retro, Pastel en Middernacht.

## 0.1.31

- Voeg 50 originele geanimeerde matrix-GIF’s toe met vierkante previews.
- Groepeer ze in vijf thema’s en bewaar de GIF-bestanden in een aparte map in de add-on.

## 0.1.30

- Voeg 50 ingebouwde livepatronen toe in vijf nieuwe categorieën.
- Gebruik dezelfde categorieën bij het maken van GIF’s.

## 0.1.29

- Herken ook GIPHY-afbeeldingslinks met een versietoken of met i.giphy.com.
- Probeer een extra kleine GIPHY-versie als de grotere versie niet past.

## 0.1.28

- Importeer gewone GIPHY-deellinks en directe GIPHY-afbeeldingslinks in de lokale GIF-bibliotheek.

## 0.1.27

- Verplaats de live-effectengalerij naar de mengtafel.
- Upload, maak, importeer en download GIF’s in een lokale bibliotheek.
- Speel GIF-kleuren rechtstreeks af op lampen of groepen.

## 0.1.26

- Voeg acht live patronen toe voor een lamp, groep of alle lampen zonder ze op de controllers op te slaan.

## 0.1.25

- Maak het tv-scherm compacter en voeg een live lichtmonitor met uitgangsniveau toe.
- Toon welke lampen op muziek staan en spring met één klik naar hun bediening.
- Voeg vijf snelkleuren toe voor alle lampen.

## 0.1.24

- Plaats Control Center in goud direct onder het Twinkly-logo en verwijder de losse kopteksten.

## 0.1.23

- Toon het volledige officiële Twinkly-logo in goud op een transparante achtergrond.
- Bewaar het SVG na de eerste download lokaal.

## 0.1.22

- Hernoem de app naar Twinkly Control Center.
- Voeg een lokaal, transparant Twinkly-beeldmerk toe aan het dashboard en het browsertabblad.

## 0.1.21

- Splits het mengpaneel in Bediening en Instellingen.
- Groepeer de lampbediening, scènepads en muziekbediening in een compactere responsieve indeling.
- Verplaats koppelingen, apparaatdetectie en groeps-, scène- en effectbeheer naar Instellingen.

## 0.1.20

- Gebruik dezelfde lokale hoesafbeelding als de Home Assistant-mediaspelerkaart.
- Geef bij automatische bronselectie voorrang aan een overeenkomende speler die een hoes meldt.

## 0.1.19

- Toon ook YouTube-miniaturen van de officiële afbeeldingsserver naast de lokale hoesafbeeldingen.
- Gebruik een beschikbare directe hoes als terugvaloptie als de lokale afbeelding faalt.
- Verwijder het automatisch laden van externe videobronnen.

## 0.1.18

- Kies de Home Assistant-mediaspeler rechtstreeks bij het tv-scherm.
- Bewaar de keuze centraal zonder herstart en bied automatische bronselectie aan.

## 0.1.17

- Maak van Nu speelt een tv-scherm met grotere hoesweergave.
- Gebruik de afbeelding van een overeenkomende Home Assistant-mediaspeler of een ingestelde speler.
- Toon videobediening als de speler een directe HTTPS MP4- of WebM-bron rapporteert.

## 0.1.16

- Toon de huidige Music Assistant-track in de mengtafel via LedFX Sendspin-metadata.
- Toon de albumhoes wanneer LedFX een lokale versie beschikbaar stelt.

## 0.1.15

- Voeg scènepads en eigen scènes per groep toe.
- Bewaar een centrale masterhelderheid voor muzieklicht.
- Toon muziekframes op de ledkaart en voeg stiltegedrag per groep toe.

## 0.1.14

- Bewaar de actieve muziekstijl centraal en toon die op alle browsers en na herstarts.
- Houd een nog niet toegepaste stijlkeuze apart van de actieve stijl.

## 0.1.13

- Vergroot de productfoto en verwijder de productlink en de toelichting onder de modelnaam.
- Bewaar opgehaalde productfoto’s lokaal tussen herstarts.

## 0.1.12

- Herken Twinkly Strings en Line op basis van de modelcode en toon bij ondersteunde reeksen een officiële referentiefoto.
- Lees bij bestaande apparaten de modelcode op de achtergrond uit.

## 0.1.11

- Verzend realtimeframes via één UDP-socket met een automatisch toegewezen bronpoort. Dit voorkomt een poortconflict wanneer meerdere Twinkly-lampen tegelijk op muziek reageren.

## 0.1.10

- Schermbrede, responsieve DJ-mengtafel met licht- en muziekbediening.
- Apparaatdiagnose met firmware, hardware, ledgegevens en wifi-informatie als de controller die meldt.

## 0.1.9

- Voeg Lichtloop, Muziekbanden, Blade Power+, Frequentiepuls en Muziekvuur toe.
- Bekijk de echte LedFX-frames als bewegende lichtbalk en neem een downloadbaar gifje op.

## 0.1.8

- Maak, bewerk en verwijder groepen en bedien de gekozen lampen tegelijk.
- Upload, vervang en verwijder eigen afbeeldingen bij lokale effecten.
- Groepen en afbeeldingen blijven bewaard in de appdata.

## 0.1.7

- Lees per controller de opgeslagen ledposities uit en toon die in een ledkaart.
- Draai 3D-kaarten en herken door de controller berekende layouts.
- Hergebruik ledposities twee minuten uit de cache.

## 0.1.6

- Speel het echte effect af op de lamp vanuit de effectkiezer.
- Bewaar herkenbare eigen namen per lamp en effect in je browser.
- Verwijder de illustratieve patronen die geen weergave van het echte effect waren.

## 0.1.5

- Kies een muziekstijl in het dashboard: Energiepuls, Kleurenspectrum, Bas en slag, Kleurgolf of Stroboscoop.
- Pas de stijl toe op alle lampen waarop Muziek is ingeschakeld.

## 0.1.4

- De knoppen Aan en Uit tonen per lamp de laatst gemeten status.
- De app schakelt de kleurmodus via de lokale Twinkly-API en toont meer details bij fouten.
- Lokale effecten hebben klikbare kaarten met illustratieve voorbeeldbeelden.

## 0.1.3

- Vernieuwd dashboard met Nederlands, Engels, Spaans en Duits.
- Aan probeert de laatst gebruikte lichtmodus te herstellen.
- Kleur gebruikt de lokale Twinkly-API.
- Opgeslagen films en ingebouwde effecten zijn per apparaat te laden.

## 0.1.2

- Koppel Music Assistant vanuit het Twinkly Kerst-dashboard.
- Configureer de Sendspin-bron en gedeelde DDP-uitgang in LedFX.

## 0.1.1

- Toon afgewezen opdrachten en netwerkfouten per apparaat.
- Ondersteun een instelbaar broadcastadres voor ontdekking.

## 0.1.0

- Eerste Home Assistant-app voor lokale bediening van RGB- en RGBW-Twinkly-verlichting.
- Zoek apparaten op het netwerk of voeg ze via IP toe.
- Bedien lampen afzonderlijk of tegelijk en stuur muziekeffecten van LedFX door.
