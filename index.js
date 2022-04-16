class KeysPressedHandler {
    constructor(keys) {
        this.keysPressed = new Set();
        this.keysToListenFor = new Set(keys);
        window.addEventListener('keydown', (function(e) {
            if (this.keysToListenFor.has(e.key)) {
                this.keysPressed.add(e.key);
            }
        }).bind(this));
        window.addEventListener('keyup', (function(e) {
            if (this.keysToListenFor.has(e.key)) {
                if (this.keysPressed.has(e.key)) {
                    this.keysPressed.delete(e.key);
                }
            }
        }).bind(this));
    }

    getKeysPressed() {
        const keysPressed = this.keysPressed;
        this.keysPressed = new Set();
        return keysPressed;
    }
}

class Sprite {
    constructor(image, frameWidth, frameHeight, numImagesOnRow, row = 0) {
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.image = image;
        this.row = row;
        this.numImagesOnRow = numImagesOnRow;
        this.frameNumber = 0;
    }
    draw(ctx, x, y) {
        const col = this.frameNumber % this.numImagesOnRow;
        ctx.drawImage(this.image, col*this.frameWidth, this.row*this.frameHeight, this.frameWidth, this.frameHeight, x, y, this.frameWidth, this.frameHeight);
    }
    setFrame(frameNumber) {
        this.frameNumber = frameNumber % this.numImagesOnRow;
    }
    get width() {
        return this.frameWidth;
    }
    get height() {
        return this.frameHeight;
    }
}

class Player {
    constructor(sprite) {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.sprite = sprite;
        this.animationFrame = 0;
    }
    draw(renderer) {
        renderer.drawSprite(this.sprite, this.x, this.y);
    }
    step() {
        this.x += 1;
        this.animationFrame += 0.15;
        this.sprite.setFrame(Math.floor(this.animationFrame));
    }
}

class Enemy {

}

class Background {
    
}

class Game {
    constructor() {
        this.entities = new Set();
    }

    step() {
        this.entities.forEach(e => {
            e.step();
        })
    }

    getEntities() {
        return new Set(this.entities);
    }

    addEntity(entity) {
        this.entities.add(entity);
    }

    removeEntity(entity) {
        this.entities.delete(entity);
    }
}

class CanvasGameRenderer {
    constructor(canvas, fps) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.framesPerSecond = fps;
    }

    setHeight(newHeight) {
        this.canvas.height = newHeight;
    }

    setWidth(newWidth) {
        this.canvas.width = newWidth;
    }

    render(game) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        game.getEntities().forEach(entity => {
            entity.draw(this);
        });
    }

    flipY(y) {
        return this.canvas.height - y;
    }

    drawSprite(sprite, x, y) {
        sprite.draw(this.ctx, x, this.flipY(y) - sprite.height);
    }
}

function main() {
    const game = new Game();
    const playerWidth = playerHeight = 200;
    const playerSprite = new Sprite(document.getElementById('player'), playerWidth, playerHeight, 9, 0)
    const player = new Player(playerSprite);
    game.addEntity(player);

    const keyboard = new KeysPressedHandler(['k']);
    
    const fps = 60;
    const renderer = new CanvasGameRenderer(document.getElementById("gameView"));
    renderer.setHeight(500);
    renderer.setWidth(800);

    function animate() {
        renderer.render(game);
        game.step();
        requestAnimationFrame(animate)
    }
    animate();
}
window.addEventListener('load', main);