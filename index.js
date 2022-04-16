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
        const col = this.frameNumber;
        ctx.drawImage(this.image, col*this.frameWidth, 
            this.row*this.frameHeight, this.frameWidth,
             this.frameHeight, x, y, this.frameWidth, this.frameHeight);
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
    constructor(walkingSprite, jumpingSprite, game) {
        this.xPos = 0;
        this.yPos = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.walkingSprite = walkingSprite;
        this.jumpingSprite = jumpingSprite;

        this.jumpingAnimationFrame = 0;

        this.animationFrame = 0;
        this.game = game;
        this.isJumping = false;
    }
    draw(renderer) {
        let sprite;
        if(this.isJumping) {
            sprite = this.jumpingSprite;
        }
        else {
            sprite = this.walkingSprite;
        }
        renderer.drawSprite(sprite, this.x, this.y);
    }
    step() {
        this.xPos += this.vx;
        this.yPos += this.vy;
        this.vy -= this.game.gravity;
        if (this.isJumping) {
            this.jumpingAnimationFrame += 0.3;
            this.jumpingSprite.setFrame(Math.floor(this.jumpingAnimationFrame));
        }
        if (!this.isJumping) {
            this.animationFrame += 0.3;
            this.walkingSprite.setFrame(Math.floor(this.animationFrame));
        }
        if (this.vy < 0 && this.game.onGround(this)) {
            this.vy = 0;
            this.yPos = 0;
            this.isJumping = false;
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

    jump() {
        if (!this.isJumping) {
            this.vy = 20;
            this.isJumping = true;
            this.jumpingAnimationFrame = 0;
        }
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
            this.character.jump();
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
    constructor(image, width, height) {
        this.image = image;
        this.xPos = 0;
        this.yPos = 0;
        this.width = width;
        this.height = height;
    }
    step() {
        this.xPos += 12;
        if (this.xPos >= this.image.width ) {
            this.xPos = 0;
        }
    }
    draw(renderer) {
        renderer.drawImage(this.image, this.xPos, this.yPos, this.width, this.height);
        if (this.xPos + this.width >= this.image.width) {
            const remainder = this.xPos + this.width - this.image.width;
            const remMultiplier = remainder / this.width
            const canvasRemainder = renderer.width * remMultiplier;
            renderer.ctx.drawImage(this.image, 0 , this.yPos, remainder, this.height, Math.round(renderer.width - canvasRemainder), 0, canvasRemainder, renderer.height);
        }
    }
}

class Game {
    constructor() {
        this.entities = new Set();
        this.backgrounds = new Set();
    }

    step() {
        this.backgrounds.forEach(b => {
            b.step();
        });
        this.entities.forEach(e => {
            e.step();
        })
    }

    getEntities() {
        return new Set(this.entities);
    }

    getBackgrounds() {
        return new Set(this.backgrounds);
    }

    addBackground(background) {
        this.backgrounds.add(background);
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
        return 1.5;
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
        game.getBackgrounds().forEach(background => {
            background.draw(this);
        });
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

    drawImage(image, x, y, width, height, dx = 0, dy = 0) {
        this.ctx.drawImage(image, x, y, width, height, dx, dy, this.canvas.width, this.canvas.height);
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }
}

function main() {

    const keyboard = new KeysPressedHandler(['a','s','d','w']);

    const game = new Game();
    const playerWidth = playerHeight = 200;

    const playerWalkingSprite = new Sprite(document.getElementById('player'), playerWidth, playerHeight, 9, 0);
    const playerJumpingSprite = new Sprite(document.getElementById('player'), playerWidth, playerHeight, 7, 1);

    const player = new Player(keyboard,
         new Character(playerWalkingSprite, playerJumpingSprite, game));
    
    game.addEntity(player);

    const background = new Background(document.getElementById('background'), 1152, 720);

    game.addBackground(background);

    const fps = 60;
    const renderer = new CanvasGameRenderer(document.getElementById("gameView"));
    renderer.setWidth(800);
    renderer.setHeight(500);

    function animate() {
        renderer.render(game);
        game.step();
        requestAnimationFrame(animate)
    }
    animate();
}
window.addEventListener('load', main);