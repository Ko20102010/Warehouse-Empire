# Weapon Shop Empire

## Current Version: v0.16.00

This lightweight update upgrades **Weapon Shop Empire** to `v0.16.00`, introducing the **6-Layer Modular Forest Outpost Renderer** (with zero baked-in static people or stock), **Collision-Aware 2D Grid A* Pathfinding**, **6 Craftable Products (including Battle Axe, Guard Helmet, and Repair Kit)**, and **Player Self-Crafted Equipment**.

## Package Information

- **Package type:** Lightweight Update (`Weapon_Shop_Empire_v0.16.00_Update.zip`)
- **Artwork changed:** Added `assets/art_preview.html` dynamic 22-asset preview & integrated modular layer rendering in `game.js`
- **Keep existing assets folder:** Yes (keep your existing `assets/` folder in GitHub)

## What Is New in v0.16.00

- **6-Layer Modular Map Rendering System:**
  1. **Ground Layer:** Grass, flowers, sandstone/mossy roads, wooden & workshop floors, southern river, and wooden bridge.
  2. **Lower Environment Layer:** Walls, open doorways, Forge furnaces & anvils, Alchemy cauldrons, empty 12-slot Attack/Defense/Other shelves, Checkout counter, 20-slot Contract Warehouse pallets, Rare Showcase, Staff beds, Training dummies, Management desk, and Special Visitor well.
  3. **Dynamic World Layer (Y-Sorted):** Material Yard nodes with regrowth bars, 8-slot Output Tables, 12-slot Retail Shelves, Contract Crates, Checkout Coins, Player, Workers, Customers, Monsters, and physical monster loot drops.
  4. **Upper Environment Layer:** Tree canopies, Forest Adventure Gate arch, department banners, and room signboards.
  5. **Effects Layer:** Animated furnace fire sparks, alchemy cauldron bubbles, combat slash arcs, and floating numbers.
  6. **UI Layer:** Customer request bubbles with minimum ATK/DEF & rarity, patience bars, and contextual action bar.
- **2D Grid A* Pathfinding Engine:**
  - Workers and customers navigate using collision-aware A* pathfinding with anti-corner-cutting and automatic stuck recalculation.
- **Expanded Recipes, Repair Kits & Hero Equipment:**
  - Added **Battle Axe**, **Guard Helmet**, and **Repair Kit** (repairs `Poor` defective items into `Uncommon` quality).
  - Crafting stronger weapons or shields automatically equips your shopkeeper for higher `ATK` and `DEF` in the forest!

## Version History

### v0.16.00 - 2026-10-16
- Implemented 6-layer modular world rendering (eliminating baked-in static characters and stock).
- Added 2D Grid A* pathfinding with anti-corner-cutting for all employees and customers.
- Added Battle Axe, Guard Helmet, Repair Kit, physical monster loot drops, and player equipment stats.
- Updated `assets/art_preview.html` with the 22-component dynamic station and sprite gallery.

### v0.15.01 / v0.15.00 - 2026-10-16
- Aligned `1870 × 2870` Forest Outpost coordinates, Special Visitor Plaza, Training Room, and Management Office.

### v0.14.00 - 2026-10-16
- First collision-aligned conversion of `1870 × 2870` Forest Outpost map.

### v0.12.00 & v0.11.00
- Added Material Yard, Shield crafting, Wholesale Contract Warehouse delivery, item quality inspection, and mobile context bar.