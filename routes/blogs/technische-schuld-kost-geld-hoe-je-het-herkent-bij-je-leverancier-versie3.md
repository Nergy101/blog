---
title: Technische schuld kost geld
date: 2026-06-18
author: Christian / Nergy101
tags: [Technische schuld, Software teams, Consultancy]
---

# Technische schuld kost geld: hoe je het herkent bij je software team

Wanneer heb jij voor het laatst een nieuwe functionaliteit opgeleverd gekregen — zonder dat er eerst drie andere dingen moesten worden gerepareerd? Als je even moet nadenken, is dat antwoord al veelzeggend. Technische schuld is stil, sluipend en duur. En het ergste eraan is dat je er zo aan went dat je het niet meer ziet. In dit artikel leer je waar je op moet letten — ook als je zelf geen ontwikkelaar bent.

## Wanneer stilstand de nieuwe standaard wordt

Veel softwareproducten hebben een geschiedenis. Ze zijn ooit gebouwd door een toegewijd team, gegroeid met de organisatie, en uitgebreid naarmate de business dat vroeg. Op papier draaien ze prima. Maar onder de oppervlakte vertelt de code een ander verhaal.

Dit is de wereld waarin Cloud Republic regelmatig binnenstapt.

De organisaties die we tegenkomen hebben doorgaans een langlopend softwareproduct — soms meer dan tien jaar oud — dat wordt beheerd door een intern of extern ontwikkelteam. Dat team heeft het product door de jaren heen laten groeien, kent het door en door, en is er volledig op ingesteld. Op het eerste gezicht lijkt dat een kracht. En dat was het ook, ooit.

Maar de technische wereld staat niet stil. Frameworks evolueren. Deployment-praktijken veranderen. Wat in 2015 een moderne aanpak was, is in 2025 achterhaald. De teams die we aantreffen hebben die ontwikkeling grotendeels gemist — niet uit onwil, maar omdat ze zich comfortabel hebben gevestigd in wat ze kennen. Ze hebben hun technische piek bereikt, en zijn daar gebleven.

Het gevolg is een omgeving die functioneert, maar nauwelijks meer beweegt. Elke change duurt minstens een week. Releases zijn spannende momenten in plaats van routineklussen. Nieuwe functionaliteiten worden steeds vaker uitgesteld ten gunste van fixes op wat al bestaat. En als je ernaar vraagt, is het antwoord dat iedereen inmiddels heeft geaccepteerd: *"Dit is gewoon hoe het werkt. Dit is de realiteit van dit systeem."*

Dat zinnetje is de aanleiding voor alles wat volgt.

Want wat als die realiteit helemaal niet zo vast staat als iedereen denkt? Wat als de vertraging geen eigenschap is van het product, maar een symptoom van iets wat te veranderen valt? Precies die vraag brengt Cloud Republic in beeld — en precies die vraag maakt dit verhaal de moeite waard om te lezen.

---

## Probleem: "Dit is gewoon hoe het werkt"

Een knopje verplaatsen. Een tekst aanpassen. Een validatieregel toevoegen. Een week.

En als je ernaar vraagt, is het antwoord steevast hetzelfde: *"Dit is de realiteit van dit systeem."*

Dat zinnetje is het gevaarlijkste in de hele situatie. Want het normaliseert iets wat niet normaal is. Het maakt van een structureel probleem een geaccepteerd gegeven. En ondertussen loopt de teller gewoon door.

Wat je aantreft als je de motorkap echt optilt:

- **Geen of minimale testdekking.** Niemand weet zeker of een wijziging iets breekt, dus iedereen is voorzichtig. Die voorzichtigheid kost tijd.
- **Geen geautomatiseerde CI/CD.** Releases zijn handmatig, risicovol en afhankelijk van specifieke mensen op specifieke momenten.
- **Amper documentatie.** Kennis zit in hoofden, niet in systemen.
- **Een Brent.** Iedereen die *The Phoenix Project* heeft gelezen kent hem: de ene developer die alles weet, alles kan, en zonder wie niets kan worden opgeleverd. Hij is geen held — hij is een enkelvoudig faalpoint dat het hele systeem gijzelt.

En dan is er nog de werkvoorraad. Als je die analyseert, zie je het patroon meteen: meer fixes dan nieuwe functionaliteiten. Het team repareert constant wat al bestaat, en komt niet meer toe aan het leveren van echte waarde.

---

## Aanpak: meenemen, niet confronteren

Als je aankaart dat er iets structureel mis is, stuit je bijna altijd op weerstand. *"Onze mensen zijn toch goed? Ze zijn betrokken, ze werken hard."*

Dat klopt vaak ook. Maar goed zijn en bijblijven zijn twee verschillende dingen.

De aanpak die werkt is er een van **meenemen, niet confronteren.** Je behandelt de domeinkennis van het bestaande team als het waardevolle bezit dat het is — want dat is het. Zij kennen het product, de klant, de edge cases. Jij brengt technische vernieuwing mee. Die ruil werkt alleen als er wederzijds respect is.

In de praktijk betekent dit:

**Stap 1 — Rand-organisatie op orde.**
Scrum-events, een werkbord, en — cruciaal — werkvoorraad bepaling. Want hier geldt één ijzeren wet: shit in = shit out. Een vage werkvoorraad levert vage oplossingen. Goede werkvoorraad bepaling onthult ook meteen de technische achterstalligheden. Die komen als eerste bovendrijven.

**Stap 2 — Technische hygiëne herstellen.**
CI/CD opzetten, testdekking opbouwen, deployment-afspraken maken. Niet als doel op zich, maar als fundament voor alles wat daarna komt. Dit is ook het moment om het team mee te nemen in wat er tegenwoordig mogelijk is. Niet als kritiek op wat ze deden, maar als opening naar wat ze kunnen worden.

**Stap 3 — Architectuur heroverwegen waar nodig.**
Dit blijft vaak relatief beperkt bij bestaande teams, maar het gesprek moet wel gevoerd worden. Wordt er iets nieuws gebouwd? Dan wil je daar altijd iets over te zeggen hebben — zodat het op moderne manieren gebeurt, niet op de manieren van tien jaar geleden.

---

## Oplossing: van fixes naar waarde

De verschuiving die je wilt zien, gaat van een werkvoorraad vol achterstalligheden naar een werkvoorraad die gedreven wordt door domein — door echte, nieuwe waarde voor de gebruiker.

Die verschuiving kost tijd. Reken op **enkele maanden** voor merkbare technische verbeteringen: betere CI/CD, testdekking, zekerheid over kwaliteit. Reken op **een jaar** voordat het team structureel nieuwe functionaliteiten levert.

Wat je niet moet doen, is je blindstaren op tooling-scores. SonarQube, Sigrid, testdekking in percentages — ze vertellen een deel van het verhaal, maar niet het belangrijkste deel. Het gaat uiteindelijk om vragen als: is dit product toekomstbestendig? Is het modern? Kan het de groei aan?

Dat zijn subjectieve, complexe vragen. Maar het zijn de juiste.

---

## Lessons learned: wat elke opdrachtgever zou moeten weten

Je hoeft geen technische achtergrond te hebben om technische schuld te herkennen. Dit zijn de signalen:

**Je werkvoorraad gaat meer over fixes dan over nieuwe functionaliteiten.**
Als het grootste deel van wat je team doet bestaat uit het repareren van dingen die al bestaan, betaal je rente op schuld.

**Je hebt een "Brent".**
Één persoon zonder wie alles stilstaat is geen troef — het is een risico. En een teken dat kennis niet is geborgd.

**Je team wijst altijd naar dezelfde persoon.**
Niet omdat hij de enige is die iets kan, maar omdat hij drie jaar geleden dat ene systeem heeft gebouwd — en sindsdien is die kennis nooit overgedragen. Iedereen weet wie je moet hebben, maar niemand weet wat hij eigenlijk weet. Dat is geen samenwerking, dat is een tijdbom.

**Je ontwikkelaars praten nooit over nieuwe versies of releases.**
Technologie staat nooit stil, en een team dat bijblijft, volgt actief de releasekalenders van de platformen waarop ze bouwen. Dat geldt voor élke stack: een Microsoft-georiënteerd team verwacht je elk jaar een .NET-upgrade te zien in de werkvoorraad. Een Java-team hoort de overstap naar een nieuwe LTS-versie te plannen. Een frontend-team hoort te weten welke versie van hun framework actueel is. Het specifieke platform maakt niet uit — het patroon wel. Als dat gesprek nooit plaatsvindt, is dat een signaal dat het team niet langer meekijkt naar wat er buiten hun eigen systeem gebeurt.

Het grootste risico is niet dat je team slecht is. Het is dat je het niet doorhebt.

Technische schuld bouwt zich niet op in één sprint. Het sluipt erin, over maanden en jaren. Elk kwartaal dat een framework-upgrade wordt uitgesteld, elke feature die zonder tests wordt opgeleverd, elke Brent die iets bouwt zonder het over te dragen — het zijn kleine stappen. Afzonderlijk nauwelijks merkbaar. Samen vormen ze een rem die zo geleidelijk wordt ingedrukt dat niemand het moment kan aanwijzen waarop het fout ging.

Dat is precies waarom het zo moeilijk te spotten is van binnenuit. Je went aan het tempo. Je accepteert de doorlooptijden. En op het moment dat je je afvraagt waarom alles zo lang duurt, is de rem al jaren ingedrukt — en is er niemand die dat bewust heeft laten gebeuren.

---

## Conclusie: sta je vast, of beweeg je vooruit?

Wat deze trajecten keer op keer leren, is dat technische schuld zelden ontstaat door slechte intenties. Teams stagneren omdat ze comfortabel zijn geworden in wat werkt, en omdat niemand van buitenaf vroeg wat er eigenlijk mogelijk was. De rem wordt zo langzaam ingedrukt dat niemand het voelt — je went aan het tempo, je accepteert de doorlooptijden, en op het moment dat je je afvraagt waarom alles zo traag gaat, is de schuld al jaren opgebouwd. De oplossing bleek niet het vervangen van mensen of systemen, maar het structureren van de werkwijze, het herstellen van technische hygiëne, en het meenemen van het bestaande team in een nieuwe manier van werken.

Technische schuld is geen technisch probleem. Het is een bedrijfsprobleem dat zich opbouwt over jaren, in kleine stappen, zonder dat iemand een bewust besluit neemt om achter te blijven. Herken je dit: je werkvoorraad staat vol fixes, kleine changes duren weken, er is één persoon zonder wie alles stilstaat, en nieuwe functionaliteiten komen er maar niet van? Dan is het tijd om de vraag te stellen: *"Hebben wij begeleiding nodig met het wegwerken van onze technische schuld?"* Hoe langer die vraag onbesproken blijft, hoe dieper de schuld ingroeit. Een team dat stilstaat hoeft niet vervangen te worden. Het heeft begeleiding nodig, een duidelijke werkwijze, en de ruimte om te leren wat er tegenwoordig mogelijk is. Dat is geen luxe. Dat is onderhoud aan je belangrijkste digitale asset.

---

## Aan de slag

Sta je voor dezelfde uitdaging? Bij Cloud Republic horen graag hoe het bij jou speelt. Neem contact op en laten we het gesprek starten.

---

_Laatst bijgewerkt: 2026-06-18_
