import Phaser from 'phaser-ce'
import config from '../config'
import {shuffle, bestSquare} from '../utils';
export default class extends Phaser.State {
    init() {
        this.level = 1;
        this.tiles = [];
        this.selectedTiles = [];
        this.time = config.time;
    }

    preload() {}

    create() {

        this.background = game.add.tileSprite(0, 0, config.width, config.height, "background");

        this.placeTiles();

        this.scoreText = game.add.text(game.width - 25, 50, this.game.score, {
            font: "50px Arial",
            fill: "#ffffff",
            align: "right"
        });
        this.scoreText.anchor.set(1, 0.5);

        this.timeText = game.add.text(30, game.height - 5, this.game.score, {
            font: "50px Arial",
            fill: "#ffffff",
            align: "center"
        });
        this.timeText.anchor.set(0, 1);

        game.time.events.loop(Phaser.Timer.SECOND, this.decreaseTime, this);
    }

    render() {}

    update() {

        this.background.tilePosition.x += 0.2;
        this.background.tilePosition.y += 0.3;

        this.scoreText.text = this.game.score;
        this.timeText.text = this.time;
    }

    decreaseTime() {
        this.time--;

        if(this.time === 0) {
            this.resetLevel(1);
            game.state.start("GameOver");
        }
    }

    resetLevel(level) {
        this.tiles.map(function(tile) {
            tile.destroy();
        });

        this.tiles = [];
        this.selectedTiles = [];

        this.level = level;

        this.placeTiles();
    }

    placeTiles() {

        this.background.frame = Math.floor(Math.random() * 16 + 1);


        const size = config.size * config.scale;
        const [cols, rows] = bestSquare(this.level * 2);

        const leftSpace = (game.width - cols * size - (cols - 1) * config.spacing) / 2 + size / 2;
        const topSpace = (game.height - rows * size - (rows - 1) * config.spacing) / 2 + size / 2;

        let frames = config.playerFrames.slice(0, this.level);
        frames = frames.concat(frames);

        shuffle(frames);

        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                let tile = game.add.button(leftSpace + i * (size + config.spacing), topSpace + j * (size + config.spacing), "tiles", this.showTile, this);
                tile.anchor.setTo(0.5);
                tile.smoothed = false;
                tile.scale.x = config.scale;
                tile.scale.y = config.scale;
                tile.value = frames[j * cols + i];

                this.tiles.push(tile);
            }
        }
    }

    showTile(target) {
        if(this.selectedTiles.length < 2 && this.selectedTiles.indexOf(target) === -1) {
            target.frame = target.value;
            this.selectedTiles.push(target);

            if(this.selectedTiles.length === 2) {
                game.time.events.add(Phaser.Timer.SECOND / 4, this.checkTiles, this);
            }
        }
    }

    checkTiles(target) {
        if(this.selectedTiles[0].value === this.selectedTiles[1].value) {
            this.selectedTiles[0].destroy();
            this.selectedTiles[1].destroy();

            if(this.tileLeft() === 0) {
                this.addTime(5);
                this.addScore(this.level);
                this.resetLevel(this.level + 1);
            } else {
                this.addTime(2);
                this.addScore(1);
            }

        } else {
            this.selectedTiles[0].frame = config.hiddenFrame;
            this.selectedTiles[1].frame = config.hiddenFrame;
        }
        this.selectedTiles = [];
    }

    tileLeft() {
        return this.tiles.filter(function(tile) {
            return tile.alive;
        }).length;
    }

    addTime(number) {
        this.time += number;

        let text = game.add.text(70, game.height - 5, this.text, {
            font: "50px Arial",
            fill: (number) > 0 ? "#09c416" : "#f22121",
            align: "center"
        });
        text.anchor.set(0, 1);
        text.angle = -5;

        text.text = (number > 0 ) ? "+"+number : number;

        let tween = game.add.tween(text).to({alpha: 0, y: game.height - 25}, Phaser.Timer.SECOND, "Linear").start();
        tween.onComplete.add(function() {text.destroy()});
    }

    addScore(number) {
        this.game.score += number;

        if(this.scoreText.animation)
            this.scoreText.animation.stop();
        this.scoreText.scale.x = 1;
        this.scoreText.scale.y = 1;

        this.scoreText.animation = game.add.tween(this.scoreText.scale).to({x: 1.3, y: 1.3}, 50, Phaser.Easing.Bounce.InOut, true, 0, 0, true)
    }

}