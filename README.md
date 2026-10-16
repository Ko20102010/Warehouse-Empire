# Weapon Shop Empire v0.17.00 Real-Asset Integration Plan

This is a planning and implementation-control package, not a playable build and not a concept-art claim.

## Source of truth

- Playable baseline: v0.16.02
- Existing artwork: the environment assets already uploaded to the repository
- Packaging: future updates include only changed code, map data, and new or modified artwork
- No full gameplay background image
- `assets/art_preview.html` must display the same files actually used in gameplay

## v0.17.00 release objective

Convert the functional v0.16.02 modular prototype into a real-asset map without adding new gameplay systems.

The release is complete only when visible terrain, walls, doors, fences, gates, main furniture, and product stock are rendered from actual transparent assets or are explicitly marked as temporary when a production asset does not yet exist.

## Mandatory implementation order

1. Externalize map objects, collisions, interactions, and visual slots into JSON.
2. Integrate existing terrain, wall, door, fence, gate, tree, material, and prop PNGs.
3. Verify visible walls and collision geometry together.
4. Create and integrate missing production furniture PNGs.
5. Create and integrate proper product PNGs.
6. Replace the preview page with a gallery of actual file assets and integration status.
7. Run route, save, inventory-state, mobile-control, and browser regression tests.
8. Start character and monster sprite production only after the environment passes.

## Deliverables expected from the eventual playable release

- `Weapon_Shop_Empire_v0.17.00_Update.zip`
- Changed root code files only
- `data/world_map.json`
- `data/collisions.json`
- `data/interactions.json`
- `data/visual_slots.json`
- New or changed PNG assets only
- Updated `assets/art_preview.html`
- Updated asset manifest with integration status
- Test report

## Explicitly prohibited

- Restoring a full-world JPG/PNG as the playable map
- Baking products, customers, employees, monsters, coins, or contract quantities into scenery
- Calling CSS boxes, emoji, or a concept sheet finished gameplay assets
- Moving artwork without updating collision and navigation data
- Resending unchanged artwork in routine update ZIPs
