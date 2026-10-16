# Weapon Shop Empire

## Current Version: v0.14.00

The approved Forest Outpost artwork is now the actual scrolling gameplay map rather than only a landing-screen concept.

## Collision-aligned gameplay map

- The world uses `assets/forest_outpost_map.jpg` as the live canvas map.
- World size is 1870 × 2870, larger than a phone screen.
- Camera follows the player and supports pinch, wheel and button zoom.
- Collision strips align to visible room edges, racks, counters, fences, office walls and water.
- Visible entrances remain open and walkable.
- Dynamic player, customers, employees, products, materials, coins and monsters render over the artwork.
- Live station labels show the exact interaction locations for the first conversion build.

## First shop and future properties

### Tier 1: Forest Outpost
This v0.14.00 map is the first shop.

### Tier 2: Town Workshop
Future purchasable property around three times larger.

### Tier 3: Guild Emporium
Future much larger multi-building shop and adventure compound.

## Important limitation

The approved concept artwork contains some baked decorative people, labels and goods. The gameplay systems are dynamic and collision-aligned, but the next art-production pass should replace the single concept image with clean modular layers that remove all baked characters and stock. v0.14.00 is the first functional collision-aligned conversion.

## Retained gameplay

- Three save slots and day-end auto-save
- Drag movement, camera follow and zoom
- Material gathering
- Sword, Shield, Potion and Slime Edge crafting
- Physical outputs, carrying, visible shelf inventory and checkout coins
- Customer ATK/DEF and rarity requirements
- Zero-employee start, hiring and worker assignments
- Contract Warehouse and wholesale deadlines
- Daily goals, events, combat, reputation and Forever skills

## Upload

Extract and upload every file and the complete assets folder:

```text
index.html
style.css
game.js
README.md
assets/
  art_preview.html
  first_shop_art.png
  forest_outpost_map.jpg
```

The visible version must show `v0.14.00`.
