# Weapon Shop Empire v0.16.00 Modular Asset Plan

## Objective

Replace the single flattened concept map with modular, independently renderable assets. Dynamic products, workers, customers, monsters, coins, crates, and request bubbles must never be baked into the ground map.

## Rendering layers

1. **Ground**: grass, floor, road, water, cliffs.
2. **Lower environment**: lower walls, fences, counters, empty shelves, workstation bases.
3. **Dynamic world**: materials, products, coins, crates, player, workers, customers, monsters.
4. **Upper environment**: tree canopies, upper walls, door arches, tall shelf fronts, banners.
5. **Effects**: fire, alchemy bubbles, rarity glow, damage, collection effects.
6. **UI**: request bubbles, patience bars, contextual actions, panels.

## Asset production phases

### Phase A: Environment starter pack, included now
- Terrain and floor tiles
- Water and bridge pieces
- Cliffs and stairs
- Walls, doors, gates, and fences
- Trees, bushes, rocks, flowers
- Barrels, bags, crates, hay, lamps, campfire, forge props, wagon, and well

### Phase B: Functional shop art
- Empty Attack, Defense, and Other shelves
- Forge and Alchemy stations
- Output tables
- Checkout counter
- Contract racks and crate states
- Rare showcase
- Staff beds, training objects, and management furniture

### Phase C: Dynamic products and materials
- Iron Sword, Wooden Shield, Healing Potion, Slime Edge
- Rarity variants and glows
- Iron Ore, Wood, Herb, Slime Gel, Hide, Fang, Crystal, Magic Core
- Carried item icons and shelf-slot versions

### Phase D: Animated actors
- Player idle/walk/carry/attack
- Sales, Craft, and Expedition worker sets
- Six customer archetypes
- Slime, wolf, boar, goblin, golem, and forest boss

### Phase E: UI and effects
- Customer request bubble
- Patience bar
- Coin stack states
- Craft timing art
- Context buttons
- Impact, collection, rare-drop, forge-fire, and alchemy effects

## Technical standards

- PNG with transparent background for props and actors.
- WebP/PNG for large map layers.
- Consistent top-down orthographic view.
- Light source from upper left.
- Integer pixel scaling where possible.
- Environment tile target: 96 or 128 source pixels.
- Character frame target: 96×128 or 128×160.
- Product inventory icon target: 64×64.
- Shelf product sprite target: 32×32 or 48×48.
- Every interactive asset needs anchor, collision, layer, and interaction metadata.

## Collision metadata

Collision belongs in map JSON, not inside the artwork. Use rectangles and polygons for walls, water, shelves, counters, trees, and stations. Door and gate gaps must be at least two character radii wide.

## Definition of done

The modular conversion is complete only when:

- No customer, employee, monster, product, coin, or wholesale progress is baked into the map.
- Shelf stock visibly changes one product at a time.
- Output tables visibly fill and empty.
- Contract crate states change dynamically.
- Characters pass behind upper walls and tree canopies correctly.
- Every visible solid boundary matches collision data.
