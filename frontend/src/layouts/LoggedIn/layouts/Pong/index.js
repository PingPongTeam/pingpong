import { Component } from 'react';
import Render from './render';

class Box {
  constructor({ left, right, top, bottom }) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }
  static createCenterAligned(width, height) {
    return new Box({
      left: -width / 2,
      right: width / 2,
      top: -height / 2,
      bottom: height / 2
    });
  }

  width() {
    return this.right - this.left;
  }
  height() {
    return this.bottom - this.top;
  }
  static testOverlap(b1, b2) {
    return !(
      b2.left > b1.right ||
      b2.right < b1.left ||
      b2.top > b1.bottom ||
      b2.bottom < b1.top
    );
  }
}

class GameObject {
  constructor(x, y, collisionBox) {
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    this.collisionBox = collisionBox;
  }

  setPos({ x, y }) {
    if (x || x === 0) {
      this.lastX = this.x;
      this.x = x;
    }
    if (y || y === 0) {
      this.lastY = this.y;
      this.y = y;
    }
  }
  addPos({ x, y }) {
    if (x) {
      this.lastX = this.x;
      this.x += x;
    }
    if (y) {
      this.lastY = this.y;
      this.y += y;
    }
  }
  getPos() {
    return { x: this.x, y: this.y };
  }
  getCollisionBoxPos() {
    const box = this.collisionBox;
    return new Box({
      left: this.x + box.left,
      right: this.x + box.right,
      top: this.y + box.top,
      bottom: this.y + box.bottom
    });
  }

  drawCollisionBox(ctx, pf, fillColor) {
    const box = this.getCollisionBoxPos();
    const pixW = box.width() * pf.pixelRatio;
    const pixH = box.height() * pf.pixelRatio;
    const pixX = box.left * pf.pixelRatio;
    const pixY = box.top * pf.pixelRatio;
    ctx.fillStyle =
      'rgb(' + fillColor[0] + ', ' + fillColor[1] + ', ' + fillColor[2] + ')';
    ctx.fillRect(pixX, pixY, pixW, pixH);
  }

  testCollision(other) {
    return Box.testOverlap(
      this.getCollisionBoxPos(),
      other.getCollisionBoxPos()
    );
  }
}

class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
  }
  invert() {
    this.x = -this.x;
    this.y = -this.y;
  }
  invertX() {
    this.x = -this.x;
  }
  invertY() {
    this.y = -this.y;
  }

  getMagnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  getDirection() {
    return Math.atan2(this.y, this.x);
  }
  getVelocity() {
    return { magnitude: this.getMagnitude(), direction: this.getDirection() };
  }
  setVelocity(magnitude, direction) {
    this.x = Math.cos(direction) * magnitude;
    this.y = Math.sin(direction) * magnitude;
  }
  setMagnitude(magnitude) {
    const direction = this.getDirection();
    this.x = Math.cos(direction) * magnitude;
    this.y = Math.sin(direction) * magnitude;
  }
  setDirection(direction) {
    const magnitude = this.getMagnitude();
    this.x = Math.cos(direction) * magnitude;
    this.y = Math.sin(direction) * magnitude;
  }
}

class Ball extends GameObject {
  constructor(x, y, speed, direction, color) {
    super(x, y, Box.createCenterAligned(0.03, 0.03));
    this.velocity = new Vector2D(0, 0);
    this.velocity.setVelocity(speed, direction);
    this.color = color;
  }
  update(pf) {
    this.addPos({ x: this.velocity.x, y: this.velocity.y });

    if (this.y < 0 || this.y >= pf.height) {
      this.y = this.lastY;
      this.velocity.invertY();
    }
  }

  onCollisionWithPlayer(player) {
    // Get direction from player center to ball center and change ball
    // direction to this.
    this.setPos({ x: this.lastX, y: this.lastY });
    const dir = Math.atan2(this.y - player.y, this.x - player.x);
    this.velocity.setVelocity(this.velocity.getMagnitude() * 1.01, dir);
  }

  draw(ctx, pf) {
    this.drawCollisionBox(ctx, pf, this.color);
  }
}

class Player extends GameObject {
  constructor(x, y, color) {
    super(x, y, Box.createCenterAligned(0.1, 0.25));
    this.color = color;
  }

  moveY(relY) {
    if (!this.blockMovement || this.blockMovement < Date.now()) {
      let newY = this.y + relY;
      if (newY < 0) newY = 0;
      else if (newY > 1.0) newY = 1.0;
      this.setPos({ y: newY });
    }
  }

  update(pf) {}

  onCollision() {
    this.setPos({ x: this.lastX, y: this.lastY });
    this.blockMovement = Date.now() + 500;
  }
  draw(ctx, pf) {
    this.drawCollisionBox(ctx, pf, this.color);
  }
}

class ComputerPlayer extends GameObject {
  constructor(x, y, follow, maxSpeed, color) {
    super(x, y, Box.createCenterAligned(0.1, 0.24));
    this.maxSpeed = maxSpeed;
    this.follow = follow;
    this.color = color;
  }

  update(pf) {
    this.addPos({ y: (this.follow.y - this.y) * this.maxSpeed });
  }

  onCollision() {
    this.setPos({ x: this.lastX, y: this.lastY });
  }

  draw(ctx, pf) {
    this.drawCollisionBox(ctx, pf, this.color);
  }
}

const GameStates = { WaitingInput: 0, Playing: 1 };
class Game {
  constructor(scoreTable) {
    this.keys = {};

    this.gameState = GameStates.WaitingInput;
    this.scoreTable = scoreTable;

    this.ball = new Ball(1.0, 0.5, 0.02, 0, [250, 150, 120]);
    this.player1 = new Player(0.02, 0.5, [50, 120, 200]);
    this.player2 = new ComputerPlayer(1.98, 0.5, this.ball, 0.2, [40, 180, 30]);

    this.players = [];
    this.players.push(this.player1);
    this.players.push(this.player2);

    this.gameNumber = 0;
    this.gameObjects = [];
    this.gameObjects.push(this.player1);
    this.gameObjects.push(this.player2);
    this.gameObjects.push(this.ball);

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
    this.ball.setPos({ x: 1.0, y: 0.5 });
    this.ball.velocity.set(0, 0);
    this.player1.setPos({ y: 0.5 });
    this.player2.setPos({ y: 0.5 });
  }

  update(pf) {
    if (this.keys['ArrowUp']) {
      this.player1.moveY(-0.03);
    }
    if (this.keys['ArrowDown']) {
      this.player1.moveY(+0.03);
    }
    this.gameObjects.forEach(obj => {
      if (obj.update) obj.update(pf);
    });

    // Test player and ball collision
    this.players.forEach(player => {
      if (player.testCollision(this.ball)) {
        player.onCollision(this.ball);
        this.ball.onCollisionWithPlayer(player);
      }
    });

    if (this.ball.x < 0) {
      // Player 1 lost
      console.log('Player 1 lost');
    } else if (this.ball.x >= pf.width) {
      // Player 2 lost
      console.log('Player 2 lost');
    }
  }

  draw(ctx, pf) {
    ctx.fillStyle = 'rgb(70, 70, 70)';
    ctx.fillRect(0, 0, pf.pixelWidth, pf.pixelHeight);

    this.gameObjects.forEach(obj => {
      if (obj.draw) obj.draw(ctx, pf);
    });

    /*    let tmpV = new Vector2D(
      this.ball.rect.x - this.player1.rect.x,
      this.ball.rect.y - this.player1.rect.y
    );
    tmpV.setMagnitude(2.0);
    ctx.beginPath();
    ctx.moveTo(this.player1.rect.x * pf.width, this.player1.rect.y * pf.height);
    ctx.lineTo(
      (this.player1.rect.x + tmpV.x) * pf.width,
      (this.player1.rect.y + tmpV.y) * pf.height
    );
    ctx.strokeStyle = '#a00000';
    ctx.stroke();
    tmpV = new Vector2D(
      this.ball.rect.x - this.player2.rect.x,
      this.ball.rect.y - this.player2.rect.y
    );
    tmpV.setMagnitude(2.0);
    ctx.beginPath();
    ctx.moveTo(this.player2.rect.x * pf.width, this.player2.rect.y * pf.height);
    ctx.lineTo(
      (this.player2.rect.x + tmpV.x) * pf.width,
      (this.player2.rect.y + tmpV.y) * pf.height
    );
    ctx.strokeStyle = '#00a000';
    ctx.stroke();*/
  }
}

class NewMatchContainer extends Component {
  constructor(props) {
    super(props);
    this.scoreTable = [
      { name: 'Player 1', wonGames: 0, gameScore: 0 },
      { name: 'Player 2', wonGames: 0, gameScore: 0 }
    ];
    this.game = new Game(this.scoreTable);
  }

  componentDidMount() {
    const pfCanvas = this.refs.playfield;

    clearInterval(this.refreshTimer);
    const ctx = pfCanvas.getContext('2d');

    this.refreshTimer = setInterval(() => {
      // Calculate a playfield which is of ratio 1:2
      const pf = {
        width: 2,
        height: 1,
        pixelWidth: pfCanvas.width,
        pixelHeight: pfCanvas.height
      };
      if (pf.pixelWidth <= pf.pixelHeight * 2) {
        pf.pixelHeight = pf.pixelWidth / 2;
      } else {
        pf.pixelWidth = pf.pixelHeight * 2;
      }
      pf.pixelRatio = pf.pixelHeight;
      this.game.update(pf);
      this.game.draw(ctx, pf);
    }, 1000 / 60.0);

    pfCanvas.offsetParent.addEventListener('keydown', e =>
      this.game.keyDown(e.key)
    );
    pfCanvas.offsetParent.addEventListener('keyup', e =>
      this.game.keyUp(e.key)
    );
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer);
  }

  render() {
    return Render({ game: this });
  }
}

export default NewMatchContainer;
