import { Vector2, GameSettings } from './gamelib';
import { Player } from './items';
import { GameMap, Tree } from './MapItems';
import { Boundary, Collisions, Line, Point, Rectangle } from './utils';
import { Animation } from './gamelib';
import { PathTree } from './pathTree';

export class NPC extends Animation {
  collecting: boolean;
  colHeight: number;
  boundary: Boundary;
  oldMapPosition: Vector2;

  static DEFAULT_SIZE = 32;
  constructor() {
    super(
      ['players/Player.png', 'players/Player_Actions.png'],
      35,
      32,
      32,
      32,
      32,
      350,
      135,
      60 * GameSettings.scale,
      8
    );
    this.collecting = false;
    this.colHeight = 0;
    this.oldMapPosition = new Vector2(-754, -375);
    // this.boundary = new Boundary({
    //   x: Player.initialPosX - GameMap.offsetX + 11,
    //   y: Player.initialPosY - GameMap.offsetY + 21,
    //   width: 9,
    //   height: 3,
    // });
    this.boundary = new Boundary({
      x: 350 - GameMap.offsetX + 11,
      y: 135 - GameMap.offsetY + 21,
      width: 9,
      height: 3,
    });
  }
  smoothMove = (background: GameMap) => {
    this.mapPosition.set(
      this.mapPosition.x - (this.oldMapPosition.x - background.mapPosition.x),
      this.mapPosition.y - (this.oldMapPosition.y - background.mapPosition.y)
    );
    this.boundary.mapPosition.set(
      this.mapPosition.x - (this.oldMapPosition.x - background.mapPosition.x - 11 * GameSettings.scale),
      this.mapPosition.y - (this.oldMapPosition.y - background.mapPosition.y - 21 * GameSettings.scale)
    );
    this.oldMapPosition.set(background.mapPosition.x, background.mapPosition.y);
  };
  moveTowards(player: Player, background: GameMap, boundaries: Boundary[]) {
    this.smoothMove(background);

    const playerMiddleX = player.boundary.mapPosition.x + player.boundary.width / 2;
    const playerMiddleY = player.boundary.mapPosition.y + player.boundary.height / 2;

    const npcMiddleX = this.boundary.mapPosition.x + this.boundary.width / 2;
    const npcMiddleY = this.boundary.mapPosition.y + this.boundary.height / 2;

    const dx = playerMiddleX - npcMiddleX;
    const dy = playerMiddleY - npcMiddleY;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance < 0 && distance > 400) {
      return;
    }

    const collisionSearchRenge: Rectangle = {
      p1: { x: Math.min(playerMiddleX, npcMiddleX), y: Math.min(playerMiddleY, npcMiddleY) },
      p2: { x: Math.max(playerMiddleX, npcMiddleX), y: Math.max(playerMiddleY, npcMiddleY) },
    };

    const possibleCollisions = Collisions.findInRenge(collisionSearchRenge);

    let pathTree = new PathTree({ x: npcMiddleX, y: npcMiddleY });
    let pToCountionue: Point = { x: npcMiddleX, y: npcMiddleY };

    let pathVector = {
      p1: { x: npcMiddleX, y: npcMiddleY },
      p2: { x: playerMiddleX, y: playerMiddleY },
    };

    Collisions.processCollisions(possibleCollisions, pathVector, {
      width: this.boundary.width,
      height: this.boundary.height,
    });

    const stepX = (dx / distance) * 1;
    const stepY = (dy / distance) * 1;

    let newX = this.mapPosition.x + stepX;
    let newY = this.mapPosition.y + stepY;

    const px = this.boundary.mapPosition.x + stepX * 2;
    const py = this.boundary.mapPosition.y + stepY * 2;

    if (!boundaries.some((b) => b.checkCollision(this, px, py))) {
      this.mapPosition.x = newX;
      this.mapPosition.y = newY;
    }
  }
}
