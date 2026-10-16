# Weapon Shop Empire

## Current Version: v0.16.01

Lightweight correction update for the uploaded v0.16.00 modular renderer. Keep the existing `assets/` folder in the GitHub repository and replace only the five files in this ZIP.

## Fixes in v0.16.01

- Removed Concept Art Background from playable map rendering. The game now always uses the live modular renderer.
- Removed invalid `first_shop_art.jpg` title-screen fallback; the PNG may remain as title artwork only.
- Added save migration from v0.16.00 and earlier supported builds.
- Added Forever Skills and Legacy Point migration from v0.16.00, v0.15.01, and v0.15.00.
- Enforced shared 8-item output capacity for Sword/Axe, Shield/Helmet, and Potion/Repair tables.
- Repair Kits are consumed when they immediately upgrade a Poor item. If no Poor item exists, the crafted kit becomes normal output.
- Wholesale crate visuals now separate up to three active contracts and show each contract's correct product icon and delivered crate progress.
- Product cards show product stock and shared department shelf total.
- Renamed the preview description to Dynamic Systems and Asset Requirements Preview.
- Updated visible version and cache references to v0.16.01.

## Upload

This is a lightweight update ZIP. Upload and replace the five included files in the repository root. Do not delete the existing `assets/` folder.

## Validation

JavaScript syntax, version consistency, forbidden concept-map references, ZIP integrity, and expected file list were checked before release.

## Version History

### v0.16.01 - 2026-10-16
- Corrected modular rendering, migrations, shared output capacity, Repair Kit consumption, and multi-contract crate visuals.

### v0.16.00 - 2026-10-16
- Implemented 6-layer modular world rendering (eliminating baked-in static characters and stock).
- Added 2D Grid A* pathfinding with anti-corner-cutting for all employees and customers.
- Added Battle Axe, Guard Helmet, Repair Kit, physical monster loot drops, and player equipment stats.
- Updated `assets/art_preview.html` with the 22-component dynamic station and sprite gallery.

### v0.15.01 / v0.15.00 - 2026-10-16
- Aligned `1870 × 2870` Forest Outpost coordinates, Special Visitor Plaza, Training Room, and Management Office.

### v0.14.00 - 2026-10-16
- First collision-aligned conversion of `1870 × 2870` Forest Outpost map.

### v0.12.00 & v0.11.00
- Added Material Yard, Shield crafting, Wholesale Contract Warehouse delivery, item quality inspection, and mobile context bar.