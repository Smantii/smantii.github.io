---
title: "Scylla, Charybdis and symbolic regression"
description: The currents of the Strait of Messina, an old myth, and why a short formula found from data can beat a black box.
date: 2026-10-24 18:00:00+0200
tags: [symbolic regression, scientific ML, reduced order models]
math: true
lang: en
ref: scylla-charybdis-sr # shared with the Italian version in _translations/
# Paste the URL of the LinkedIn post this article extends, and the page
# will show a "read the original" banner and a "Discuss on LinkedIn" button.
# linkedin: https://www.linkedin.com/posts/...
---

If you grow up in Reggio Calabria, the sea in front of you is never still. Twice a day the water runs north, and twice a day it runs south. Fishermen, swimmers and ferry captains all know the local words for it: the _rema montante_, the _rema scendente_, and the _stanca_, the calm moment in between.

The word _rema_ is older than most of us think. A [travel book from 1793](https://it.wikisource.org/wiki/Pagina:Viaggi_alle_Due_Sicilie_e_in_alcune_parti_dell%27Appennino,_vol._4,_1793_-_BEIC_IE6206670.djvu/175) says it comes from the Greek word for "flow". So the people of the Strait have used a fluid dynamics word for centuries.

In this article I look at these currents with the eyes of a scientist who works on machine learning for physics. I connect them to an old myth, to my own research, and to a small piece of code you can run at home.

## Why the water moves so fast

The currents in the Strait can reach about **3 m/s**, close to 11 km/h. The reason is simple: two seas meet here, and their tides are out of step ([Scientific Reports, 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10160082/)).

- **Two tides, about 5 hours apart.** When the Tyrrhenian Sea is high, the Ionian Sea is low, and the other way around. The water level on the two sides of the Strait is different, so the water runs from the high side to the low side.
- **A narrow channel.** At its narrowest point, between Punta Pezzo in Calabria and Punta Faro in Sicily, the Strait is only about [3 km wide](https://www.submagazine.it/?p=3452). A lot of water has to pass through a small gap.
- **Montante and scendente.** The _rema scendente_ runs from north to south, from Messina towards Catania. The _rema montante_ runs back from south to north ([MeteoWeb](https://www.meteoweb.eu/2013/03/le-grandi-onde-interne-dello-stretto-di-messina-spiate-dai-satelliti-della-nasa-le-immagini-dallo-spazio-del-singolare-fenomeno-idrodinamico/190755/)). Between them comes the _stanca_, when the current almost stops.
- **Two different waters.** Light Tyrrhenian water flows on top of heavier Ionian water. This difference in density creates hidden waves under the surface, called internal waves. They can be seen from satellites, and they were first recorded by the SEASAT satellite in 1978 ([Alpers and Salusti](https://earthref.org/ERR/46254/)).

This is also why the Strait is hard to simulate on a computer. Researchers need very detailed models to capture the tides, the shape of the seabed and the mixing of the two seas ([Cucco and colleagues, 2016](https://nhess.copernicus.org/articles/16/1553/2016/)).

## Between Scylla and Charybdis

Long before physics, people explained these waters with monsters. In the _Odyssey_, Scylla lives on the rock on the Calabrian side, and Charybdis is a whirlpool on the Sicilian side that swallows ships. Odysseus passes close to Scylla to stay away from Charybdis, and he loses six of his men ([World History Encyclopedia](https://www.worldhistory.org/trans/it/1-15734/scilla-e-cariddi/)).

Today the story lives on as an idiom. To be "between Scylla and Charybdis" means to be stuck between two bad options. If you move away from one danger, you move closer to the other.

As it happens, this is exactly the problem I worked on in my research.

## The modeller's Scylla and Charybdis

A full simulation of a turbulent flow can take days on a supercomputer. When you need answers fast, or you need to run hundreds of cases, you build a **reduced order model**: a much smaller model that keeps only the few main patterns of the flow.

Oceanographers already do something similar for the Strait. An ENEA study simulated the circulation in the Strait and then extracted its main patterns ([ENEA, 2011](https://www2.enea.it/it/Ricerca_sviluppo/documenti/ricerca-di-sistema-elettrico/correnti-marine/2011/171-rds-pdf)). In my field, we use the same tool to build reduced models.

The problem is what you throw away. The small eddies you remove still matter: they take energy out of the big flow. Without them, a small model can drift away from reality or even blow up. So we add a correction term, called a **closure**, that models the effect of the missing small scales. In a way, the closure is a model of the little Charybdis whirlpools that our small model cannot see.

How do you build that correction from data? Until recently there were two main options, and both are dangerous:

- **Scylla: a simple formula** (linear or quadratic). It is easy to read and to check, but it is often too simple for complex, turbulent flows.
- **Charybdis: a neural network.** It is flexible and can be very accurate, but it has thousands of parameters with no clear meaning, and it can fail badly outside the data it was trained on.

In our paper in the _Journal of Computational Physics_ ([Manti, Tsai, Lucantonio and Iliescu, 2025](https://doi.org/10.1016/j.jcp.2025.114298)), we proposed a third way: **symbolic regression**. Instead of fixing the shape of the formula in advance, or hiding it inside a network, symbolic regression searches for the formula itself. It builds candidate formulas from simple pieces (plus, times, sine, exponential, and so on) and lets them evolve, a bit like natural selection.

We tested it on two classic flows: the flow past a cylinder and a chaotic flow in a square box. The formulas we found were short, and the models that used them were, in most of our tests, more accurate and more robust than the other options, with about **ten times fewer parameters** than the neural networks.

## A small experiment you can run

In a toy version of the Strait, symbolic regression found the physical law from noisy data and stayed accurate on strong tides it had never seen. None of the four neural networks I tried did.

### The toy Strait

I treat the Strait as a single channel. The difference in sea level between the Tyrrhenian side and the Ionian side pushes the water, and friction with the seabed slows it down:

$$
\frac{du}{dt} = a \, \Delta\eta \; - \; b \, u \, |u|
$$

Here $u$ is the speed of the current (positive for the _montante_, negative for the _scendente_) and $\Delta\eta$ is the difference in sea level between the two seas. The two tides are 5 hours apart, as in the real Strait.

### The test

I "measured" the current during weak tides (neap tides), added 5% noise, and gave the data to symbolic regression (with [pyoperon](https://github.com/heal-research/pyoperon), the same library we used in the paper) and four neural networks of different sizes, from 337 to 50,049 parameters. Three use the most common activation function (ReLU) and one uses the tanh function. Then I asked all of them to predict the current during strong tides (spring tides), when the water moves much faster than anything in the training data.

<!--
Add the figure here once it is exported, e.g. to assets/img/blog/toy-strait.png:

<figure>
  <img src="/assets/img/blog/toy-strait.png" alt="Toy Strait of Messina: true current, symbolic regression and four neural networks, for weak and strong tides" loading="lazy">
  <figcaption>True current, symbolic regression and four neural networks, for weak (seen) and strong (never seen) tides.</figcaption>
</figure>
-->

| Model                    | Parameters  | Weak tides (seen) | Strong tides (never seen) |
| ------------------------ | ----------: | ----------------: | ------------------------: |
| **Symbolic regression**  | 4 constants | **0.004**         | **0.006**                 |
| Small net, 2×16, ReLU    | 337         | 0.020             | 2.714                     |
| Medium net, 3×64, ReLU   | 8,577       | 0.019             | 0.426                     |
| Medium net, 3×64, tanh   | 8,577       | 0.030             | 0.281                     |
| Large net, 4×128, ReLU   | 50,049      | 0.034             | 0.423                     |

The error is the average difference between the predicted and the true current, in m/s (layers × neurons per layer for the networks). In the strongest tides the water reaches 1.84 m/s, while the training data never went above 1.07.

On weak tides, every model does well. On strong tides, the picture changes:

- **The best network is still about 47 times worse** than symbolic regression (0.281 against 0.006 m/s).
- **A bigger network does not help.** The network with 50,049 parameters is no better than the one with 8,577.
- **The smallest network goes off course.** It predicts a current that drifts further south with every tide, ending up near 6 m/s in the wrong direction.

In an earlier run, I also repeated the test for symbolic regression and the medium ReLU network with 5 different random seeds. Symbolic regression always stayed between 0.006 and 0.007 m/s, while the network ranged from 0.31 to 1.63 m/s.

### The formula

Symbolic regression did not only predict well. It gave back a formula you can read:

$$
\frac{du}{dt} \times 10^4 = 6.52 \, \Delta\eta - 0.30 \, u|u| - 0.011 \, u - 0.001
$$

The true values are 6.54 and 0.31. The two small extra terms come from the noise. A physicist can look at this formula and recognise each piece: the push of the tide and the friction of the seabed. You cannot do that with thousands of network weights.

> A formula you can read is a model you can trust.

This is the same lesson as in the paper: a short formula found from data can generalise better than a black box, because it captures the structure of the physics, not only the numbers it was trained on.

## What this toy does not show

The experiment is a story, not a model of the real Strait. To be honest about it:

- **It is far too simple.** The real Strait has two layers of water, internal waves, wind, a complex seabed and three-dimensional eddies. My toy has one number for the current.
- **I gave the method the right building blocks.** I allowed absolute value and multiplication, which made the friction term easy to find. On real data, choosing the building blocks is part of the work.
- **The networks could do better.** I tried four sizes and two activation functions, and none of them extrapolated well. But a network with physics built into it, or one trained on a wider range of tides, can do much better. The point is not that networks are bad. The point is that a readable formula lets you check whether the model makes physical sense.
- **My paper did not simulate the Strait.** It used two classic test flows. Applying these ideas to real ocean flows is still an open challenge, and one I find exciting.

## Closing

The fishermen of the Strait learned the _rema_ by watching it for generations. They did not need a supercomputer: they needed a few simple rules that worked. Symbolic regression tries to do something similar with data. It looks for the simple rule behind the numbers, so that we can read it, check it and trust it.

Between the Scylla of formulas that are too simple and the Charybdis of black boxes, there is a passage. It is narrow, like the Strait itself, but it is worth sailing.

---

### Links

- **The paper:** [Symbolic regression of data-driven reduced order model closures for under-resolved, convection-dominated flows](https://doi.org/10.1016/j.jcp.2025.114298), _Journal of Computational Physics_, 2025 (open access)
<!-- - **The code for the experiment:** [GitHub repository](https://github.com/Smantii/...) -->

### Sources

- [La Forgia and colleagues, internal solitary waves in the Messina Strait, _Scientific Reports_, 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10160082/)
- [Cucco and colleagues, tidal dynamics in the Messina Strait, _Natural Hazards and Earth System Sciences_, 2016](https://nhess.copernicus.org/articles/16/1553/2016/)
- [Alpers and Salusti, first satellite evidence of internal waves in the Strait](https://earthref.org/ERR/46254/)
- [MeteoWeb, the internal waves of the Strait seen from satellites](https://www.meteoweb.eu/2013/03/le-grandi-onde-interne-dello-stretto-di-messina-spiate-dai-satelliti-della-nasa-le-immagini-dallo-spazio-del-singolare-fenomeno-idrodinamico/190755/)
- [ENEA, circulation model of the Strait of Messina, 2011](https://www2.enea.it/it/Ricerca_sviluppo/documenti/ricerca-di-sistema-elettrico/correnti-marine/2011/171-rds-pdf)
- [_Viaggi alle Due Sicilie_, 1793, on the word _rema_](https://it.wikisource.org/wiki/Pagina:Viaggi_alle_Due_Sicilie_e_in_alcune_parti_dell%27Appennino,_vol._4,_1793_-_BEIC_IE6206670.djvu/175)
- [World History Encyclopedia, Scylla and Charybdis](https://www.worldhistory.org/trans/it/1-15734/scilla-e-cariddi/)
- [Sub Magazine, width of the Strait](https://www.submagazine.it/?p=3452)
