# Backend contracts

Copied verbatim from the Validater backend (`validater-work/contracts/`, exported by `scripts/export_phase2_contracts.py`). The mock client serves these files, so mock mode returns the same shapes the live backend does. Re-copy them when the backend re-exports; do not edit by hand.

Stages: `baseline` (first scan), `add-caching` (Caching 0 -> 70, Honesty 80 -> 100), `remove-caching` (Caching 70 -> 0, Honesty back to 80).
