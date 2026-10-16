# Real Asset Requirements

## Production rules

- Original Weapon Shop Empire design
- Colorful, polished, lightly pixelated mobile-game style
- Transparent PNG
- Consistent three-quarter/top-down perspective
- Predictable English filenames
- Tight crop without excessive transparent padding
- Bottom-center anchor unless a documented exception applies
- No baked text, quantities, customers, employees, monsters, stock, or effects
- Rarity effects remain separate overlays

## Asset states

Use separate states only when the world must visibly change:

- Station: idle, active frames, complete, blocked/full
- Contract crate: empty, partial, full, sealed
- Showcase: empty base plus live product and glow overlays
- Shelf: empty furniture plus live item slots
- Output: empty furniture plus live item slots

## Acceptance checklist per PNG

- Opens successfully
- Has transparency
- Matches approved scale
- Matches perspective and lighting
- Correct anchor recorded
- Render layer recorded
- Collision linkage recorded where relevant
- Appears in actual-assets preview
- Tested in gameplay at mobile zoom levels
