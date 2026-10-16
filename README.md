# Weapon Shop Empire

## Current Version: v0.15.00

This update fixes the Home Page load error and completes the full `1870 × 2870` **Forest Outpost** artwork alignment (`assets/forest_outpost_map.jpg` and `assets/first_shop_art.jpg`).

## What Is Fixed & Improved in v0.15.00

- **Fixed Home Page `GAME LOAD ERROR`:**
  - Removed the fragile global error listener in `index.html` that overwrote `#saveSlots` on minor asset events.
  - Added automatic `.jpg` / `.png` fallback for `forest_outpost_map.jpg` and `first_shop_art.jpg`.
- **Aligned All Spawners, Waypoints & Rooms to the `1870 × 2870` Forest Outpost Artwork:**
  - **Customer Flow:** Customers now spawn on the South Stone Bridge (`745, 2480`), walk north through the **Main Entrance** (`745, 2040`), browse the **Attack / Defense / Other** shelves, queue at **Checkout** (`745, 1815`), leave coins on the counter (`825, 1880`), and exit south.
  - **Corridor-Aware Employee Pathfinding (`navigate()`):** Workers cleanly route along the upper corridor (`y: 702`) and central vertical avenues (`x: 648` and `x: 1265`) between **Staff House**, **Material Yard**, **Training Room**, **Forge**, **Alchemy**, **Contract Warehouse**, and the **Retail Floor**.
  - **Forest Adventure Monsters:** Slimes and Forest Wolves now spawn in the northern forest above the **FOREST ADVENTURE** gate (`x: 440..1400, y: 125..260`).
  - **Live Visual Overlays on Map Artwork:** Output badges (`⚔️ OUT`, `🛡️ OUT`, `🧪 OUT`), shelf stock counters (`ATTACK 3/12`, etc.), Rare Storage showcase icons, Contract Warehouse progress, and Material Yard regrowth bars render cleanly over the artwork.
  - **New Interactive Rooms Matching Artwork:** Added one-tap interactions for the **Special Visitor Plaza** (`315, 2350`), **Training Room** (`1395, 525`), and **Management Office** (`1460, 1640`).

## Upload Instructions

Ensure these exact filenames are in your repository root:

```text
index.html
style.css
game.js
README.md
assets/
  art_preview.html
  first_shop_art.jpg
  forest_outpost_map.jpg