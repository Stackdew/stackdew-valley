import Phaser from 'phaser'

// import GameScene from './scenes/game-scene'

import overworldScene from './scenes/overworld.js';
import preloadScene from './scenes/preloadScene.js';
import firstFloor from './scenes/firstFloor.js';
import secondFloor from './scenes/secondFloor.js';
import farmScene from './scenes/farmScene.js';
import computerScene from './scenes/computerScene.js';
import officeScene from './scenes/officeScene.js';
import battleScene from './scenes/battleScene.js';
// import battleCardScene from './scenes/battleCards.js';
import pauseScene from './scenes/pauseScene.js';
// import trumpBattle from "./scenes/trumpScene.js";

let gameInstance = null

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 448,
  backgroundColor: '#2d2d2d',
  parent: 'stackdew-valley',
  scene: [
    firstFloor,
    farmScene,
    overworldScene,
    preloadScene,
    secondFloor,
    computerScene,
    officeScene,
    battleScene,
    pauseScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
}

export const launchGame = () => {
  if (!gameInstance) {
    gameInstance = new Phaser.Game(config)
  }
}

export const destroyGame = () => {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
}

export const getGameInstance = () => gameInstance
