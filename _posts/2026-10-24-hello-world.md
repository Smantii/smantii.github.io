---
title: "Hello, world: why I still care about equations"
description: A new home for the long versions of my LinkedIn posts, and a two-minute primer on symbolic regression.
date: 2026-10-24 09:00:00+0200
tags: [symbolic regression, scientific ML]
math: true
# Paste the URL of the LinkedIn post this article extends, and the page
# will show a "read the original" banner and a "Discuss on LinkedIn" button.
# linkedin: https://www.linkedin.com/posts/...
---

LinkedIn is great for sharing an idea in a few lines, but some ideas need more room: an equation, a figure, a snippet of code. This blog is where those posts get their **long version**.

## Why equations?

Most machine learning models are excellent interpolators and poor explainers. In physics and engineering we usually want more than a good fit. We want a model we can _read_, check against known limits, and extrapolate with some confidence.

Symbolic regression goes after that directly. Instead of fitting the parameters $\theta$ of a fixed architecture, it searches over the space of mathematical expressions $\mathcal{F}$ itself:

$$
f^\star = \arg\min_{f \in \mathcal{F}} \; \frac{1}{N}\sum_{i=1}^{N} \big(f(x_i) - y_i\big)^2 + \lambda\, \mathrm{complexity}(f).
$$

The complexity term matters. It's what nudges the search toward something like $\rho\,V(\rho)$ rather than a 40-node expression tree that happens to fit the noise.

> A model you can read is a model you can argue with.

## What it looks like in practice

Genetic programming is one classic way to explore $\mathcal{F}$: keep a population of expression trees, and let mutation, crossover and selection do the rest. In pseudo-Python:

```python
population = random_expressions(n=500)
for generation in range(200):
    scores = [fitness(expr, data) for expr in population]
    parents = tournament_select(population, scores)
    population = mutate(crossover(parents))
best = min(population, key=lambda e: fitness(e, data))
```

The hard (and fun) part is everything this sketch hides: making `fitness` fast enough to evaluate thousands of candidate models that are themselves PDEs. That's where tools like [Flex](https://github.com/cpml-au/Flex) and [dctkit](https://github.com/cpml-au/dctkit) come in. More on that in a future post.

Thanks for reading. If something here sparks a thought, find me on [LinkedIn](https://www.linkedin.com/in/simone-manti-653054210).
