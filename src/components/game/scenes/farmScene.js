import Phaser from 'phaser';
import Player from '../src/player.js';
import DialogueManager from '../src/dialogueManager.js';
import renderInventory from '../src/renderInventory.js';
import togglePause from '../src/togglePause.js';
import { database, userInventory } from '../src/dummydata.js';
import { updateInventory } from '../../../firebase/firebase-queries.js';

export default class farmScene extends Phaser.Scene {
	constructor() {
		super('farmScene');
	}

	init(data) {
		this.from = data.from;

		//Where we spawn when coming FROM these locations
		const spawnPoints = {
			firstFloor: { x: 275, y: 300 },
			overworldScene: { x: 700, y: 340 },
		};

		const spawn = spawnPoints[this.from] || { x: 275, y: 300 };
		this.spawnX = spawn.x;
		this.spawnY = spawn.y;
	}

	preload() {
		this.load.tilemapTiledJSON('theFarmMap', '../assets/chrisfarm.json');
		this.load.image('1_Terrains_32x32', '../assets/1_Terrains_32x32.png');
		this.load.image('2_Fences_32x32', '../assets/2_Fences_32x32.png');
		this.load.image(
			'3_Props_and_Buildings_32x32',
			'../assets/3_Props_and_Buildings_32x32.png'
		);
		this.load.image('6_Trees_32x32', '../assets/6_Trees_32x32.png');
		this.load.spritesheet('playerSheet', 'assets/rose.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
		//devling head for UI
		this.load.spritesheet('devlingImage', '../assets/devlingSpritesheet.png', {
			frameWidth: 64,
			frameHeight: 64,
		});

		//sound effects
		this.load.audio('plantingSound', '../assets/planting.wav');
		this.load.audio('wateringSound', '../assets/watering.wav');
		this.load.audio('harvestingSound', '../assets/harvest.wav');
		this.load.audio('birdsSound', '../assets/birds.wav');
		this.load.audio('speechSound', '../assets/speechSound.wav');
		this.load.audio('doorSound', '../assets/door.wav');
		this.load.audio('levelUpSound', '../assets/levelup.wav');
	}

	create() {
		this.input.keyboard.enabled = true;

		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);
		this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

		//initialise dialogue manager
		this.dialogue = new DialogueManager(this);
		this.isDialogueRunning = false;

		//initialise render inventory
		this.renderInventory = new renderInventory(this);
		this.renderInventory.render(userInventory);

		//reset plot offset for planting later
		let plotOffset = 0;

		//test to see if the scene has ran before and if not, play a tutorial
		if (!this.registry.get('farmSceneTutorial')) {
			this.registry.set('farmSceneTutorial', true);
			this.time.delayedCall(700, () => {
				this.dialogue.startDialogue(
					[
						{
							text: `Tip: Use this plot by the troughs to nurture your devlings.`,
							speaker: '',
							color: '#1f451c',
						},
						{
							text: `Press Space to interact with it.`,
							speaker: '',
							color: '#1f451c',
							x: 370,
							y: 20,
						},
						{
							text: `Devlings need to be planted, watered then harvested.`,
							speaker: '',
							color: '#1f451c',
						},
						{
							text: `You can also head back into the farmhouse or into StackDew Valley.`,
							speaker: '',
							color: '#1f451c',
						},
					],
					null,
					360,
					20
				);
			});
		}

		//create audio
		this.plantingSound = this.sound.add('plantingSound');
		this.wateringSound = this.sound.add('wateringSound');
		this.harvestingSound = this.sound.add('harvestingSound');
		this.birdSound = this.sound.add('birdsSound');
		this.doorSound = this.sound.add('doorSound');
		this.levelUpSound = this.sound.add('levelUpSound');
		this.doorSoundPlayed = false;

		// FRONT DOOR to firstFloor
		this.frontDoorTrigger = this.physics.add.sprite(273, 260, null);
		this.frontDoorTrigger.setSize(45, 60);
		this.frontDoorTrigger.setVisible(false);
		this.frontDoorTriggered = false;

		// PATH to overWorldMap
		this.toOverworldTrigger = this.physics.add.sprite(775, 365, null);
		this.toOverworldTrigger.setSize(40, 110);
		this.toOverworldTrigger.setVisible(false);
		this.toOverworldTriggered = false;

		//create hidden trigger for planting devling
		this.plantTrigger = this.physics.add.sprite(560, 215, null);
		this.plantTrigger.setSize(150, 40);
		this.plantTrigger.setVisible(false);
		this.plantTriggered = false;

		//create devling sprite images
		//inventory & shadow:
		this.devlingSprites = {};
		this.devlingShadowSprites = {};
		//farm dirt patch:
		this.plantedDevlingSprites = {};

		//this.renderInventory.render(userInventory);

		this.cameras.main.fadeIn(1000, 0, 0, 0);

		const map = this.make.tilemap({ key: 'theFarmMap' });
		const terrains = map.addTilesetImage('1_Terrains_32x32');
		const fences = map.addTilesetImage('2_Fences_32x32');
		const props = map.addTilesetImage('3_Props_and_Buildings_32x32');
		const trees = map.addTilesetImage('6_Trees_32x32');
		const tilesets = [terrains, fences, props, trees];
		const baseLayer = map.createLayer('base', tilesets, 0, 0);
		const treeLayer1 = map.createLayer('trees', tilesets, 0, 0);
		const treeLayer2 = map.createLayer('trees2', tilesets, 0, 0);
		const propsLayer = map.createLayer('props', tilesets, 0, 0);
		const plotsLayer = map.createLayer('plots', tilesets, 0, 0);
		propsLayer.setCollisionByProperty({ collide: true });
		plotsLayer.setCollisionByProperty({ collide: true });

		this.player = new Player(this, this.spawnX, this.spawnY, 'playerSheet');

		this.physics.add.collider(this.player, propsLayer);
		this.physics.add.collider(this.player, plotsLayer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.input.keyboard.enabled = true;

		//debug visual for playerBounds
		this.debugGraphics = this.add.graphics();
		this.debugGraphics.lineStyle(1, 0x00ff00);

		this.renderInventory.render(userInventory);
		this.birdSound.play();

		//scarecrow Stephen's message of the day
		this.scarecrowMessagePlayed = false;
		const randomDelay = Phaser.Math.Between(21000, 24000);
		this.time.delayedCall(randomDelay, () => {
			this.tryTriggerScarecrowMessage();
		});

		//handle passing score from snake minigame back to farmScene
		this.events.on('wake', () => {
			this.isDialogueRunning = false;
			if (this.weedsEatenBySnake) {
				console.log(
					'Returning from snake game with weeds eaten:',
					this.weedsEatenBySnake
				);

				//use the value to boost the devlings
				this.applyWeedBonus(this.weedsEatenBySnake);

				//clear the value as its not needed again right now
				delete this.weedsEatenBySnake;
			} else {
				console.log('wtf');
			}
		});
	}

	update() {
		this.player.update();
		//removed becauese it was breaking the new watering graphic
		//this.renderInventory.render(userInventory);

		// pause toggle
		if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
			togglePause(this);
		}

		//create playerBounds for collision
		const footHeight = this.player.height * 0.25;
		const playerBounds = new Phaser.Geom.Rectangle(
			this.player.x - this.player.width / 6,
			this.player.y - this.player.height / 4 + footHeight,
			this.player.width / 3,
			footHeight
		);

		//FRONT DOOR requires
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				this.frontDoorTrigger.getBounds()
			)
		) {
			//stop player movement
			// this.player.setVelocity(0, 50);
			this.player.body.moves = false;

			//hide door to make it look open
			const doorCover = this.add
				.rectangle(272, 257, 33, 45, 0x333333)
				.setOrigin(0.5);
			doorCover.setDepth(500);
			doorCover.setAlpha(0);

			//fade door shadow in to hide player
			this.tweens.add({
				targets: doorCover,
				alpha: 0.3,
				duration: 500,
				ease: 'Power1',
			});

			this.tweens.add({
				targets: this.player,
				alpha: 0,
				duration: 200,
				ease: 'Power1',
			});
			this.time.delayedCall(100, () => {
				//play door sound
				if (!this.doorSoundPlayed) {
					this.sound.play('doorSound', { volume: 0.3 });
					this.doorSoundPlayed = true;
				}
				this.moveScene('firstFloor');
			});
		}

		//PATH to overworldmap
		const toOverworldTriggerBody = this.toOverworldTrigger.body;
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				new Phaser.Geom.Rectangle(
					toOverworldTriggerBody.x,
					toOverworldTriggerBody.y,
					toOverworldTriggerBody.width,
					toOverworldTriggerBody.height
				)
			)
		) {
			this.input.keyboard.enabled = false;
			this.moveSceneToOverworld('overworldScene');
		}

		//Plot for planting, watering, harvesting
		const plantTriggerBody = this.plantTrigger.body;
		const isOverlappingPlot = Phaser.Geom.Intersects.RectangleToRectangle(
			playerBounds,
			new Phaser.Geom.Rectangle(
				plantTriggerBody.x,
				plantTriggerBody.y,
				plantTriggerBody.width,
				plantTriggerBody.height
			)
		);

		if (
			isOverlappingPlot &&
			Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
			!this.isDialogueRunning
		) {
			const unplanted = userInventory.find(
				(devling) => !devling.isPlanted && !devling.isGrown
			);
			const unwatered = userInventory.find(
				(devling) => devling.isPlanted && !devling.isWatered && !devling.isGrown
			);
			const harvestableIndex = userInventory.findIndex(
				(devling) => devling.isPlanted && devling.isWatered && !devling.isGrown
			);

			if (unplanted) {
				//plant
				unplanted.isPlanted = true;
				localStorage.setItem('userInventory', JSON.stringify(userInventory));
				this.plantingSound.play();
				console.log('planting', unplanted.name);
				this.renderInventory.render(userInventory);
			} else if (unwatered) {
				//water
				unwatered.isWatered = true;
				unwatered.isWateredTweenActive = false;
				this.wateringSound.play({ volume: 0.5 });
				console.log('watering', unwatered.name);
				this.renderInventory.render(userInventory);
			} else if (
				//check to see if there's harvestable devlings
				userInventory.some(
					(devling) =>
						devling.isPlanted && devling.isWatered && !devling.isGrown
				)
			) {
				//stop dialogue and play minigame
				if (this.dialogue && this.dialogue.stopDialogue) {
					this.dialogue.stopDialogue();
				}
				this.scene.launch('minigameSnake');
				this.scene.sleep('farmScene');

				//harvest all eligible devlings
				const harvestedDevlings = [];
				userInventory.forEach((devling) => {
					if (devling.isPlanted && devling.isWatered && !devling.isGrown) {
						devling.isGrown = true;
						devling.isPlanted = false;
						devling.isWatered = false;
						harvestedDevlings.push(devling.name);
					}
				});

				if (harvestedDevlings.length > 0) {
					console.log('Harvested devlings:', harvestedDevlings.join(', '));
					this.harvestingSound.play();
					this.renderInventory.render(userInventory);
				}
			} else {
				//nothing to do
				if (this.dialogue && this.dialogue.stopDialogue) {
					this.dialogue.stopDialogue();
					this.dialogue.startDialogue(
						[
							{
								text: `Nothing to do here right now...`,
								speaker: '',
								color: '#1f451c',
							},
						],
						() => {
							this.isDialogueRunning = false;
						},
						385,
						20
					);
					this.isDialogueRunning = true;
				}
			}
		}
	}

	moveScene(sceneKey) {
		this.input.keyboard.enabled = false;
		updateInventory();
		this.cameras.main.fadeOut(500, 0, 0, 0);
		this.time.delayedCall(500, () => {
			this.scene.start(sceneKey);
		});
	}

	moveSceneToOverworld(sceneKey) {
		this.input.keyboard.enabled = false;
		updateInventory();
		this.cameras.main.fadeOut(500, 0, 0, 0);
		this.time.delayedCall(500, () => {
			this.scene.start(sceneKey, { from: 'farmScene' });
		});
	}

	tryTriggerScarecrowMessage() {
		if (this.scarecrowMessagePlayed) return;

		if (!this.isDialogueRunning) {
			this.scarecrowMessagePlayed = true;
			this.isDialogueRunning = true;

			const message = this.getScarecrowMessage();
			console.log(userInventory[0].haswon);
			console.log(message);
			this.dialogue.startDialogue(
				[
					{
						text: message,
						speaker: 'right',
						color: '#1f451c',
					},
				],
				() => {
					this.isDialogueRunning = false;
				},
				310,
				70
			);
		} else {
			//try again after 3 seconds if dialogue is already running
			this.time.delayedCall(3000, () => {
				this.tryTriggerScarecrowMessage();
			});
		}
	}

	getScarecrowMessage() {
		const days = [
			'Ah, lazy Sunday. The most chill day of all.',
			'Happy Monday Coders! Did you have a nice weekend?',
			'Tuesday is a great day to learn new code!',
			'Wednesday! Its all downhill to the weekend from here...',
			'Thursday is like Friday for Friday. Thats syntactic sugar baby!',
			'Fri-YAY! Amirite?',
			'Its the weekend. Make the most of it!',
		];

		const today = new Date().getDay();
		return days[today];
	}

	applyWeedBonus(weedCount) {
		//triple our score from the snake game (so a *good* score is in the 60s)
		let increaseChance = weedCount * 10;
		//cap the bonus chance at 90 so there's always a small chance of failure
		if (increaseChance > 90) {
			increaseChance = 90;
		}
		console.log(
			`bonus chance of ${increaseChance} derived from ${weedCount} weeds eaten...`
		);

		//devling stat keys to be possibly improved
		const statKeys = [
			'frontend',
			'backend',
			'dev ego',
			'commits',
			'debugging',
			'Resilience',
		];

		let delay = 0;

		//iterate over the devlings in userInventory
		userInventory.forEach((devling, index) => {
			this.time.delayedCall(delay, () => {
				//pick a stat key at random
				const randomKey = statKeys[Phaser.Math.Between(0, statKeys.length - 1)];

				//random number between 0 and 99
				const d100 = Phaser.Math.Between(0, 99);
				console.log(
					`Devling is ${devling.name}, d100 = ${d100}, increaseChance is ${increaseChance}`
				);

				//if d100 roll is less than
				if (d100 < increaseChance) {
					devling[randomKey] += 1;
					this.renderInventory.jiggleSprite(devling.name);
					this.sound.play('levelUpSound', {
						volume: 0.3,
						detune: Phaser.Math.Between(-50, 50),
					});
					this.isDialogueRunning = true;
					this.dialogue.startDialogue(
						[
							{
								text: `${devling.name}'s ${randomKey} increased to ${devling[randomKey]}`,
								speaker: '',
								color: '#1f451c',
								x: 380,
								y: 20,
							},
						],
						null,
						380,
						20
					);
				} else {
					this.isDialogueRunning = true;
					this.dialogue.startDialogue(
						[
							{
								text: `Sadly, ${devling.name} did not improve their skills this time.`,
								speaker: '',
								color: '#1f451c',
								x: 365,
								y: 20,
							},
						],
						null,
						365,
						20
					);
				}
			});
			delay += 2750;
		});
	}
}
