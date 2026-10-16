# Weapon Shop Empire

## Current Version: v0.12.02

Corrected release based on the uploaded v0.12.02 candidate.


## v0.12.02 Patch Note

- Renumbered the reviewed corrected package from v0.12.00 to v0.12.02.
- No major artwork replacement is included in this patch.
- The visual presentation remains the existing code-rendered pixel prototype plus the separate art-preview page.
- This patch focuses on customer requirement matching, tip calculation, wholesale deadline processing, contract capacity, storage-capacity separation, and package completeness.

## Corrections made after review

- Customers now purchase only products that meet both minimum ATK/DEF and minimum rarity.
- Customers wait and may leave if no suitable product exists, instead of taking the wrong item.
- Fixed the base-tip calculation when `RareBonus` is undefined.
- Split wholesale deadline processing from wholesale-offer generation.
- Loading or starting a day no longer decreases active-contract deadlines.
- Contract Warehouse capacity is enforced for player and employee deliveries.
- Added separate `outputCap`, `rareStorageCap`, and `contractCap` state values.
- Included the missing `assets/art_preview.html` file.
- Delivered as a real GitHub-ready ZIP instead of an incomplete downloader HTML.

## Important upload structure

Extract the ZIP and upload these directly to the repository root:

```text
index.html
style.css
game.js
README.md
assets/
  art_preview.html
```

## Core features retained

- Three save slots and end-of-day auto-save
- Drag movement, pinch zoom, collisions, and waypoint routing
- Material Yard and gathering nodes
- Sword, Shield, Potion, and Slime Edge crafting
- Physical output tables, carrying, shelves, customer shopping, checkout coins
- Customer requirements and quality inspection
- Zero-employee start, hiring, assignments, wages, and expeditions
- Wholesale contracts and Contract Warehouse
- Daily goals/events, combat, reputation, and Forever skills

## Version policy

Continue with v0.x by default. Ask before moving to v1.0.00 or a later major version.
