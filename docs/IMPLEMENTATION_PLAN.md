# v0.17.00 Implementation Plan

## Phase 0: Protect the playable baseline

- Start from v0.16.02.
- Preserve the `drawCrate()` runtime fix, movement, camera initialization, zoom, saves, and migration.
- Add an automated smoke test that creates a save, renders frames, and confirms player coordinates change after movement.

Exit gate: no first-frame runtime error.

## Phase 1: Data-driven map

Create production JSON files:

- `data/world_map.json`: zones and placed visual objects
- `data/collisions.json`: rectangles/polygons and entity blocking rules
- `data/interactions.json`: stations, shelves, outputs, checkout, recovery, training, wholesale, gate
- `data/visual_slots.json`: product, output, rare-showcase, and contract positions

The renderer reads JSON. Collision never comes from image pixels.

Exit gate: the map loads with no hard-coded room placement required for rendering.

## Phase 2: Existing environment assets

Integrate in this order:

1. Grass, workshop floor, wood floor, paths, water, bridge, cliffs
2. Straight walls and corners
3. Doors and open frames
4. Fences and gates
5. Trees and canopy layering
6. Rocks, plants, lamps, crates, barrels, wagon, well, work props

All nineteen existing wall-family assets must be assessed. Any unused asset must carry a reason in the manifest.

Exit gate: visible boundaries match collision boundaries and all door gaps are passable.

## Phase 3: New functional furniture assets

Required new transparent PNGs:

- `furniture/shelf_attack_empty.png`
- `furniture/shelf_defense_empty.png`
- `furniture/shelf_other_empty.png`
- `stations/forge_idle.png`
- `stations/forge_active_01.png` to `forge_active_03.png`
- `stations/shield_workbench.png`
- `stations/alchemy_idle.png`
- `stations/alchemy_active_01.png` to `alchemy_active_03.png`
- `furniture/output_table_attack.png`
- `furniture/output_table_defense.png`
- `furniture/output_table_other.png`
- `furniture/checkout_counter.png`
- `furniture/rare_showcase_empty.png`
- `furniture/contract_rack_empty.png`
- `furniture/staff_bed.png`
- `furniture/training_dummy.png`
- `furniture/management_desk.png`

Exit gate: procedural furniture rectangles are removed from normal gameplay.

## Phase 4: Product sprites

Each product requires a world sprite and UI icon:

- Iron Sword
- Battle Axe
- Slime Edge
- Wooden Shield
- Guard Helmet
- Healing Potion
- Repair Kit

The same source identity must be used on output tables, retail shelves, carrying displays, customer purchases, rare storage, and wholesale storage.

Exit gate: no emoji is used as the main world representation of a product.

## Phase 5: Honest preview

`assets/art_preview.html` must load real repository files. Every card reports:

- File name
- Category
- Integrated / available / missing status
- Gameplay use
- Anchor and intended render layer

Missing files display `NOT YET CREATED`; they must not use a substitute emoji or CSS drawing.

## Phase 6: Route and browser validation

Required route tests:

- Spawn to every room
- Material node to forge/alchemy
- Station to output table
- Output table to correct shelf
- Entrance to each department shelf
- Shelf to checkout and exit
- Employee to sales, craft, expedition, bed, and training
- Contract output to correct contract bay
- Courtyard to Forest Adventure gate
- Player and employee traversal through every door, gate, and bridge

Required state tests:

- Shelf 0, 1, 6, and 12 items
- Output 0, 1, and 8 items
- Contract empty, partial, full, and sealed
- Material collected and regrown
- Save/reload all visible states
- v0.16.02 migration
- Touch move, tap move, keyboard move, zoom buttons, wheel, and pinch

Release gate: no critical route failure and no first-frame console error.
