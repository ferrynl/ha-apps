# 2.0 — Twinkly, Philips Hue en Govee

## In de bèta
- **Home en merkpagina’s.** Eén bediening voor de drie merken, met aparte merkpagina’s en verbindingsbeheer in Instellingen.
- **Hue-kamers, zones en scènes.** Bedien kamers en zones per Bridge en activeer opgeslagen Hue-scènes op de merkpagina. Basisbediening is in de praktijk bevestigd. Bij scènes zie je een automatische preview op basis van kleur, wittemperatuur of helderheid. Je kunt ook een eigen afbeelding toevoegen.
- **Gemengde groepen en scènes.** Aan/uit, helderheid en kleur voor ondersteunde lampen, met resultaat per lamp.
- **LedFX.** Twinkly krijgt pixeleffecten. Ondersteunde Hue- en Govee-lampen volgen dezelfde muziek met maximaal één kleurupdate per seconde. De masterfader regelt het niveau van de gemengde muziekgroep.
- **Testcentrum.** Twinkly-ledmapping, Hue-tests en Govee-LAN-tests. De app leest bij Hue en Govee na afloop de stand opnieuw uit om het herstel te controleren.
- **Govee-wittemperatuur.** Warm en koel wit bij lampen met een geldige LAN-terugmelding.
- **Showbouwer.** Maak op Home een reeks opgeslagen scènes voor één gemengde groep, met een wachttijd per stap. De show wordt in deze browser opgeslagen en loopt zolang Home open is.
- **Spatial Light Studio.** Plaats lampen op een eigen 2D-foto. De foto en plaatsingen blijven in deze browser.
- **Beveiliging.** Netwerkkaart in het Security Center, een Python-lockfile, bijgewerkte afhankelijkheden en een SBOM per bèta-containerarchitectuur. GitHub scant beide containerarchitecturen en maakt per bètaversie een beveiligingsrapport.

## Open voor stabiel
- **Philips Hue.** Realtime effecten via Hue Entertainment.
- **Govee.** Ondersteuning per model verder uitwerken, inclusief scènes, segmenten en de optionele officiële cloud-API.
- **Spatial Light Studio.** Effecten op basis van gedeelde coördinaten en vertragingskalibratie. Een 3D-weergave is optioneel.
- **Security Center.** Aikido-audit voor stabiel.
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
