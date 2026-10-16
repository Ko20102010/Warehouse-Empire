# Weapon Shop Empire

## Current Version: v0.9.00

This release rebuilds the map around gameplay meaning. The pixel-art style is original and only takes broad inspiration from colorful top-down RPG management games. No supplied reference map is copied.

## Map Design Logic

The map no longer uses decorative houses that cannot be understood. Every operational room is shown as an open-top floor with walls, furniture, a room label and a visible door gap.

### Main Shop
- Large shared retail floor.
- Attack, Defense and Other counters have wide aisles.
- Customer Hall connects directly to the east entrance.
- South entrance connects the retail shop to Staff and Contract areas.

### Forge
- Walkable interior room.
- Visible furnace and anvil.
- South door is open.
- Orange interaction area is reachable inside the room.

### Alchemy
- Walkable interior room.
- Visible potion bottles and workbench.
- South door is open.
- Green interaction area is reachable inside the room.

### Staff Room
- Open-top interior with beds and table.
- North door is open.
- Employees physically return there to recover.

### Contract Warehouse
- Fenced outdoor storage yard.
- Visible product crates.
- West-side gate is open.
- Contract storage interaction area is reachable.

### Monster Forest
- Outside the shop through the east opening.
- Trees and rocks visually distinguish the adventure area.

## Movement
- Hold and drag anywhere for floating-joystick movement.
- Release to stop.
- Quick tap keeps destination movement.
- Buildings, counters, walls and fences block movement.
- Door gaps are physically open and traversable.
- Characters slide along walls.

## Three Reviews Completed

### Review 1: Player-view design review
- Every room has a visible purpose.
- Every operational room has a visible entrance.
- Important stations are located inside reachable spaces.
- Wide aisles support phone movement.
- Decorative roofs no longer hide playable rooms.

### Review 2: Map and collision review
- Spawn point is outside obstacles.
- Forge interaction point is reachable.
- Alchemy interaction point is reachable.
- All three retail zones are reachable.
- Customer area, Staff Room, Contract Warehouse and Monster Forest are reachable.
- Door gaps are wider than the player collision diameter.
- Player, clients and employees use the same collision system.

### Review 3: Gameplay regression review
- Three save slots remain available.
- Drag movement and zoom remain available.
- Tutorial, daily goals, events and crafting mini-game remain available.
- Employees, clients, wholesale and monster combat remain available.
- README version history and cache-busting version updated.

## Upload to GitHub

Extract and replace:

```text
index.html
style.css
game.js
README.md
assets/
```

The lower-left marker must show `Weapon Shop Empire v0.9.00`.

## Version History

### v0.9.00 - 2026-10-16
- Rebuilt the full map around meaningful shop functions.
- Removed decorative inaccessible building logic.
- Added open-top walkable Forge, Alchemy and Staff rooms.
- Added a gated walk-in Contract Warehouse.
- Added visible doors and wide navigation aisles.
- Rebuilt wall collision to match displayed walls.
- Repositioned clients, workers, player and monster routes.
- Completed player-view, map/collision and regression reviews.

### v0.8.00 - 2026-10-16
- Added drag movement and physical collision.

### v0.7.00 - 2026-10-16
- Added original top-down pixel-art presentation.

### v0.6.00 and earlier
- Added zoom, tutorials, daily variety, active workers/clients, wholesale, save slots and core game systems.

## Version Policy
Continue with v0.x by default. Ask before moving to v1.0.00, v2.0.00 or another major version.
