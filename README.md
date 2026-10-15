# Weapon Shop Empire

## Current Version: v0.3.00

Complete browser game package with three save slots, day-end saving, crafting, retail customers, employees, expeditions, direct combat, permanent skills, and multi-day wholesale contracts.

## Critical Deployment Instructions

The ZIP itself must **not** be uploaded as the playable website. Extract the ZIP first, then place these four files directly in the repository root:

```text
index.html
game.js
style.css
README.md
```

Delete or overwrite the old warehouse versions of `index.html`, `game.js`, and `style.css`. There should be only one root `index.html`.

After committing, verify that the top of the live page reads:

```text
WEAPON SHOP EMPIRE
v0.3.00
```

A small `Weapon Shop Empire v0.3.00` marker also appears at the bottom-left. If the old warehouse still appears, hard-refresh the browser or open the site in a private window. The HTML uses `?v=0.3.00` cache-busting parameters for CSS and JavaScript.

## Wholesale Contracts

- Wholesale offers appear at the end of each game day.
- Only one contract can be active initially.
- Contracts may last across multiple days.
- Contract products are stored separately from retail storage.
- A Craft employee manufactures items.
- A Sales employee acts as the contract handler, inspecting and moving qualifying items into the Contract Warehouse.
- The player can manually carry qualifying products to a product display, where the item is routed to the active contract first.
- Products below the required rarity do not count.
- Completed contracts pay cash, reputation, and one Legacy Point.
- Failed contracts reduce reputation.
- Contract Office upgrades add one active-order slot and 20 warehouse units.

## Save System

- Three independent save slots.
- Auto-save only when a game day ends.
- Wholesale progress and deadlines are included in day-end saves.
- Save & Exit performs a manual save.
- Exit Without Saving discards the unfinished day.
- New Game retains Forever skills and Legacy Points.

## Controls

- WASD / arrows: move
- Shift: run
- Space: attack outdoors
- Mobile: on-screen movement, RUN, and ATTACK

## Version History

### v0.3.00 - 2026-10-15

- Added end-of-day wholesale contract offers.
- Added multi-day contract deadlines.
- Added one initial active-contract slot.
- Added Contract Office upgrades for more contract slots and storage.
- Added separate Contract Warehouse capacity.
- Added quality requirements, rewards, Legacy rewards, and failure penalties.
- Added employee handling: Craft creates contract stock; Sales inspects and transfers it.
- Added manual player delivery into contract storage.
- Added save support for contract progress.
- Added cache-busting URLs to prevent old warehouse JavaScript/CSS from appearing.
- Added a permanent on-screen version marker.
- Fixed forest background flickering caused by randomized visuals every frame.
- Deep-reviewed root entry-point and deployment structure.

### v0.2.00 - 2026-10-15

- Added three save slots.
- Added day-end-only auto-save.
- Added slot summaries, manual Save & Exit, Exit Without Saving, and slot deletion.

### v0.1.00 - 2026-10-15

- First complete Weapon Shop Empire release.
- Added the fantasy shop, crafting, product zones, customers, reputation, employees, expeditions, combat, and Forever skills.

## Version Policy

Continue with v0.x by default. Ask the project owner before changing to v1.0.00, v2.0.00, or another major version. Every release updates the source header and README.
