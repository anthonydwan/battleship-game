# odin_battleship

creating a web version of battleship game

key points of highlight while working on this project:

1. working on the computer logic in hitting shots:
   once there is a hit, the computer will search and destroy that ship by taking neighbouring shots. This takes into account that:
   a) once the ship is sunk, the computer would go back to finding another ship
   b) after searching for one direction that goes beyond the edge of the target ship, the computer should know that the opposite direction should be correct
   c) it is possible that more than one ship are stacked together, this means that it is theoretically possible that the computer would need to seek out all four possible directions from the initial shot to take out a ship.

2. the dom logic:
   my implementation of the drag and drop ship involves the head of the ship taking the coordinate of the grid. the main challenge is that the div of the ship reaches outside of the head cell and if it is drags from a point that is not the head of ship, the new position would also shift back to the head of the ship at the position of the cursor which makes the interaction unintuitive.

To counter this, I have saved a variable that looks at the where the cursor originally was at the time of drag start and offset back when the drag ends.
