# Ferry’s Home Assistant-apps

Voeg één keer [deze repository](https://github.com/ferrynl/ha-apps) toe aan de appstore van Home Assistant OS.

1. Open **Instellingen → Apps → App installeren → ⋮ → Repositories**.
2. Voeg `https://github.com/ferrynl/ha-apps` toe.
3. Kies in de appstore de gewenste app en klik op **Installeren**.

| App | Installatie en configuratie |
| --- | --- |
| Christmas Control Center | [Stabiele app](twinkly/DOCS.md) voor dagelijks gebruik. |
| Christmas Control Center Beta | Aparte app voor nieuwe licht-, groeps- en muziekeffecten. Zoek deze naam in de Appwinkel zodra er een [bètarelease](https://github.com/ferrynl/ha-twinkly/releases) is. |
| Home Invest | [Handleiding](portfolio/DOCS.md) |
| HA-Bandwidth | [Handleiding](ha_bandwidth/DOCS.md) |
| MyBanksFlow (amd64) | [Handleiding](mybanksflow/DOCS.md) |

## Overstappen vanaf een losse repository

Home Assistant behandelt dezelfde app uit deze repository als een aparte installatie. Maak eerst een back-up van de oude app en exporteer waar mogelijk je appgegevens. Stop de oude app voordat je de nieuwe start om poortconflicten te voorkomen. Controleer de instellingen en gegevens in de nieuwe installatie voordat je de oude app of repository verwijdert.

## Updates

De centrale repository synchroniseert normaal gesproken elk kwartier de installatiemappen van de bronrepositories. Onder **Actions** kan de beheerder ook handmatig synchroniseren. Twinkly volgt gepubliceerde, geteste GitHub-releases per kanaal. Home Assistant toont een app-update wanneer de versie in de appconfiguratie is verhoogd.
