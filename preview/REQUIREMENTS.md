# Vaste afspraken voor de nieuwe UWFL-versie

Door Jakko bevestigd na de bezoekersaudit van 16 september 2026. Deze afspraken
sturen de verdere bouw; dit bestand zegt niet dat de productie-integratie al is
uitgevoerd of getest.

## Eerst goedkeuring door Jakko

- Alle aanmeldingen van makers, overige deelnemers, sponsors en organisaties
  wachten op handmatige goedkeuring door Jakko voordat zij in de app verschijnen.
- Ook alle paneelinzendingen, foto's en andere uploads wachten op goedkeuring.
  Een upload door een reeds goedgekeurde deelnemer is niet automatisch goedgekeurd.
- Nieuwe of gewijzigde openbare inhoud mag de goedkeuringsstap niet overslaan.
- De bevestiging na insturen betekent ontvangst voor beoordeling, geen publicatie.
- De nieuwe versie moet de bestaande moderatie behouden. Voor publicatie moet
  de echte keten insturen, beoordelen en pas daarna zichtbaar worden zijn getest.

## Verplichte afbeeldingen

- Een deelnemersfoto is verplicht voor iedere deelnemer.
- Een logo is verplicht voor sponsors en organisaties.
- Formulier, uitleg en controle bij goedkeuring moeten dezelfde eisen hanteren.
- Een contactvraag maakt geen openbaar profiel aan.
- Ontbrekend beeld bij bestaande profielen wordt ter beoordeling gemeld; de
  herbouw verwijdert of wijzigt niet automatisch bestaande goedgekeurde records.

## Gelijkwaardige zichtbaarheid

- Makers, overige deelnemers, sponsors en organisaties worden in willekeurige
  volgorde getoond. Ook een selectie van profielen op de startpagina mag geen
  vaste voorkeursplaatsen introduceren.
- Bij een nieuw bezoek wordt de volgorde opnieuw bepaald. Tijdens lezen,
  zoeken en filteren blijft die stabiel, zodat kaarten niet verspringen.
- Deelnemersnummers, inschrijfdatum of hoogte van een bijdrage bepalen geen rangorde.
- Kaarten en logovakken krijgen een gelijkwaardige presentatie.
- Jakko's deelnemersprofiel doet mee in dezelfde wisselende volgorde.

## Een herkenbare plek voor de initiatiefnemer

- De startpagina krijgt een duidelijk herkenbaar onderdeel over Jakko Woudenberg,
  Dutch Wood Artist, als initiatiefnemer van UWFL Pay It Forward.
- Dit onderdeel maakt zichtbaar wie het project is begonnen en waarom: de
  persoonlijke aanleiding en de verbinding tussen vakmanschap, creativiteit en
  mensen helpen. Het bestaande initiatorverhaal vormt de inhoudelijke basis.
- Gebruik zijn eigen portret en behoud de bijbehorende fotocredits. Bij het
  bestaande beeld met open armen op De Nachtwacht in Hout: Bram Belloni.
- Verwijs rechtstreeks door naar het volledige bestaande initiatorverhaal.
- Deze uitleg over het ontstaan staat los van de wisselende deelnemerslijsten.
- Bestaande verhaalteksten worden niet ongevraagd herschreven. Nieuwe formuleringen
  worden als voorstel gepresenteerd.

## Eerst een beoordeelbare ontwerpversie

- De afgesproken verbeteringen worden eerst in de afzonderlijke ontwerpversie gebouwd.
- De ontwerpformulieren blijven duidelijk als simulatie aangeduid zolang de
  productie-integratie niet is voltooid.
- De bestaande live app wordt pas vervangen na beoordeling en akkoord van Jakko.

## De bedoeling direct zichtbaar

Jakko heeft na het bekijken van de ontwerpversie de kern verder verduidelijkt:

- De gezamenlijke kracht zit in samenwerking van de hele wereldwijde
  houtenvloerenbranche: makers, fabrikanten, leveranciers, opleiders,
  vakorganisaties en vakmedia. Iedereen blijft welkom, ook buiten de branche.
- Houten panelen van afzonderlijke makers vormen samen één gezamenlijk
  kunstwerk: One Artfloor.
- Makers leren van elkaar, delen kennis en geven het ambacht door aan volgende
  generaties.
- Iedere deelnemer helpt drie mensen en vraagt hun die hulp verder door te geven.
- Het kunstwerk reist eerst. Tijdens die reis toont de branche haar vakmanschap
  en de kunstvorm in het ambacht, blijft zij mensen bij het project betrekken
  en brengt zij het helpen van anderen onder de aandacht.
- Pas na die reis is het doel schenking aan één of meerdere betekenisvolle
  publieke locaties. De makers kunnen de vloer daar ook gezamenlijk leggen.
  Het kunstwerk wordt nooit verkocht.
- De eerste blik op de startpagina moet de concrete bedoeling én de gezamenlijke
  ambitie begrijpelijk maken. De zes bezoekersroutes blijven direct bereikbaar.
- Mogelijke gezamenlijke impact wordt als ambitie uitgelegd. Geen verzonnen
  resultaten, gegarandeerde aantallen geholpen mensen of claim dat de hele
  branche al meedoet.

## Bijdragers zonder paneel

- Bijdragers krijgen een eigen, gelijkwaardige ingang naast makers, sponsors,
  organisaties, bezoekers en media.
- Zij kunnen het project steunen zonder zelf een paneel te maken, bijvoorbeeld
  met vervoer, communicatie, fotografie, vertalen, kennis of tijd.
- Ook iedere bijdrager helpt drie mensen en vraagt hun die hulp door te geven.
- De aanmelding gebruikt de bestaande rol `contributor`. De verplichte foto,
  goedkeuring door Jakko en gelijkwaardige zichtbaarheid gelden ook voor hen.

## Overzicht per land en bijdrage

- Het overzicht onderscheidt makers, sponsors, organisaties, bijdragers/helpers
  en mediapartners. Vakorganisaties, scholen en opleidingen vallen onder organisaties.
- Een landfilter werkt zowel op de groepsaantallen als op de bijbehorende profielen.
  Verschillende schrijfwijzen van hetzelfde land tellen als één land.
- De eigen aanmeldrol blijft zichtbaar op ieder persoonlijk profiel. De bestaande
  rol Initiator wordt niet zonder besluit omgezet naar Maker.
- Alleen gegevens uit de bestaande goedgekeurde publieke lijsten tellen mee.
  Een onbekend aantal of een laadfout wordt niet als nul gepresenteerd.
- Media kunnen bijdragen door over het project te vertellen, publiceren of uitzenden.
  Zij krijgen een eigen profielroute met verplicht logo en goedkeuring door Jakko.
  In de ontwerpversie is die route een simulatie. Voor livegang is een expliciete
  mediacategorie en bijbehorende goedgekeurde openbare gegevensbron nodig.

## Stand na de ontwerpverbeteringen

De bekeken servercode schrijft nieuwe deelnemers, sponsors, organisaties en
panelen als `pending` weg. De vier publieke lijsten vragen alleen `approved`
records op. Dit is een broncodecontrole, geen volledige test van productie of
van wie op dit moment toegang heeft tot het beheer.

De preview schudt nu deelnemers, sponsors, organisaties en panelen bij het eerste
laden van iedere openbare lijst. Die volgorde blijft tijdens hetzelfde bezoek
behouden, ook bij zoeken, filteren en terugnavigeren. Een nieuw bezoek krijgt
een nieuwe volgorde. De kaarten gebruiken gelijkwaardige beeldvakken.

Alle vier deelnemersrollen vragen verplicht een foto. Sponsor- en
organisatieprofielen vragen verplicht een logo. De lokale afbeeldingselectie
hanteert de bestaande grens van 5 MB. Contactvragen blijven gescheiden van
openbare profielconcepten. Formulieren leggen de goedkeuring vooraf uit en
voegen na een gesimuleerde inzending niets toe aan de openbare lijsten.

Jakko heeft nu een eigen onderdeel op de startpagina, met zijn portret,
fotocredit, een letterlijk citaat uit zijn oorspronkelijke verhaal en een link
naar dat volledige verhaal. Ook de bezoekersroute en de pagina over UWFL
verwijzen naar de initiatiefnemer.

Dit is nog steeds een ontwerpversie: de verplichte afbeeldingen en moderatie
moeten bij de latere productie-integratie ook op de server en in het beheer
worden gecontroleerd. De bestaande live app en haar gegevens zijn niet gewijzigd.


## Groei per werelddeel en gezamenlijk samenbrengen

- Elk werelddeel kan groeien met eigen lokale partners, inzameling en
  toonmomenten. Die laten de panelen zien en betrekken nieuwe makers, sponsors,
  organisaties en andere bijdragers. Het blijft één wereldwijd UWFL-project.
- Het gezamenlijke doel is uiteindelijk alle panelen uit de hele wereld
  fysiek samen te brengen tot één kunstwerk. Plaats en tijd zijn nog open.
- Ook de verdere reis, uiteindelijke schenking en duur van het project hebben
  nog geen vaste planning. De gezamenlijke paneelafspraken en het helpen van
  drie mensen blijven overal gelden.
- De NWFA-stand biedt ruimte voor een kickoff en presentatie. Het huidige
  aanlevertraject geldt voor geselecteerde panelen uit de Amerika’s, Canada
  inbegrepen. De bestaande Texas-planning 27–29 april 2027 blijft de werkdatum.
- EU-panelen worden voorlopig verzameld via T&G Wood International. Transport
  naar de Amerikaanse Expo is niet geregeld. Een mogelijk Europees toonmoment
  in 2027 is in voorbereiding voor EU-panelen, om nieuwe mensen te betrekken.
- Voor overige landen worden aanlevering en lokale mogelijkheden afzonderlijk
  afgestemd. Er is geen automatische verwijzing naar een EU-inzameladres.
- Aanmelden en goedgekeurd meedoen aan UWFL staan los van selectie voor één Expo.
  Expo-deadlines zijn geen sluitingsdatum voor het hele project.

## Privé verzendgegevens en mails per locatie

- Verzendadressen, contactgegevens en persoonlijke aanleverafspraken staan
  uitsluitend in persoonlijke mails, nooit in de openbare app of downloads.
- Het huidige land waaruit het paneel wordt verzonden bepaalt de route,
  samen met de bestemming die Jakko voor dat paneel bevestigt. Nationaliteit
  of een oude registratieplaats mogen geen verkeerde verzendmail veroorzaken.
- Alleen paneelgoedkeuring is geen verzendtoestemming. Eerst moeten bestemming
  en verzending zijn bevestigd; voor Expo-aanlevering ook de selectie.
- Bij ontbrekende of onbekende afspraken krijgt iemand een statusbericht en
  wacht die op persoonlijke instructies. Er worden geen adressen gegokt.
- EU-inzameling, Amerika’s/Expo en overige landen krijgen passende berichten
  in de gekozen taal. Jakko moet de bedoelde route en instructies kunnen
  controleren voordat echte verzending wordt vrijgegeven.
- De nieuwe mailteksten en regioselectie worden eerst offline en met fictieve
  voorbeelden beoordeeld. De bestaande externe mailverzending wordt pas bij
  de latere productie-integratie aangesloten en getest.
