# Weapon Shop Empire

## Current Version: v0.8.00

This release focuses on making the game genuinely playable on phones. It adds hold-and-drag movement, physical collision, and a three-pass quality review process.

## Phone Movement

- Press and hold anywhere on the game world.
- Slide the finger away from the first touch point.
- The player continuously moves in that direction.
- Moving the finger farther increases the virtual-stick strength.
- Releasing the finger stops the player.
- A quick tap still moves the player toward that point.
- A temporary virtual-stick indicator appears at the finger position.

## Collision

The player, employees, and clients can no longer walk freely through major structures. Collision is added to:

- Main weapon shop
- Forge building
- Contract office
- Staff House
- Herb garden fence
- Attack, Defense, and Other stalls
- Customer counter
- Contract warehouse fence
- Outer forest boundary

Movement uses axis-separated collision so characters can slide along walls rather than stopping completely.

## Three-Pass Review Completed

### Review 1: Code and package integrity
- JavaScript syntax checked.
- ZIP integrity checked.
- File list checked.
- Version and cache-busting references checked.

### Review 2: Movement and collision logic
- Drag start, drag update, release-to-stop, and tap fallback checked.
- Player collision checked.
- Employee/client route collision checked.
- Axis-separated wall sliding checked.

### Review 3: Core feature regression
- Three save slots checked.
- Zoom, tutorial, daily goals, events and crafting mini-game checked.
- Employees, clients, wholesale, monster combat and Forever skills checked.

## Upload to GitHub

Extract the ZIP and replace the root files/folder:

```text
index.html
style.css
game.js
README.md
assets/
```

The bottom-left marker must show `Weapon Shop Empire v0.8.00`.

## Version History

### v0.8.00 - 2026-10-16
- Added hold-and-drag virtual-stick movement.
- Added release-to-stop control.
- Kept quick-tap destination movement.
- Added visible temporary joystick indicator.
- Added collision for major buildings, walls, fences, counters and stalls.
- Added axis-separated wall sliding.
- Repositioned starting characters onto walkable areas.
- Added formal three-pass review before release.

### v0.7.00 - 2026-10-16
- Replaced soft-3D artwork with original top-down pixel art.

### v0.6.00 - 2026-10-16
- Added zoom, casual tutorial, daily variety and crafting timing.

### v0.5.00 and earlier
- Added active characters, pop-up UI, wholesale contracts, save slots and the first complete game systems.

## Version Policy

Continue with v0.x versions by default. Ask before moving to v1.0.00, v2.0.00 or another major version.
