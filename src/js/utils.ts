import { Vector2, GameSettings, type MyText, type Sprite } from './gamelib.ts';
import { borders, ItemIDs } from './ItemIDs.ts';
import * as MapItems from './MapItems.ts';
import { BoundaryConstructor, classNames, GameMapConstructor } from './types.ts';
import { type Player } from './items.ts';
import { NPC } from './npc.ts';
import { Path, PathTree } from './pathTree.ts';

// -----------------------------------------------------------------------------
// ОДИН объект колизии

export interface Point {
  x: number;
  y: number;
}

export type Line = { p1: Point; p2: Point };

export type Rectangle = Line;

function isPointInRange(point: Point, range: Rectangle): boolean {
  return point.x >= range.p1.x && point.x <= range.p2.x && point.y >= range.p1.y && point.y <= range.p2.y;
}

export class Boundary {
  mapPosition: Vector2;
  action: number;
  width: number;
  height: number;
  teleport?: number[];
  text?: MyText[];
  helpButton?: Sprite;
  show: Boolean;
  showText: Boolean;
  static width = 16;
  static height = 16;
  constructor({ x, y, action = 1, width, height, teleport, helpButton, text }: BoundaryConstructor) {
    this.mapPosition = new Vector2(x + MapItems.GameMap.offsetX, y + MapItems.GameMap.offsetY);
    this.action = action;
    this.width = width * GameSettings.scale;
    this.height = height * GameSettings.scale;
    this.teleport = teleport;
    this.helpButton = helpButton;
    this.text = text;
    this.show = false;
    this.showText = false;
    if (this.width < 0) {
      this.mapPosition.x += this.width + 16 * GameSettings.scale;
      this.width *= -1;
    }
    if (this.height < 0) {
      this.mapPosition.y += this.height + 16 * GameSettings.scale;
      this.height *= -1;
    }
  }

  moveItem(x: number, y: number) {
    this.mapPosition.set(this.mapPosition.x - x, this.mapPosition.y - y);
    if (!this.helpButton) return;
    this.helpButton.mapPosition.set(this.helpButton.mapPosition.x - x, this.helpButton.mapPosition.y - y);
    this.text![0].mapPosition.set(this.text![0].mapPosition.x - x, this.text![0].mapPosition.y - y);
  }

  showHelp(player: Player, keys: Record<string, boolean>) {
    if (!this.show) return;
    if (keys.KeyE) {
      this.showText = !this.showText;
      keys.KeyE = false;
    }
    // prettier-ignore
    this.showText
    ? this.text![0].draw()
    : this.helpButton?.draw();

    if (!this.checkCollision(player, player.boundary.mapPosition.x, player.boundary.mapPosition.y)) {
      this.show = false;
      this.showText = false;
    }
  }

  collide(player: Player, background: MapItems.GameMap, dx: number, dy: number, collisions: (number | number[])[]) {
    player.action = undefined;
    const px = player.boundary.mapPosition.x + dx * 2;
    const py = player.boundary.mapPosition.y + dy * 2;
    if (!this.checkCollision(player, px, py)) return false;
    if (this.action == 0) {
      this.show = true;
      return false;
    }
    if (this.action !== 1) {
      player.action = this.action;
      this.teleport && Action.execute(background, this.action!, this.teleport, collisions);
    }
    return true;
  }

  checkCollision(player: Player | NPC, px: number, py: number): boolean {
    return (
      px < this.mapPosition.x + this.width &&
      px + player.boundary.width > this.mapPosition.x &&
      py < this.mapPosition.y + this.height &&
      py + player.boundary.height > this.mapPosition.y
    );
  }

  toPoints(inflate: { width: number; height: number } = { width: 0, height: 0 }): [Point, Point, Point, Point] {
    return [
      { x: this.mapPosition.x - inflate.width / 2, y: this.mapPosition.y - inflate.height / 2 },
      { x: this.mapPosition.x - inflate.width / 2, y: this.mapPosition.y + this.height + inflate.height / 2 },
      { x: this.mapPosition.x + this.width + inflate.width / 2, y: this.mapPosition.y - inflate.height / 2 },
      {
        x: this.mapPosition.x + this.width + inflate.width / 2,
        y: this.mapPosition.y + this.height + inflate.height / 2,
      },
    ];
  }

  inflate(x: number, y: number): Rectangle {
    return {
      p1: {
        x: this.mapPosition.x - x / 2,
        y: this.mapPosition.y - y / 2,
      },
      p2: {
        x: this.mapPosition.x + this.width + x / 2,
        y: this.mapPosition.y + this.height + y / 2,
      },
    };
  }

  static vectorsToEachVertice(startingPoint: Point, rec: Rectangle): [Line, Line, Line, Line] {
    return [
      { p1: startingPoint, p2: rec.p1 },
      { p1: startingPoint, p2: rec.p2 },
      { p1: startingPoint, p2: { x: rec.p1.x, y: rec.p2.y } },
      { p1: startingPoint, p2: { x: rec.p2.x, y: rec.p1.y } },
    ];
  }

  static rectToLines(rect: Rectangle): [Line, Line, Line, Line] {
    return [
      { p1: rect.p1, p2: { x: rect.p1.x, y: rect.p2.y } },
      { p1: rect.p1, p2: { x: rect.p2.x, y: rect.p1.y } },
      { p1: rect.p2, p2: { x: rect.p1.x, y: rect.p2.y } },
      { p1: rect.p2, p2: { x: rect.p2.x, y: rect.p1.y } },
    ];
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.height) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(this.mapPosition.x, this.mapPosition.y, this.width, this.height);
    } else if (!this.height && this.width) {
      ctx.beginPath();
      ctx.arc(this.mapPosition.x + this.width / 2, this.mapPosition.y + this.width / 2, this.width / 2, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}

// -----------------------------------------------------------------------------
// Класс для создания и управления коллизиями карты
export class Collisions {
  static boundaries: Boundary[] = [];
  static items: any[] = [];
  static action0: Boundary[] = [];
  static width = 120;
  static height = 68;

  static createBoundary(row: number, col: number, cell: number | number[]): Boundary {
    const width = typeof cell === 'object' ? cell[1] * 16 : 16;
    const height = typeof cell === 'object' ? cell[2] * 16 : 16;

    return new Boundary({
      x: row * Boundary.width,
      y: col * Boundary.height,
      action: typeof cell === 'object' ? cell[0] : cell,
      width: width,
      height: height,
    });
  }

  static col(collisions: (number | number[])[]) {
    Collisions.items = [];
    Collisions.boundaries = Object.entries(collisions).reduce((acc: Boundary[], [key, cell], index) => {
      const row = index % Collisions.width;
      const col = Math.floor(index / Collisions.width);

      const newBoundaries = Action.processObject(row, col, cell);
      acc.push(...newBoundaries);

      return acc;
    }, []);
  }

  static getLineIntersection(line1: Line, line2: Line): Point | null {
    const { p1: A, p2: B } = line1;
    const { p1: C, p2: D } = line2;

    const det = (B.x - A.x) * (D.y - C.y) - (B.y - A.y) * (D.x - C.x);

    if (det === 0) {
      return null; // Lines are parallel or coincident
    }

    const t = ((C.x - A.x) * (D.y - C.y) - (C.y - A.y) * (D.x - C.x)) / det;
    const u = ((C.x - A.x) * (B.y - A.y) - (C.y - A.y) * (B.x - A.x)) / det;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: A.x + t * (B.x - A.x),
        y: A.y + t * (B.y - A.y),
      };
    }

    return null; // Intersection is outside the segments
  }

  static findInRenge(range: Rectangle) {
    return Collisions.boundaries.filter((b) => {
      const points = b.toPoints();
      return (
        isPointInRange(points[0], range) ||
        isPointInRange(points[1], range) ||
        isPointInRange(points[2], range) ||
        isPointInRange(points[3], range)
      );
    });
  }

  static findCollisionsOnVector(
    b: Boundary[],
    pathVector: Line,
    inflate: { width: number; height: number }
  ): { b: Boundary; line: Line; p: Point; len: number }[] | null {
    let collisions: { b: Boundary; line: Line; p: Point; len: number }[] = [];
    for (const collision of b) {
      const collisionLines = Boundary.rectToLines(collision.inflate(inflate.width, inflate.height));

      collisionLines.forEach((line) => {
        const collIntPoint = Collisions.getLineIntersection(line, pathVector);
        if (collIntPoint) {
          collisions.push({
            b: collision,
            line: pathVector,
            p: collIntPoint,
            len: Vector2.getLength(collIntPoint.x - pathVector.p1.x, collIntPoint.y - pathVector.p1.x),
          });
        }
      });
    }
    return collisions ? collisions : null;
  }

  static findNearestCollisionOnVector(
    b: Boundary[],
    pathVector: Line,
    inflate: { width: number; height: number }
  ): { b: Boundary; line: Line; p: Point; len: number } | null {
    // searching for closed collisions
    let closedCollision: { b: Boundary; line: Line; p: Point; len: number } | null = null;
    for (const collision of b) {
      const collisionLines = Boundary.rectToLines(collision.inflate(inflate.width, inflate.height));

      collisionLines.forEach((line) => {
        const collIntPoint = Collisions.getLineIntersection(line, pathVector);
        if (collIntPoint) {
          const coll = {
            b: collision,
            line: pathVector,
            p: collIntPoint,
            len: Vector2.getLength(collIntPoint.x - pathVector.p1.x, collIntPoint.y - pathVector.p1.x),
          };

          if (!closedCollision || coll.len < closedCollision.len) {
            closedCollision = coll;
          }
        }
      });
    }
    return closedCollision ? closedCollision : null;
  }

  static tryToGoByRibs(
    startingPoints: Point[],
    destinantion: Point,
    b: Boundary[],
    collidedObj: Boundary,
    inflate: { width: number; height: number }
  ): { path: Path[]; ribCollidedWith: Boundary[] } {
    const verti = collidedObj.toPoints(inflate);
    let collidedByTheWayToVertis: Boundary[] = [];
    let path: Path[] = [];

    for (const startinP of startingPoints) {
      let processedPoints: Point[] = [startinP];
      let currentPoints: Point[] = [startinP];
      // checking is clear path
      let collisionsToFinish = Collisions.findCollisionsOnVector(b, { p1: startinP, p2: destinantion }, inflate);

      if (collisionsToFinish?.length === 2) {
        path.push({ p: destinantion, complit: true, next: null });
        continue;
      }

      let localPathTree: PathTree = new PathTree(
        startinP,
        Collisions.findCollisionsOnVector([collidedObj], { p1: startinP, p2: destinantion }, inflate)?.length === 2
      );
      while (true) {
        // let
        currentPoints = currentPoints.flatMap((currentP) => {
          let nextVertisToGo = verti.filter((currentVerti) => {
            // skip if point is already processed
            for (const el of processedPoints) if (PathTree.isEqual(el, currentVerti)) return false;

            if (!(currentVerti.x === currentP.x || currentVerti.y === currentP.y)) return false;

            let localRibColl = Collisions.findCollisionsOnVector(b, { p1: currentP, p2: currentVerti }, inflate);

            if (!localRibColl) {
              throw new Error('Unexpected');
            }

            if (localRibColl.length === 2) {
              // collided only with one lines
              let pathFromPoint = localPathTree.findFirstBy({ p: currentP });
              if (pathFromPoint?.next === null) return false;

              if (!pathFromPoint?.next) {
                throw new Error('Unexpected');
              }

              let collisionsOnTheWay = Collisions.findCollisionsOnVector(
                b,
                { p1: currentVerti, p2: destinantion },
                inflate
              );
              let selfCollisions = Collisions.findCollisionsOnVector(
                [collidedObj],
                { p1: currentVerti, p2: destinantion },
                inflate
              );

              pathFromPoint.next.push({
                p: currentVerti,
                complit: selfCollisions ? selfCollisions.length === 2 : false,
                next: collisionsOnTheWay && collisionsOnTheWay.length <= 2 ? null : [],
              });
              return true;
            } else if (localRibColl.length > 2) {
              // Take nearest collision on the rib
              localRibColl.sort((a, b) => a.len - b.len);
              collidedByTheWayToVertis.push(localRibColl[1].b);
              return false;
            } else {
              throw new Error('Unexpected');
            }
          });

          return nextVertisToGo;
        });

        if (currentPoints.length === 0) break;

        processedPoints = processedPoints.concat(currentPoints);
      }
      path.push(localPathTree.tree);
    }
    return { path, ribCollidedWith: collidedByTheWayToVertis };
  }

  static processCollisions(b: Boundary[], pathVector: Line, inflate: { width: number; height: number }): Path[] {
    let nearestCollision = Collisions.findNearestCollisionOnVector(b, pathVector, inflate);

    // No collisions on the way
    if (!nearestCollision) return [{ p: pathVector.p2, next: null, complit: true }];

    let pathFromThisPoint: Path[] = [];
    let boundariesOnTheWayToVerti: Boundary[] = [];

    do {
      if (boundariesOnTheWayToVerti.length) {
        nearestCollision.b = boundariesOnTheWayToVerti.shift() as Boundary;
      }

      //
      let linesToEachVerticeOfCollision = Boundary.vectorsToEachVertice(
        pathVector.p1,
        nearestCollision.b.inflate(inflate.width, inflate.height)
      );

      let verticiesPossibleToReach: Point[] = [];
      for (let line of linesToEachVerticeOfCollision) {
        // Ошыбка точка может начинатся из угла обекта
        let nearestColToVerti = Collisions.findNearestCollisionOnVector(b, line, inflate);

        // I NEEED TO UNDERSTAND WHY THIS IS COMING TO TRUE SOMETIMES
        if (!nearestColToVerti) continue;

        if (nearestColToVerti && PathTree.isEqual(nearestColToVerti.p, line.p2)) {
          verticiesPossibleToReach.push(line.p2);
        } else if (!PathTree.isEqual(nearestColToVerti.b.mapPosition, nearestCollision.b.mapPosition)) {
          boundariesOnTheWayToVerti.push(nearestColToVerti.b);
        }
      }

      let pathByRibs = Collisions.tryToGoByRibs(
        verticiesPossibleToReach,
        pathVector.p2,
        b,
        nearestCollision.b,
        inflate
      );

      pathFromThisPoint = pathFromThisPoint.concat(pathByRibs.path);

      boundariesOnTheWayToVerti = boundariesOnTheWayToVerti.concat(pathByRibs.ribCollidedWith);
    } while (boundariesOnTheWayToVerti.length !== 0);

    return pathFromThisPoint;
  }
}

export class Action {
  static teleport?: number[];
  static handlers: { [key: number]: (GameMap: any, collisions: (number | number[])[]) => void } = {
    2: (collisions) => {
      Collisions.col(collisions);
    },
    3: (collisions) => {
      Collisions.col(collisions);
    },
    4: (collisions) => {
      Collisions.col(collisions);
    },
    5: (collisions) => {
      Collisions.col(collisions);
    },
  };

  static move(player: Player, background: MapItems.GameMap, npc: NPC, dx: number, dy: number, speed: number) {
    const smooth = 2;
    speed /= smooth;
    background.smoothMove(player, dx, dy, speed);
    player.smoothMove(background, dx, dy, speed, smooth);
    // npc.smoothMove(background);
  }

  static execute(background: MapItems.GameMap, action: number, t: number[], collisions: (number | number[])[]) {
    const mapConstructor = background.constructor as unknown as GameMapConstructor;
    background.image.src = mapConstructor.MAPS[action - 2] || background.image.src;
    this.handlers[action]?.(mapConstructor, collisions);

    const deviationX = mapConstructor.offsetX * GameSettings.scale;
    const deviationY = mapConstructor.offsetY * GameSettings.scale;

    t[0] = GameSettings.windowWidth / 2 - t[0] * GameSettings.scale;
    t[1] = GameSettings.windowHeight / 2 - t[1] * GameSettings.scale;

    background.mapPosition.set(t[0], t[1]);
    for (const i of [...Collisions.items, ...Collisions.boundaries]) {
      i.mapPosition.x += t[0] - deviationX;
      i.mapPosition.y += t[1] - deviationY;
    }
  }

  static createItemBoundary(
    className: Exclude<keyof typeof MapItems, 'Home' | 'GameMap' | 'MapItem'>,
    row: number,
    col: number,
    isAnimated?: boolean
  ) {
    const ItemClass = MapItems[className];
    const item = new ItemClass(row, col);
    isAnimated && item.updateFrame();
    Collisions.items.push(item);
    item.boundaries.map((i) => i.action == 0 && Collisions.action0.push(i));
    return item.boundaries;
  }

  static processObject(row: number, col: number, cell: number | number[]) {
    if (Array.isArray(cell) && cell.length) {
      const [id, ...params] = cell;

      if (id === 2472) {
        const home = new MapItems.Home(row, col, params[0], params[1], params[2]);
        Collisions.items.push(home);
        Action.teleport = home.boundaries[0].teleport;
        return home.boundaries;
      }

      if (ItemIDs.hasOwnProperty(id)) {
        const [className, flag] = ItemIDs[id as keyof typeof ItemIDs];
        return this.createItemBoundary(className as classNames, row, col, flag);
      }

      if (borders.hasOwnProperty(id)) {
        return borders[id](row, col);
      }
    }

    return cell !== 0 ? [Collisions.createBoundary(row, col, cell)] : [];
  }
}
