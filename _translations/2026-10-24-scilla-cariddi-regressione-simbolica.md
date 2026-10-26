---
title: "Scilla, Cariddi e la regressione simbolica"
description: Le correnti dello Stretto di Messina, un mito antico, e perché una formula breve trovata dai dati può battere una scatola nera.
date: 2026-10-24 18:00:00+0200
tags: [regressione simbolica, scientific ML, modelli di ordine ridotto]
math: true
lang: it
ref: scylla-charybdis-sr # shared with the English version in _posts/
permalink: /blog/2026/scylla-charybdis-symbolic-regression/it/
---

Se cresci a Reggio Calabria, il mare davanti a te non è mai fermo. Due volte al giorno l'acqua corre verso nord, e due volte al giorno corre verso sud. Pescatori, nuotatori e comandanti dei traghetti conoscono bene le parole locali: la _rema montante_, la _rema scendente_ e la _stanca_, il momento di calma tra le due.

La parola _rema_ è più antica di quanto molti pensino. Un [libro di viaggio del 1793](https://it.wikisource.org/wiki/Pagina:Viaggi_alle_Due_Sicilie_e_in_alcune_parti_dell%27Appennino,_vol._4,_1793_-_BEIC_IE6206670.djvu/175) dice che deriva dalla parola greca per "flusso". Insomma, da secoli la gente dello Stretto usa un termine di fluidodinamica.

In questo articolo guardo queste correnti con gli occhi di uno scienziato che si occupa di machine learning per la fisica. Le collego a un mito antico, alla mia ricerca e a un piccolo esperimento che potete eseguire a casa.

## Perché l'acqua corre così veloce

Le correnti nello Stretto possono raggiungere circa **3 m/s**, quasi 11 km/h. Il motivo è semplice: qui si incontrano due mari, e le loro maree sono sfasate ([Scientific Reports, 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10160082/)).

- **Due maree, a circa 5 ore di distanza.** Quando il Tirreno è alto, lo Ionio è basso, e viceversa. Il livello dell'acqua ai due lati dello Stretto è diverso, quindi l'acqua scorre dal lato più alto verso quello più basso.
- **Un canale stretto.** Nel punto più stretto, tra Punta Pezzo in Calabria e Punta Faro in Sicilia, lo Stretto è largo solo [circa 3 km](https://www.submagazine.it/?p=3452). Tanta acqua deve passare da un varco piccolo.
- **Montante e scendente.** La _rema scendente_ va da nord a sud, da Messina verso Catania. La _rema montante_ torna da sud a nord ([MeteoWeb](https://www.meteoweb.eu/2013/03/le-grandi-onde-interne-dello-stretto-di-messina-spiate-dai-satelliti-della-nasa-le-immagini-dallo-spazio-del-singolare-fenomeno-idrodinamico/190755/)). Tra le due arriva la _stanca_, quando la corrente quasi si ferma.
- **Due acque diverse.** L'acqua tirrenica, più leggera, scorre sopra quella ionica, più pesante. Questa differenza di densità genera onde nascoste sotto la superficie, chiamate onde interne. Si vedono dai satelliti, e furono registrate per la prima volta dal satellite SEASAT nel 1978 ([Alpers e Salusti](https://earthref.org/ERR/46254/)).

È anche per questo che lo Stretto è difficile da simulare al computer. Servono modelli molto dettagliati per catturare le maree, la forma del fondale e il mescolamento dei due mari ([Cucco e colleghi, 2016](https://nhess.copernicus.org/articles/16/1553/2016/)).

## Tra Scilla e Cariddi

Molto prima della fisica, queste acque si spiegavano con i mostri. Nell'_Odissea_, Scilla vive sullo scoglio dal lato calabrese, e Cariddi è un vortice dal lato siciliano che inghiotte le navi. Ulisse passa vicino a Scilla per stare lontano da Cariddi, e perde sei dei suoi uomini ([World History Encyclopedia](https://www.worldhistory.org/trans/it/1-15734/scilla-e-cariddi/)).

Oggi la storia sopravvive come modo di dire. Essere "tra Scilla e Cariddi" significa trovarsi tra due opzioni cattive: se ti allontani da un pericolo, ti avvicini all'altro.

Guarda caso, è proprio il problema su cui ho lavorato nella mia ricerca.

## La Scilla e Cariddi di chi fa modelli

Una simulazione completa di un flusso turbolento può richiedere giorni su un supercomputer. Quando servono risposte veloci, o bisogna lanciare centinaia di casi, si costruisce un **modello di ordine ridotto**: un modello molto più piccolo che conserva solo le poche strutture principali del flusso.

Gli oceanografi fanno già qualcosa di simile per lo Stretto. Uno studio dell'ENEA ha simulato la circolazione nello Stretto e poi ne ha estratto le strutture principali ([ENEA, 2011](https://www2.enea.it/it/Ricerca_sviluppo/documenti/ricerca-di-sistema-elettrico/correnti-marine/2011/171-rds-pdf)). Nel mio campo usiamo lo stesso strumento per costruire modelli ridotti.

Il problema è ciò che si butta via. I piccoli vortici che si eliminano contano ancora: sottraggono energia al flusso grande. Senza di loro, un modello piccolo può allontanarsi dalla realtà o addirittura esplodere. Per questo si aggiunge un termine correttivo, chiamato **chiusura** (_closure_), che modella l'effetto delle piccole scale mancanti. In un certo senso, la chiusura è un modello delle piccole Cariddi che il nostro modello ridotto non riesce a vedere.

Come si costruisce questa correzione dai dati? Fino a poco tempo fa c'erano due strade principali, ed entrambe pericolose:

- **Scilla: una formula semplice** (lineare o quadratica). È facile da leggere e da verificare, ma spesso è troppo semplice per flussi complessi e turbolenti.
- **Cariddi: una rete neurale.** È flessibile e può essere molto accurata, ma ha migliaia di parametri senza un significato chiaro, e può sbagliare di grosso fuori dai dati su cui è stata addestrata.

Nel nostro articolo sul _Journal of Computational Physics_ ([Manti, Tsai, Lucantonio e Iliescu, 2025](https://doi.org/10.1016/j.jcp.2025.114298)) abbiamo proposto una terza via: la **regressione simbolica**. Invece di fissare in anticipo la forma della formula, o di nasconderla dentro una rete, la regressione simbolica cerca la formula stessa. Costruisce formule candidate a partire da pezzi semplici (più, per, seno, esponenziale e così via) e le lascia evolvere, un po' come nella selezione naturale.

L'abbiamo testata su due flussi classici: il flusso attorno a un cilindro e un flusso caotico in una cavità quadrata. Le formule trovate erano brevi, e i modelli che le usavano erano, nella maggior parte dei nostri test, più accurati e più robusti delle alternative, con circa **dieci volte meno parametri** delle reti neurali.

## Un piccolo esperimento da provare

In una versione giocattolo dello Stretto, la regressione simbolica ha trovato la legge fisica da dati rumorosi ed è rimasta accurata su maree forti che non aveva mai visto. Nessuna delle quattro reti neurali che ho provato ci è riuscita.

### Lo Stretto giocattolo

Tratto lo Stretto come un unico canale. La differenza di livello del mare tra il lato tirrenico e quello ionico spinge l'acqua, e l'attrito con il fondale la rallenta:

$$
\frac{du}{dt} = a \, \Delta\eta \; - \; b \, u \, |u|
$$

Qui $u$ è la velocità della corrente (positiva per la _montante_, negativa per la _scendente_) e $\Delta\eta$ è la differenza di livello del mare tra i due mari. Le due maree sono sfasate di 5 ore, come nello Stretto vero.

### Il test

Ho "misurato" la corrente durante le maree deboli (maree di quadratura), ho aggiunto il 5% di rumore e ho dato i dati alla regressione simbolica (con [pyoperon](https://github.com/heal-research/pyoperon), la stessa libreria usata nell'articolo) e a quattro reti neurali di dimensioni diverse, da 337 a 50.049 parametri. Tre usano la funzione di attivazione più comune (ReLU) e una usa la tangente iperbolica (tanh). Poi ho chiesto a tutti di prevedere la corrente durante le maree forti (maree sizigiali), quando l'acqua si muove molto più velocemente di qualsiasi cosa vista nei dati di addestramento.

<!--
Aggiungere qui la figura quando è pronta, es. in assets/img/blog/toy-strait.png:

<figure>
  <img src="/assets/img/blog/toy-strait.png" alt="Stretto di Messina giocattolo: corrente vera, regressione simbolica e quattro reti neurali, per maree deboli e forti" loading="lazy">
  <figcaption>Corrente vera, regressione simbolica e quattro reti neurali, per maree deboli (viste) e forti (mai viste).</figcaption>
</figure>
-->

| Modello                   | Parametri   | Maree deboli (viste) | Maree forti (mai viste) |
| ------------------------- | ----------: | -------------------: | ----------------------: |
| **Regressione simbolica** | 4 costanti  | **0,004**            | **0,006**               |
| Rete piccola, 2×16, ReLU  | 337         | 0,020                | 2,714                   |
| Rete media, 3×64, ReLU    | 8.577       | 0,019                | 0,426                   |
| Rete media, 3×64, tanh    | 8.577       | 0,030                | 0,281                   |
| Rete grande, 4×128, ReLU  | 50.049      | 0,034                | 0,423                   |

L'errore è la differenza media tra la corrente prevista e quella vera, in m/s (per le reti: strati × neuroni per strato). Nelle maree più forti l'acqua raggiunge 1,84 m/s, mentre nei dati di addestramento non ha mai superato 1,07.

Con le maree deboli, tutti i modelli vanno bene. Con quelle forti, il quadro cambia:

- **La rete migliore è comunque circa 47 volte peggiore** della regressione simbolica (0,281 contro 0,006 m/s).
- **Una rete più grande non aiuta.** La rete con 50.049 parametri non è migliore di quella con 8.577.
- **La rete più piccola va fuori rotta.** Prevede una corrente che deriva sempre più verso sud a ogni marea, fino a circa 6 m/s nella direzione sbagliata.

In una prova precedente ho anche ripetuto il test per la regressione simbolica e per la rete media ReLU con 5 semi casuali diversi. La regressione simbolica è sempre rimasta tra 0,006 e 0,007 m/s, mentre la rete variava da 0,31 a 1,63 m/s.

### La formula

La regressione simbolica non ha solo previsto bene. Ha restituito una formula che si può leggere:

$$
\frac{du}{dt} \times 10^4 = 6{,}52 \, \Delta\eta - 0{,}30 \, u|u| - 0{,}011 \, u - 0{,}001
$$

I valori veri sono 6,54 e 0,31. I due piccoli termini in più vengono dal rumore. Un fisico può guardare questa formula e riconoscerne ogni pezzo: la spinta della marea e l'attrito del fondale. Con migliaia di pesi di una rete non si può fare.

> Una formula che puoi leggere è un modello di cui ti puoi fidare.

È la stessa lezione dell'articolo: una formula breve trovata dai dati può generalizzare meglio di una scatola nera, perché cattura la struttura della fisica, non solo i numeri su cui è stata addestrata.

## Cosa questo esperimento non dimostra

L'esperimento è un racconto, non un modello dello Stretto vero. Per essere onesti:

- **È fin troppo semplice.** Lo Stretto vero ha due strati d'acqua, onde interne, vento, un fondale complesso e vortici tridimensionali. Il mio giocattolo ha un solo numero per la corrente.
- **Ho dato al metodo i mattoncini giusti.** Ho permesso valore assoluto e moltiplicazione, il che ha reso facile trovare il termine di attrito. Con dati reali, scegliere i mattoncini fa parte del lavoro.
- **Le reti potrebbero fare meglio.** Ho provato quattro dimensioni e due funzioni di attivazione, e nessuna ha estrapolato bene. Ma una rete con la fisica integrata, o addestrata su una gamma più ampia di maree, può fare molto meglio. Il punto non è che le reti siano cattive. Il punto è che una formula leggibile permette di verificare se il modello ha senso fisico.
- **Il mio articolo non ha simulato lo Stretto.** Ha usato due flussi di test classici. Applicare queste idee ai flussi oceanici reali è ancora una sfida aperta, e una che trovo entusiasmante.

## Per chiudere

I pescatori dello Stretto hanno imparato la _rema_ osservandola per generazioni. Non avevano bisogno di un supercomputer: avevano bisogno di poche regole semplici che funzionassero. La regressione simbolica prova a fare qualcosa di simile con i dati. Cerca la regola semplice dietro i numeri, così che possiamo leggerla, verificarla e fidarci.

Tra la Scilla delle formule troppo semplici e la Cariddi delle scatole nere c'è un passaggio. È stretto, come lo Stretto stesso, ma vale la pena attraversarlo.

---

### Link

- **L'articolo:** [Symbolic regression of data-driven reduced order model closures for under-resolved, convection-dominated flows](https://doi.org/10.1016/j.jcp.2025.114298), _Journal of Computational Physics_, 2025 (open access)
<!-- - **Il codice dell'esperimento:** [repository GitHub](https://github.com/Smantii/...) -->

### Fonti

- [La Forgia e colleghi, onde interne solitarie nello Stretto di Messina, _Scientific Reports_, 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10160082/)
- [Cucco e colleghi, dinamica di marea nello Stretto di Messina, _Natural Hazards and Earth System Sciences_, 2016](https://nhess.copernicus.org/articles/16/1553/2016/)
- [Alpers e Salusti, prima evidenza satellitare delle onde interne nello Stretto](https://earthref.org/ERR/46254/)
- [MeteoWeb, le onde interne dello Stretto viste dai satelliti](https://www.meteoweb.eu/2013/03/le-grandi-onde-interne-dello-stretto-di-messina-spiate-dai-satelliti-della-nasa-le-immagini-dallo-spazio-del-singolare-fenomeno-idrodinamico/190755/)
- [ENEA, modello di circolazione dello Stretto di Messina, 2011](https://www2.enea.it/it/Ricerca_sviluppo/documenti/ricerca-di-sistema-elettrico/correnti-marine/2011/171-rds-pdf)
- [_Viaggi alle Due Sicilie_, 1793, sulla parola _rema_](https://it.wikisource.org/wiki/Pagina:Viaggi_alle_Due_Sicilie_e_in_alcune_parti_dell%27Appennino,_vol._4,_1793_-_BEIC_IE6206670.djvu/175)
- [World History Encyclopedia, Scilla e Cariddi](https://www.worldhistory.org/trans/it/1-15734/scilla-e-cariddi/)
- [Sub Magazine, larghezza dello Stretto](https://www.submagazine.it/?p=3452)
