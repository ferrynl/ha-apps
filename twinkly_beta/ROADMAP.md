# 2.0 — Twinkly, Philips Hue en Govee

## In de bèta
- **Home en merkpagina’s.** Eén bediening voor de drie merken, met aparte merkpagina’s en verbindingsbeheer in Instellingen.
- **Hue Entertainment.** Realtime regenboog en zonsondergang op de Hue-pagina. De gebruiker kiest een Entertainment-zone en helderheid. De effectkeuze en helderheid blijven tijdens het navigeren bewaard.
- **Hue-kamers, zones en scènes.** Bedien kamers en zones per Bridge en activeer opgeslagen Hue-scènes op de merkpagina. Basisbediening is in de praktijk bevestigd. Bij scènes zie je een automatische preview op basis van kleur, wittemperatuur of helderheid. Je kunt ook een eigen afbeelding toevoegen.
- **Gemengde groepen en scènes.** Aan/uit, helderheid en kleur voor ondersteunde lampen, met resultaat per lamp.
- **LedFX.** Twinkly krijgt pixeleffecten. Hue-kleurenlampen volgen de muziek realtime via een passende Entertainmentruimte. Ondersteunde Govee-lampen volgen dezelfde muziek met maximaal één kleurupdate per seconde. De masterfader regelt het niveau van de gemengde muziekgroep.
- **Testcentrum.** Twinkly-ledmapping, Hue-tests en Govee-LAN-tests. De app leest bij Hue en Govee na afloop de stand opnieuw uit om het herstel te controleren.
- **Govee-cloud.** Optionele officiële koppeling voor scènes en segmenten. De app bewaart gesynchroniseerde lampen ook na een herstart. Het model en de ondersteunde functies komen uit het Govee-account. Na een geaccepteerde opdracht kun je de reactie op de lamp controleren en op het scherm bevestigen.
- **Govee-wittemperatuur.** Warm en koel wit bij lampen met een geldige LAN-terugmelding.
- **Showbouwer.** Maak op Home een reeks opgeslagen scènes voor één gemengde groep, met een wachttijd per stap. Shows worden op de Home Assistant-server bewaard en spelen onafhankelijk van de browser af. Stop een actieve show vanuit elke sessie.
- **Spatial Light Studio.** Open Mijn Huis om lampen op een 2D-foto te plaatsen, te verslepen en groter of kleiner te maken. Bewaar meerdere muren met eigen maten en lampplaatsingen op de Home Assistant-server. Per muur kun je een foto toevoegen. De 3D-weergave gebruikt de opgegeven maten. Speel een kleurverloop of kleurveeg in vier richtingen, vanuit het midden of vanaf de buitenkant. Bekijk de volgorde vooraf op de foto. Geef trager reagerende lampen per lamp een handmatige timingcorrectie. Kies per muur een kamer en wandzijde en bekijk je muurfoto’s en lampen in een draaibaar 3D-model.
- **Beveiliging.** Netwerkkaart in het Security Center, een Python-lockfile, bijgewerkte afhankelijkheden en een SBOM per bèta-containerarchitectuur. GitHub scant beide containerarchitecturen en maakt per bètaversie een beveiligingsrapport. Het Security Center toont broncode en release, de actieve Python-bibliotheken en lokale controles op Ingress en sleutelbestanden. Open per architectuur het GitHub-rapport van de geïnstalleerde bèta en bekijk de bevindingen en de SBOM.

- **3D-plattegrond.** Plaats tot 24 muren in acht kamers. Geef kamers een naam, verplaats muren op twee assen in meters en draai muren en lampen. Plaats per kamer een verlichte kerstboom en stel de positie, hoogte en draaihoek in.

- **Hue-productfoto’s.** Upload per model een transparante PNG op de Hue-pagina en gebruik dezelfde lokale foto in Mijn Huis, ook in 3D.

- **Demo lichtshow.** De show begint met een blackout en gebruikt daarna de lampposities in de gekozen kamer. Gekoppelde Twinkly-lampen spelen als één groep.
- **Kamerplattegrond.** Koppel muren aan Home-kamers in 2D, stel verlichting in op volle muurbreedte en versleep hele kamers op één plattegrond en toon een plafond in 3D. Kamerposities werken door in 3D.

## Testdekking
- **GitHub.** Browsertests simuleren Hue Entertainment starten en stoppen met bevestigde vrijgave en controleren Govee-synchronisatie, scènes, segmentkleur en segmenthelderheid. De reactie van de fysieke lampen wordt tijdens de praktijktests gecontroleerd.

## Open voor stabiel
- **Mijn Huis.** Vul de ingebouwde Hue-fotocatalogus aan voor modellen zonder geverifieerde transparante bronfoto.
- **Hue Entertainment.** Test op een fysieke Bridge achtereenvolgens starten, dimmen, stoppen en vrijgave van de Entertainmentruimte. Herhaal via LedFX op Home.
- **Govee.** Synchroniseer een echt account en controleer na een herstart de lampenlijst. Test scènes en segmentkleur en -helderheid op ondersteunde modellen.
- **Spatial Light Studio.** Praktijktests voor de timingcorrectie. Bekijk per stap het verschil tussen geplande en werkelijke verzendtijd en controleer de lichtreactie op de muur.
- **Security Center.** Aikido-audit voor stabiel. Het auditresultaat moet nog worden beoordeeld.
- **Praktijktests.** De Hue-basisbediening is in de praktijk bevestigd. De Twinkly-muur, Govee en werking, timing en herstel van gemengde groepen staan nog op de testlijst. Home toont na het stoppen van gemengde muziek de uitkomst per merk.

# 2.x — Verbeteringen na 2.0

## Gepland
- Stabiliteit, snelheid, betere synchronisatie tussen merken en nieuwe effecten.

# 3.0 — Matter en uitgebreidere lichtshows

## Gepland
- **Matter-lampen.** Aan/uit, dimmen, kleur en kleurtemperatuur voor zover het apparaat die functies ondersteunt.
- **Matter-stopcontacten.** Aan/uit en status in de app, met bediening vanuit groepen en scènes. De precieze koppeling en ondersteunde apparaten worden nog uitgewerkt.
- **Lasers en lichtshows.** Integratie van lasers met een aparte veiligheidslaag, gecombineerd met verlichting in uitgebreidere shows.
- **DMX en Art-Net.** Voorbereiding in de architectuur is besproken. De concrete protocolondersteuning staat nog open.
