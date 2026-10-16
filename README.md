# Weapon Shop Empire

## Current Version: v0.15.01

This release merges the uploaded v0.15.00 Forest Outpost alignment build with the tested v0.14.01 collision and A* worker-routing patch.

## Merge contents

### Retained from uploaded v0.15.00
- South Stone Bridge customer entrance and updated Forest Outpost coordinates.
- Forest monster spawning in the northern adventure area.
- Live product-output badges, shelf counters, Rare Storage, contract progress, and Material Yard regrowth indicators.
- Special Visitor Plaza, Training Room, and Management Office interactions.
- Artwork JPG/PNG fallback loading.
- Updated portrait-phone interface.

### Merged from v0.14.01
- Collision-aware A* pathfinding using the same `SOLIDS` geometry as the player.
- Diagonal corner protection.
- Automatic stale-route recalculation.
- Tested worker routes for Sales, Craft, Expedition, recovery, and wholesale jobs.
- Tested customer routes for Attack, Defense, and Other shopping loops.
- Complete artwork assets and art preview.

## Fixes in v0.15.01
- Fixed invalid JavaScript created by the text `\vert{}\vert{}` inside the save-slot renderer.
- Restored valid `employees?.length || 0` JavaScript.
- Merged save migration support for v0.15.00 and v0.14.01 localStorage slots.
- Updated version and browser cache references.

## Upload

Extract and replace the complete repository root with:

```text
index.html
style.css
game.js
README.md
assets/
  art_preview.html
  first_shop_art.png
  forest_outpost_map.jpg
```

The visible version must show `v0.15.01`.

## Version policy
Continue with v0.x by default. Ask before moving to v1.0.00 or another major version.
