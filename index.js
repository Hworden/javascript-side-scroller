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
        return new Set(this.keysPressed);
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

class Character {
    constructor(sprite, game) {
        this.xPos = 0;
        this.yPos = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.sprite = sprite;
        this.animationFrame = 0;
        this.game = game;
    }
    draw(renderer) {
        renderer.drawSprite(this.sprite, this.x, this.y);
    }
    step() {
        this.xPos += this.vx;
        this.yPos += this.vy;
        this.vy -= this.game.gravity;
        this.animationFrame += 0.15;
        this.sprite.setFrame(Math.floor(this.animationFrame));
        
        if (this.vy < 0 && this.game.onGround(this)) {
            this.vy = 0;
            this.yPos = 0;
        }
    }

    get vx() {
        return this.velocityX;
    }
     
    get vy() {
        return this.velocityY;
    }

    set vx(vx) {
        this.velocityX = vx;
    }
    set vy(vy) {
        this.velocityY = vy;
    }

    get x() {
        return this.xPos;
    }
    get y() {
        return this.yPos;
    }
}

class Player {
    constructor(keysPressedHandler, character) {
        this.character = character;
        this.keysPressedHandler = keysPressedHandler;
    }
    draw(renderer) {
        this.character.draw(renderer);
    }
    step() {
        const keys = this.keysPressedHandler.getKeysPressed();
        if (keys.has('a')) {
            this.character.vx = -5;
        }
        if (keys.has('d')) {
            this.character.vx = 5;
        }
        if (keys.size == 0) {
            this.character.vx = 0;
        }
        if (keys.has('w')) {
            this.character.vy = 5;
        }

        this.character.step();
    }
    get x() {
        return this.character.x;
    }
    get y() {
        return this.character.y;
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

    onGround(entity) {
        return entity.y <= 0;
    }

    get gravity() {
        return 0.3;
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
    const keyboard = new KeysPressedHandler(['a','s','d','w']);

    const game = new Game();
    const playerWidth = playerHeight = 200;
    const playerSprite = new Sprite(document.getElementById('player'), playerWidth, playerHeight, 9, 0)
    const player = new Player(keyboard, new Character(playerSprite, game));
    game.addEntity(player);

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