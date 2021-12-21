# odin_battleship

creating a web version of battleship game

difficulties:

1. working on the computer logic in hitting shots:
   once there is a hit, the computer will search and destroy that ship by taking neighbouring shots. This takes into account that:
   a) once the ship is sunk, the computer would go back to finding another ship
   b) after searching for one direction that goes beyond the edge of the target ship, the computer should know that the opposite direction should be correct
   c) it is possible that more than one ship are stacked together, this means that it is theoretically possible that the computer would need to seek out all four possible directions from the initial shot to take out a ship.
