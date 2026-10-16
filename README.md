# Weapon Shop Empire

## Current Version: v0.10.00

This version rebuilds the core game loop to feel like a playable mobile advertisement mini-game: the player crafts products, visibly picks them up, carries them, fills shelves, watches customers take them, and physically collects the money left at checkout.

## Core Loop

```text
Craft at Forge/Alchemy
→ Product appears at workshop OUTPUT
→ Walk over the output to pick up up to 3 products
→ Products visibly stack above the player
→ Carry products to the matching shelf
→ Shelf visibly fills
→ Customer walks in and takes one product
→ Customer leaves coins at checkout
→ Player walks over the coins to collect money
→ Hire helpers later to automate steps
```

## Major Changes

- New games start with **zero employees**.
- Removed the confusing decorative objects along the upper edge.
- Crafted products no longer jump directly into invisible stock.
- Sword and potion products physically wait at workshop output doors.
- Player automatically picks up nearby products, up to a carrying capacity of 3.
- Carried products visibly stack above the player.
- Player stocks Attack, Defense and Other shelves by walking to them.
- Shelf stock appears visually and missing stock is immediately visible.
- Customers take products directly from visible shelf stock.
- Customers leave coins at the checkout.
- Money is not added until the player or Sales employee collects the coin pile.
- The top guide continuously explains the five-stage loop.
- The HUD shows what the player is carrying and how much money is waiting at checkout.
- A physical Staff Room hire pad lets the player hire the first helper for $120.
- Sales employees move workshop output to shelves and collect checkout money.
- Craft employees create items but leave them at physical outputs.

## Three Reviews Completed

### Review 1: Player Experience
- New player starts alone.
- First task is visible and explained.
- Crafted output has a visible location.
- Carrying has visible feedback.
- Shelf fullness is visible.
- Sales have visible product removal and coin creation.
- Money requires a physical collection action.

### Review 2: Design Logic
- Products move through consistent states: output, hands, shelf, customer, money.
- Employees automate the same actions the player performs manually.
- No unexplained passive money.
- Hiring happens after the player understands manual work.
- Product shortages are visible rather than hidden in tables.

### Review 3: Playability and Regression
- Room entrances and collision retained.
- Drag movement and zoom retained.
- Three save slots retained.
- Customers, employees, wholesale, combat, tutorial, goals and crafting retained.
- JavaScript syntax and ZIP integrity checked.

## Upload

Extract and replace:

```text
index.html
style.css
game.js
README.md
assets/
```

The lower-left marker must show `Weapon Shop Empire v0.10.00`.

## Version History

### v0.10.00 - 2026-10-16
- Added physical workshop output piles.
- Added player carrying and shelf stocking.
- Added visible shelf inventory.
- Added checkout coin piles and physical collection.
- Changed new game to start with no employees.
- Added physical hiring pad.
- Removed confusing upper-edge decorative objects.
- Reworked Sales employees to automate carrying and coin collection.
- Added three-pass player/design/playability review.

### v0.9.00 - 2026-10-16
- Rebuilt the map into meaningful open-top rooms with visible doors.

### v0.8.00 and earlier
- Added drag movement, collisions, pixel art, zoom, daily variety, wholesale and save slots.

## Version Policy
Continue with v0.x by default. Ask before changing to v1.0.00, v2.0.00 or another major version.
