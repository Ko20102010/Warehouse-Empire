# Weapon Shop Empire

## Current Version: v0.16.00

Playable modular-art integration release based on the tested v0.15.01 Forest Outpost build.

### Changes in v0.16.00

- Added the first production modular-art loading layer.
- Integrated 11 modular environment/material PNG files used by the playable map.
- Retained the collision-aligned Forest Outpost base artwork to preserve routes and gameplay boundaries.
- Corrected invalid `first_shop_art.jpg` references to the packaged PNG.
- Updated cache-busting references and all visible version labels.
- Added save migration from v0.15.01 while retaining older migration prefixes.
- Included a reduced asset manifest containing only artwork packaged in this build.

### Preserved systems

Three save slots, end-of-day auto-save, camera and zoom, touch/drag movement, collision, A* routing, crafting, stocking, customers, employees, wholesale, combat, reputation, game over and Forever Skills remain in the playable code.

## Upload

Upload the contents of this ZIP to the root of the GitHub-hosted site. No manual code editing or merging is required.

## Packaging policy

This package includes only artwork needed by this build. The full modular starter pack remains a separate source-art package.

## Version policy

Continue with v0.x by default. Ask before moving to v1.0.00 or any later major version.
