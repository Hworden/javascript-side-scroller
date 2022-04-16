
class Game {
    constructor(canvas) {
        this.canvasCtxt = canvas.getContext('2d');
        this.canvas = canvas;
    }

    setHeight(newHeight) {
        this.canvas.height = newHeight;
    }

    setWidth(newWidth) {
        this.canvas.width = newWidth;
    }
}

function game() {
    // console.log('game started');
    const game = new Game(document.getElementById("gameView"));
    game.setHeight(500);
    game.setWidth(800);
}


window.addEventListener('load', game);
