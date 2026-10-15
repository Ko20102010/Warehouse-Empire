# Warehouse Empire

A browser-first warehouse/logistics game prototype. The player directly controls one stickman warehouse worker, completes physical shipment loops, earns money, buys upgrades, and will gradually automate and expand the operation.

## Current Version: v0.2.00

### Play
Open `index.html` locally, or deploy the repository with GitHub Pages.

### Controls
- **WASD / Arrow keys:** walk
- **Shift:** run
- **Mobile:** on-screen directional controls + RUN

### Gameplay Loop
1. Walk into the blue **INBOUND** area to collect cartons.
2. Carry cartons across the warehouse.
3. Enter the green **OUTBOUND** area to deliver them.
4. Fill the whole order.
5. The shipment completes and pays money.
6. Buy upgrades and process increasingly larger orders.

### Permanent Progression
`Company Training` is the first forever upgrade. Progress is stored with browser `localStorage` in this prototype.

## Roadmap
- **v0.3:** first AI employee, trolley, improved warehouse art/animation
- **v0.4:** forklift, pallet cargo, conveyors, extra loading bays
- **v0.5:** warehouse expansion, multiple orders, rush/high-value jobs, expanded permanent upgrade tree

## Version History

### v0.2.00 - 2026-10-15
First GitHub-ready playable release.

- Rebuilt shipment-to-money loop so money is paid reliably when a whole order is completed.
- Added directly controllable stickman warehouse worker.
- Added walking and Shift-to-run controls.
- Added mobile directional controls and RUN button.
- Added visible cartons and carton carrying capacity.
- Added inbound and outbound loading bays with trucks.
- Added visible order progress.
- Added regular Shoes and Carry upgrades.
- Added first permanent/forever Company Training upgrade.
- Added automatic browser save using localStorage.
- Added responsive browser layout.

### v0.1.00 - 2026-10-15
Initial concept prototype.

- Basic controllable worker movement.
- Experimental inbound/outbound pickup zones.
- Early upgrade concept.
- Identified unreliable earning loop and insufficient visual presentation, leading to the v0.2 rebuild.

## Project Rules
- The main character must always remain directly controllable.
- Walking and running are core controls.
- Permanent upgrades survive progression/reset systems.
- Automation assists the player rather than replacing play.
- The advertised mini-game style should represent the real gameplay.
- Browser/GitHub deployment comes first; mobile-friendly design is maintained.
- Monetization comes later, after the core game is genuinely enjoyable.

## Versioning
Every release must update both:
1. The version comment/header in the game source.
2. This README's **Version History**.

Version policy:
- Major new function: increase major version.
- Minor new function: increase minor version.
- Bug-fix only: increase two-digit patch number.

## GitHub Pages
Upload all files to the repository root. Enable GitHub Pages for the repository and publish the root site. `index.html` is the entry point.
