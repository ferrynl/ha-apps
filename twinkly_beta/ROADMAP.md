# 2.0 — Twinkly, Philips Hue en Govee

## In de bèta
- **Home en merkpagina’s.** Eén bediening voor de drie merken, met aparte merkpagina’s en verbindingsbeheer in Instellingen.
- **Hue Entertainment.** Realtime regenboog en zonsondergang op de Hue-pagina. De gebruiker kiest een Entertainment-zone en helderheid. Een praktijktest met een fysieke Bridge staat nog open.
- **Hue-kamers, zones en scènes.** Bedien kamers en zones per Bridge en activeer opgeslagen Hue-scènes op de merkpagina. Basisbediening is in de praktijk bevestigd. Bij scènes zie je een automatische preview op basis van kleur, wittemperatuur of helderheid. Je kunt ook een eigen afbeelding toevoegen.
- **Gemengde groepen en scènes.** Aan/uit, helderheid en kleur voor ondersteunde lampen, met resultaat per lamp.
- **LedFX.** Twinkly krijgt pixeleffecten. Hue-kleurenlampen volgen de muziek realtime via een passende Entertainmentruimte. Ondersteunde Govee-lampen volgen dezelfde muziek met maximaal één kleurupdate per seconde. De masterfader regelt het niveau van de gemengde muziekgroep.
- **Testcentrum.** Twinkly-ledmapping, Hue-tests en Govee-LAN-tests. De app leest bij Hue en Govee na afloop de stand opnieuw uit om het herstel te controleren.
- **Govee-cloud.** Optionele officiële koppeling voor scènes en segmenten. Het model en de ondersteunde functies komen uit het Govee-account.
- **Govee-wittemperatuur.** Warm en koel wit bij lampen met een geldige LAN-terugmelding.
- **Showbouwer.** Maak op Home een reeks opgeslagen scènes voor één gemengde groep, met een wachttijd per stap. Shows worden op de Home Assistant-server bewaard en spelen onafhankelijk van de browser af. Stop een actieve show vanuit elke sessie.
- **Spatial Light Studio.** Open Mijn Huis om lampen op een 2D-foto te plaatsen, te verslepen en groter of kleiner te maken. Bewaar meerdere muren met elk een eigen foto en lampplaatsingen op de Home Assistant-server. Speel een kleurverloop of kleurveeg in vier richtingen, vanuit het midden of vanaf de buitenkant. Bekijk de volgorde vooraf op de foto. Geef trager reagerende lampen per lamp een handmatige timingcorrectie. Kies per muur een kamer en wandzijde en bekijk je muurfoto’s en lampen in een draaibaar 3D-model.
- **Beveiliging.** Netwerkkaart in het Security Center, een Python-lockfile, bijgewerkte afhankelijkheden en een SBOM per bèta-containerarchitectuur. GitHub scant beide containerarchitecturen en maakt per bètaversie een beveiligingsrapport. Het Security Center toont broncode en release, de actieve Python-bibliotheken en lokale controles op Ingress en sleutelbestanden. Open per architectuur het GitHub-rapport van de geïnstalleerde bèta en bekijk de bevindingen en de SBOM.

## Open voor stabiel
- **Govee.** Scènes en segmenten in de praktijk testen met een Govee-account en geschikte modellen.
- **Spatial Light Studio.** Praktijktests voor de timingcorrectie.
- **Security Center.** Aikido-audit voor stabiel. Het auditresultaat moet nog worden beoordeeld.
- **Praktijktests.** Hue-tests zijn in de praktijk bevestigd. De Twinkly-muur, Govee en werking, timing en herstel van gemengde groepen staan nog op de testlijst.

# 2.x — Verbeteringen na 2.0

## Gepland
- Stabiliteit, snelheid, betere synchronisatie tussen merken en nieuwe effecten.

# 3.0 — Matter en uitgebreidere lichtshows

## Gepland
- **Matter-lampen.** Aan/uit, dimmen, kleur en kleurtemperatuur voor zover het apparaat die functies ondersteunt.
- **Matter-stopcontacten.** Aan/uit en status in de app, met bediening vanuit groepen en scènes. De precieze koppeling en ondersteunde apparaten worden nog uitgewerkt.
- **Lasers en lichtshows.** Integratie van lasers met een aparte veiligheidslaag, gecombineerd met verlichting in uitgebreidere shows.
- **DMX en Art-Net.** Voorbereiding in de architectuur is besproken. De concrete protocolondersteuning staat nog open.
