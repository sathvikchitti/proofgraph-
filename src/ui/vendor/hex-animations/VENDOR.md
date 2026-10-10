# hex-ui animations (vendored)

- Source: `hex-ui` 0.8.1, `dist/` (prebuilt React animations with ogl, motion, gsap and Hugeicons bundled; only React is external).
- Copied on 2026-10-10 from `~/Desktop/projects/libraries/edufront/hex/hex-ui-repo/dist`. The copy is byte-identical; it is never edited here. To update, re-copy `dist/` from hex-ui.
- `THIRD_PARTY_LICENSES.md` is hex-ui's licence file for everything bundled in `dist/`. Keep it next to `dist/`.
  Note: the React Bits components inside carry **MIT + Commons Clause** (no reselling the component itself); GSAP is under the GSAP Standard "no charge" licence.
- `dist/*.d.ts` are **not** hex-ui files: they are type declarations written for this library so `blocks/motion/*` can import the untyped JS. They describe the props documented in hex-ui's README.
- Animation styles: `dist/animations.css` (imported by the wrappers in `blocks/motion`).
- The animations read colour tokens from `<html>`: `--hx-waves-*`, `--hx-dots-*`, `--hx-thought-*`, `--hx-check-*`, `--hx-glass-*`. They are defined for every skin in `tokens/semantic.css` and `tokens/themes/dark.css`, and tuned in `tokens/skins/hex/semantic.css`.
