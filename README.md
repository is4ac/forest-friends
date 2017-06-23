# README

1. [Install Meteor](https://www.meteor.com/install) (version >=1.4.1).
2. Download or clone this repo.
3. From inside the main directory of the project, run:

`meteor run`

The application should now be running at http://localhost:3000/. 

## Gameplay

The gameplay consists of 2 phases: the move/expand phase and the 'code cards' phase. While one player is doing their move phase, the other player will be selecting code cards. The move phase is always executed before the next code cards phase. 

### Move phase

During the move/expand phase, players can select their skunks or owls and move them across the board onto empty tiles, while also trying to take over occupied territory. The numbers on the tiles represent how many 'units' of that animal are available on that tile. In order to take over occupied territory, a die is rolled for each animal unit on the two tiles. If the sum of the value that you rolled is higher than the defending animal's dice roll, then you take over the space. 

There is also an element of rock-paper-scissors to this game, where each animal has a strength and a weakness. Bobcats get an advantage roll over owls, owls have an advantage over skunks, and skunks have an advantage over bobcats. At the end of each move phase (when the player clicks the "End Move" button), additional animal units are randomly distributed based on how many tiles you own. Eventually, there will also be resource terrain tiles that give you bonus reinforcements each turn.

### Cards Phase

While the other player is doing their move phase, you get to select which cards you are going to play for that round. The code cards are currently implemented in Blockly, but will eventually be replaced with a true 'card' feature that only allows for each code card component to be used once. You will be able to rearrange the code card structure after each round of play. However, since the move phase is executed before the code cards phase, you may not always be able to correctly predict how your opponent will move before your code is executed. So be prepared!

## Research

This game is being used as part of on-going research at UW-Madison studying game-exhibits and computational literacy. Visit the [Complex Play Lab website](http://complexplay.org/) for more info.
