# Weapon Shop Empire

## Current Version: v0.11.00

This package provides the next complete playable build plus a separate original art-preview gallery. The gallery demonstrates the approved colorful, slightly pixelated mobile-game direction without copying the supplied reference game.

## What Is New

- Added an **ART** button to the bottom management menu.
- Added `assets/art_preview.html` with previews for:
  - Attack products
  - Defense products
  - Other products
  - Raw materials
  - Player and worker roles
  - Customer classes
  - Monsters
  - Workstations, output tables, shelves and contract crates
  - Customer request bubbles
- Added clearer customer request bubbles in the game.
- Customer bubbles can show product, ATK/DEF requirement and minimum rarity.
- Added visible stock-capacity labels to Attack, Defense and Other shelves.
- Added visible output-capacity labels to Forge and Alchemy outputs.
- Retained the complete physical loop from v0.10.00.

## Physical Gameplay Loop

```text
Craft
→ Product waits at output
→ Player carries product
→ Product fills visible shelf
→ Customer request bubble shows need
→ Customer takes matching product
→ Coins remain at checkout
→ Player or employee collects coins
```

## Larger-World Direction

The current map remains a scrolling world rather than a single-screen layout. Future artwork can be separated into `assets/tiles`, `assets/characters`, `assets/items`, `assets/buildings`, and `assets/effects` without changing the game logic.

## How to Preview the Artwork

After uploading the package, either:

1. Open the game and tap **ART**, or
2. Open `/assets/art_preview.html` from the published site.

## Upload

Extract and replace these items in the repository root:

```text
index.html
style.css
game.js
README.md
assets/
```

The bottom-left marker must show `Weapon Shop Empire v0.11.00`.

## Three Reviews Completed

### Review 1: Player View
- Customer needs are visible above customers.
- Shelf fullness is visible without opening a page.
- Workshop output fullness is visible.
- Art preview is accessible from the game.

### Review 2: Design Logic
- Art categories match actual gameplay categories.
- Requests use the same Attack, Defense, Other, rarity and quality systems.
- Art preview remains separate from gameplay collision and logic.

### Review 3: Technical Regression
- Drag movement, zoom, collision, output, carrying, stocking, sales and coins retained.
- Zero-employee start retained.
- Save slots, wholesale, goals, crafting and combat retained.
- JavaScript syntax and ZIP integrity checked.

## Version History

### v0.11.00 - 2026-10-16
- Added original item-art preview gallery.
- Added ART management button.
- Added richer visible customer request bubbles.
- Added shelf and output capacity labels.

### v0.10.00 - 2026-10-16
- Added physical products, carrying, shelf stocking, checkout coins and zero-employee start.

### v0.9.00 and earlier
- Added meaningful rooms, drag movement, collision, pixel presentation, zoom, daily systems, wholesale and saves.

## Version Policy
Continue with v0.x by default. Ask before changing to v1.0.00, v2.0.00 or another major version.
