import { Component } from 'react';
import Render from './render';
import { user } from 'services/api/user';

class CenterRect {
  // Without height value it will be a square
  constructor({ x, y, width, height, color }) {
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
  }

  draw(ctx, pf) {
    const pixW = pf.width * this.width;
    const pixH = this.height ? pf.height * this.height : pixW;
    const pixX = pf.width * this.x - pixW / 2;
    const pixY = pf.height * this.y - pixH / 2;
    ctx.fillStyle =
      'rgb(' +
      this.color[0] +
      ', ' +
      this.color[1] +
      ', ' +
      this.color[2] +
      ')';
    ctx.fillRect(pixX, pixY, pixW, pixH);
  }
  intersectRect(r1, r2) {
    return !(
      r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top
    );
  }
  right() {
    return this.x + this.width;
  }
  bottom() {
    return this.y + this.height;
  }
  static testOverlap(r1, r2) {
    return !(
      r2.x > r1.right() ||
      r2.right() < r1.x ||
      r2.y > r1.bottom() ||
      r2.bottom() < r1.y
    );
  }
}

class Ball {
  constructor(x, y, speedX, speedY, color) {
    this.rect = new CenterRect({ x, y, width: 0.05, color });
    this.speedX = speedX;
    this.speedY = speedY;
  }
  update(pf) {
    this.lastX = this.rect.x;
    this.lastY = this.rect.y;

    this.rect.x += this.speedX;
    this.rect.y += this.speedY;
    if (this.rect.x < 0 || this.rect.x >= 1.0) {
      this.rect.x -= this.speedX;
      this.speedX = -this.speedX;
    }
    if (this.rect.y < 0 || this.rect.y >= 1.0) {
      this.rect.y -= this.speedY;
      this.speedY = -this.speedY;
    }
  }

  onCollisionWithPlayer(playerRect) {
    //this.rect.x = this.lastX;
  }

  draw(ctx, pf) {
    this.rect.draw(ctx, pf);
  }
}

class Player {
  constructor(x, y, color) {
    this.rect = new CenterRect({ x, y, width: 0.03, height: 0.25, color });
  }

  moveY(relY) {
    this.rect.y += relY;
    if (this.rect.y < 0) this.rect.y = 0;
    else if (this.rect.y > 1.0) this.rect.y = 1.0;
  }

  update(pf) {}

  draw(ctx, pf) {
    this.rect.draw(ctx, pf);
  }
}

class Game {
  constructor() {
    this.keys = {};
    this.resetGame();
  }

  keyDown(key) {
    console.log('down: ' + key);
    this.keys[key] = true;
  }
  keyUp(key) {
    console.log('up: ' + key);
    this.keys[key] = false;
  }

  resetGame() {
    this.player1 = new Player(0.02, 0.5, [50, 120, 200]);
    this.player2 = new Player(0.98, 0.5, [200, 120, 20]);
    this.ball = new Ball(0.5, 0.5, 0.02, 0.01, [150, 150, 120]);

    this.drawables = [];
    this.drawables.push(this.player1);
    this.drawables.push(this.player2);
    this.drawables.push(this.ball);
    this.updatables = [];
    this.updatables.push(this.player1);
    this.updatables.push(this.player2);
    this.updatables.push(this.ball);
  }

  update(pf) {
    if (this.keys['ArrowUp']) {
      this.player1.moveY(-0.03);
    }
    if (this.keys['ArrowDown']) {
      this.player1.moveY(+0.03);
    }
    this.updatables.forEach(updatable => updatable.update(pf));
  }

  draw(pf) {
    const ctx = pf.getContext('2d');
    ctx.fillStyle = 'rgba(70, 70, 70, 255)';
    ctx.fillRect(0, 0, pf.width, pf.height);
    this.drawables.forEach(drawable => drawable.draw(ctx, pf));

    ctx.beginPath();
    ctx.moveTo(this.player1.rect.x * pf.width, this.player1.rect.y * pf.height);
    ctx.lineTo(this.ball.rect.x * pf.width, this.ball.rect.y * pf.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.player2.rect.x * pf.width, this.player2.rect.y * pf.height);
    ctx.lineTo(this.ball.rect.x * pf.width, this.ball.rect.y * pf.height);
    ctx.stroke();
  }
}

class NewMatchContainer extends Component {
  constructor(props) {
    super(props);
    this.game = undefined;
  }

  componentDidMount() {
    const pf = this.refs.playfield;
    this.game = new Game();
    clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(() => {
      this.game.update(pf);
      this.game.draw(pf);
    }, 1000 / 30);

    pf.offsetParent.addEventListener('keydown', e => this.game.keyDown(e.key));
    pf.offsetParent.addEventListener('keyup', e => this.game.keyUp(e.key));
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer);
  }

  render() {
    return Render({ game: this });
  }
}

export default NewMatchContainer;
