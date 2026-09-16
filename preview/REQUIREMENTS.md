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
  bestaande beeld met De Nachtwacht in Hout: Cora Deutecom.
- Verwijs rechtstreeks door naar het volledige bestaande initiatorverhaal.
- Deze uitleg over het ontstaan staat los van de wisselende deelnemerslijsten.
- Bestaande verhaalteksten worden niet ongevraagd herschreven. Nieuwe formuleringen
  worden als voorstel gepresenteerd.

## Eerst een beoordeelbare ontwerpversie

- De afgesproken verbeteringen worden eerst in de afzonderlijke ontwerpversie gebouwd.
- De ontwerpformulieren blijven duidelijk als simulatie aangeduid zolang de
  productie-integratie niet is voltooid.
- De bestaande live app wordt pas vervangen na beoordeling en akkoord van Jakko.

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
