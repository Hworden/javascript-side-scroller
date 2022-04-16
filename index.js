class KeysPressedHandler {
    constructor(keys) {
        this.keysPressed = new Set();
        this.keysToListenFor = new Set(keys);
        window.addEventListener('keydown', (function(e) {
            if (this.keysToListenFor.has(e.key)) {
                this.keysPressed.add(e.key);
                console.log(this.keysPressed);
            }
        }).bind(this));
        window.addEventListener('keyup', (function(e) {
            if (this.keysToListenFor.has(e.key)) {
                if (this.keysPressed.has(e.key)) {
                    this.keysPressed.delete(e.key);
                    console.log(this.keysPressed);
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

class SpriteMap {
    constructor(image, frameWidth, frameHeight, totalFrames) {
        this.totalFrames = totalFrames;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.image = image;
    }
    draw(ctx, x, y) {
        const framesPerRow = Math.floor(this.image.width / this.frameWidth);
        const row = Math.floor(this.frameNumber/framesPerRow);
        const col = this.frameNumber % framesPerRow;
        ctx.drawImage(this.image, col*this.frameWidth, row*this.frameHeight, this.frameWidth, this.frameHeight, x, y, this.frameWidth, this.frameHeight);
    }
    setFrame(frameNumber) {
        this.frameNumber = frameNumber;
    }
}

class Player {
    constructor(image) {
        this.width = 200;
        this.height = 200;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.sprite = new SpriteMap(image, this.width, this.height, 9);
        this.animationFrame = 0;
    }
    draw(renderer) {
        renderer.drawPlayer(this);
    }
    step() {
        this.x += 1;
        this.animationFrame = (this.animationFrame + 1) % 9;
        this.sprite.setFrame(this.animationFrame)
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

    orientY(y) {
        return this.canvas.height - y;
    }

    drawPlayer(player) {
        player.sprite.draw(this.ctx, player.x, this.orientY(player.y) - player.height);
        // this.ctx.drawImage(player.image, player.x, this.orientY(player.y) - player.height, player.width, player.height);
    }
}

function main() {
    const game = new Game();
    const player = new Player(document.getElementById('player'));
    player.y = 20;
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