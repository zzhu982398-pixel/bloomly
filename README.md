![Bloomly — Turn a feeling into something alive](./public/og.png)

# Bloomly

**A tiny mood ritual that turns a feeling into a one-of-a-kind generative flower.**

Bloomly is an open-source, local-first creative wellbeing experiment. Choose the
feeling closest to you, shape its energy and softness, and watch a deterministic
garden grow in your browser. Save the blooms that matter or export them as
shareable PNG cards.

No account. No streaks. No tracking.

## What makes it special

- **Generative gardens** — every seed produces a repeatable, unique composition
- **Expressive controls** — five moods plus adjustable energy and softness
- **Private meadow** — saved blooms stay in browser storage on your device
- **Shareable art** — export the live canvas as a polished PNG card
- **Accessible by default** — keyboard controls, semantic labels, and reduced-motion support
- **Responsive** — designed for phones, tablets, and large screens

## Quick start

Bloomly requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and grow something.

## Quality checks

```bash
npm run lint
npm test
```

The test suite creates a production build, checks the rendered product copy and
social metadata, and validates the Open Graph image dimensions.

## How it works

The flower renderer is a small deterministic canvas engine. A numeric seed feeds
a repeatable pseudo-random generator; mood palettes, energy, and softness then
shape the number of flowers, petal geometry, height, sway, color, and atmosphere.

Bloomly does not send mood selections anywhere. The optional meadow is stored
with `localStorage`, capped at eight blooms, and can be cleared with normal
browser data controls.

## Built with

- React 19 and TypeScript
- Next.js-compatible App Router through [vinext](https://github.com/cloudflare/vinext)
- Canvas 2D for deterministic generative art
- CSS with no component framework
- Cloudflare Worker-compatible output

## Contributing

Thoughtful issues and pull requests are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md)
for the project principles and development workflow.

## License

[MIT](./LICENSE) © 2026 [zzhu982398521-lang](https://github.com/zzhu982398521-lang)
