import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
var requestAnimationFrame = window.requestAnimationFrame ||
                            //window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame;
                            // window.msRequestAnimationFrame;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements AfterViewInit {
  @HostListener('document:keydown.enter', ['$event']) onEnterHandler(event: KeyboardEvent) {
      this.onEnter();
  }
  @HostListener('document:keydown.space', ['$event']) onSpaceHandler(event: KeyboardEvent) {
      this.onSpace();
  }
  @HostListener('document:keyup.enter', ['$event']) onEnterBreakHandler(event: KeyboardEvent) {
      this.onEnter(true);
  }
  @HostListener('document:keyup.arrowleft', ['$event']) onLeftArrowUpHandler(event: KeyboardEvent) {
      this.onArrowLeft(true);
  }
  @HostListener('document:keydown.arrowleft', ['$event']) onLeftArrowHandler(event: KeyboardEvent) {
      this.onArrowLeft();
  }
  @HostListener('document:keyup.arrowup', ['$event']) onUpArrowUpHandler(event: KeyboardEvent) {
      this.onArrowLeft(true);
  }
  @HostListener('document:keydown.arrowup', ['$event']) onUpArrowHandler(event: KeyboardEvent) {
      this.onArrowLeft(false, true);
  }
  @HostListener('document:keyup.arrowright', ['$event']) onRightArrowUpHandler(event: KeyboardEvent) {
      this.onArrowRight(true);
  }
  @HostListener('document:keyup.arrowdown', ['$event']) onDownArrowUpHandler(event: KeyboardEvent) {
      this.onArrowRight(true);
  }
  @HostListener('document:keydown.arrowright', ['$event']) onRightArrowHandler(event: KeyboardEvent) {
      this.onArrowRight();
  }
  @HostListener('document:keydown.arrowdown', ['$event']) onDownArrowHandler(event: KeyboardEvent) {
      this.onArrowRight(false, true);
  }
  @ViewChild('canvas') canvas : ElementRef;
  public context: CanvasRenderingContext2D;
  lost: boolean = false;
  roads: Road[] = [];
  grass: GrassPatch[] = [];
  cars: Car[] = [];
  score = 0;
  started = false;
  scores = [];
  nickname = "";
  scoresData : Observable<any[]>;
  newCarInterval: any;

  constructor(private db: AngularFirestore) {
    db.collection('scores').valueChanges().subscribe(data => {
      data.sort((a: any, b: any) => b.score - a.score).splice(5);
      this.scores = data;
    });
  }

  ngAfterViewInit(): void {
    this.context = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
    this.canvas.nativeElement.width = window.innerWidth;
    this.canvas.nativeElement.height = window.innerHeight * 0.9;
    this.startGame();
  }

  initGame() {
    this.started = true;
  }

  startGame() {
    this.cars = [];
    this.grass = [];
    this.roads = [];
    this.grass.push(new GrassPatch(0, this.context, this.canvas.nativeElement));
    this.grass.push(new GrassPatch(3.8, this.context, this.canvas.nativeElement, true));
    this.roads.push(new Road(3, this.context, this.canvas.nativeElement, false, false));
    this.roads.push(new Road(2, this.context, this.canvas.nativeElement, true, true));
    this.cars.push(new Car('https://res.cloudinary.com/aurodim/image/upload/a_270/v1559146140/orange_oqmnj6.png', this.canvas.nativeElement.width/2 - 40, this.canvas.nativeElement.height - 40, this.context, this.canvas.nativeElement, true));
    this.cars.push(new Car('https://res.cloudinary.com/aurodim/image/upload/a_90/v1559146160/red-car-top-view-md_y2cww7.png', this.canvas.nativeElement.width/2 - 40, 0, this.context, this.canvas.nativeElement));
    this.newCarInterval = setInterval(() => {
      if (this.started && !this.lost) {
        this.cars.push(new Car('https://res.cloudinary.com/aurodim/image/upload/a_90/v1559146160/red-car-top-view-md_y2cww7.png', (this.canvas.nativeElement.width/3) + (Math.random() * ((this.canvas.nativeElement.width/2) - (this.canvas.nativeElement.width/6) - (this.canvas.nativeElement.width/7))), 0, this.context, this.canvas.nativeElement));
      }
    }, 4000);
    this.draw();
  }

  onRestart() {
    this.score = 0;
    this.lost = false;
    this.startGame();
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.grass.forEach((grass: any) => {
      grass.draw();
    });
    this.roads.forEach((road: any) => {
      road.draw();
    });
    if (this.started) {
      this.cars.forEach((car: Car) => {
        car.draw();
        if (!car.isMain()) {
          car.accelarate();
        }
      });
      this.score += this.cars[0].getSpeed();
      for (let i = 0; i < this.cars.length; i++) {
        for (let c = 0; c < this.cars.length; c++) {
          if (c == i) continue;
          if (this.cars[i].isWithin(this.cars[c])) {
            if (c == 0 || i == 0) {
              setTimeout(() => {
                this.lost = true;
              }, 10);
            } else {
              this.cars.splice(c, 1);
            }
          }
        }
      }
    }

    if (!this.lost) {
      requestAnimationFrame(this.draw.bind(this));
    } else {
      if (this.score != 0) {
        this.db.collection('scores').add({score: this.score, nickname: this.nickname});
      }
      for (let i = 0; i < this.scores.length; i++) {
        if (this.score > this.scores[i].score) {
          this.scores.splice(i, 0, {score: this.score, nickname: this.nickname});
          break;
        }
      }
      if (this.scores.length < 1) {
        this.scores.push({score: this.score, nickname: this.nickname});
      }
      this.scores.splice(5);
      clearInterval(this.newCarInterval);
      this.newCarInterval = null;
    }
  }

  onEnter(breakOn = false) {
    if (this.lost) {
      this.onRestart();
    }
    if (breakOn) {
      this.cars[0].break();
      return;
    }
    this.cars[0].accelarate();
  }

  onSpace() {
    this.cars[0].break(true);
  }

  onArrowLeft(stop = false, hard = false) {
    if (stop) {
      this.cars[0].stopTurn();
      return;
    }
    this.cars[0].turnLeft(hard);
  }

  onArrowRight(stop = false, hard = false) {
    if (stop) {
      this.cars[0].stopTurn();
      return;
    }
    this.cars[0].turnRight(hard);
  }
}

class GrassPatch {
  constructor(private x: number, private context: CanvasRenderingContext2D, private canvas, private last = false) {}

  draw() {
    this.context.beginPath();
    this.context.fillStyle = "#46a41f";
    this.context.strokeStyle = "#46a41f";
    this.context.rect((this.canvas.width/6) * this.x, 0, this.canvas.width/2.8 - (this.last ? -52.5 : 52.5), this.canvas.height);
    this.context.stroke();
    this.context.fill();
  }
}

class Road {
  constructor(private x: number, private context: CanvasRenderingContext2D, private canvas, private first = false, private continued = false) {}

  draw() {
    let suf = this.first ? 0 : (this.canvas.width/6) - (this.canvas.width/7) + 0;
    if (this.first) {
      this.context.lineWidth = 1;
      this.context.beginPath();
      this.context.strokeStyle = "#fad201";
      this.context.rect((this.canvas.width/6) * this.x - 20 - suf, 0, 20, this.canvas.height);
      this.context.stroke();
      this.context.fillStyle = "#fad201";
      this.context.fill();
    }

    if (!this.continued) {
      this.context.lineWidth = 1;
      this.context.beginPath();
      this.context.strokeStyle = "#fad201";
      this.context.rect((this.canvas.width/6) * this.x + 206 - suf, 0, 20, this.canvas.height);
      this.context.stroke();
      this.context.fillStyle = "#fad201";
      this.context.fill();
    }
    this.context.lineWidth = 1;
    this.context.beginPath();
    this.context.strokeStyle = "#2f2f2f";
    this.context.rect((this.canvas.width/6) * this.x - suf, 0, this.canvas.width/7, this.canvas.height);
    this.context.stroke();
    this.context.fillStyle = "#2f2f2f";
    this.context.fill();
    this.context.beginPath();
    this.context.setLineDash([50, 40]);/*dashes are 5px and spaces are 3px*/
    this.context.lineWidth = 4;
    this.context.strokeStyle = "#fff";
    this.context.moveTo((this.canvas.width/6) * this.x + 100 - suf, this.canvas.height);
    this.context.lineTo((this.canvas.width/6) * this.x + 100 - suf, 0);
    this.context.stroke();
    if (this.continued) {
      this.context.moveTo((this.canvas.width/6) * this.x + 205, this.canvas.height);
      this.context.lineTo((this.canvas.width/6) * this.x + 205, 0);
      this.context.stroke();
    }
    this.context.setLineDash([]);
  }
}


class Car {
  img;
  driving = false;
  speed = 0;
  boundaries = {
    left: null,
    right: null,
    top: null,
    bottom: null
  };
  accelerateInterval: any;
  breakInterval: any;
  breakForce = 1;
  leftInterval: any;
  rightInterval: any;

  constructor(private type: string, private x: number, private y: number, private context: CanvasRenderingContext2D, private canvas: any, private main: boolean = false) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.context = context;
    this.canvas = canvas;
    this.main = main;
    this.img = new Image();
    this.img.onload = () => {
      this.draw();
    }
    this.img.src = this.type;
  }

  accelarate() {
    this.y += this.speed;
    if (this.breakInterval) clearInterval(this.breakInterval);
    this.breakInterval = null;
    if (this.accelerateInterval) return;
    this.accelerateInterval = setInterval(() => {
      this.y += this.speed;
      if (!this.main && this.y > this.canvas.height + 10) {
        this.y = -140;
      }
      if (this.y < -145 && this.main) {
        this.y = this.canvas.height;
      }
      if (this.speed > 0.1) return;
      this.driving = true;
      this.speed += this.main ? -0.01 : 0.7;
    }, 10);
  }

  break(hard = false) {
    let force = hard ? 20 : 0.01;
    clearInterval(this.accelerateInterval);
    this.accelerateInterval = null;
    if (this.breakInterval) return;
    this.breakInterval = setInterval(() => {
      if (this.y < -145 && this.main) {
        this.y = this.canvas.height;
      }
      this.y += this.speed;
      this.speed += force * this.breakForce;
      this.breakForce += 1;
      if (this.speed > 0) {
        this.speed = 0;
        this.breakForce = 1;
        clearInterval(this.breakInterval);
        this.breakInterval = null;
      }
    }, 10);
  }

  turnLeft(hard: boolean) {
    if (this.rightInterval) clearInterval(this.rightInterval);
    this.rightInterval = null;
    if (this.leftInterval) return;
    this.leftInterval = setInterval(() => {
      if (this.x < (this.canvas.width / 6) * 2) return;
      this.x -= hard ? 6 : 3;
    }, 10);
  }

  turnRight(hard: boolean) {
    if (this.leftInterval) clearInterval(this.leftInterval);
    this.leftInterval = null;
    if (this.rightInterval) return;
    this.rightInterval = setInterval(() => {
      if (this.x > (this.canvas.width / 6) * 3 + 90) return;
      this.x += hard ? 6 : 3;
    }, 10);
  }

  stopTurn() {
    clearInterval(this.leftInterval);
    this.leftInterval = null;
    clearInterval(this.rightInterval);
    this.rightInterval = null;
  }

  draw() {
    this.context.drawImage(this.img, this.x, this.y, 80, 140);
    this.boundaries.top = this.y;
    this.boundaries.right = this.x + 80;
    this.boundaries.left = this.x;
    this.boundaries.bottom = this.y + 140;
    this.plotBoundaries();
  }

  getBoundaries() {
    return this.boundaries;
  }

  getSpeed() {
    return Math.abs(parseInt(this.speed.toFixed(0)));
  }

  isMain() {
    return this.main;
  }

  isWithin(car: Car): boolean {
    if (((this.boundaries.top <= car.getBoundaries().bottom && this.boundaries.top >= car.getBoundaries().top) || (this.boundaries.bottom <= car.getBoundaries().bottom && this.boundaries.bottom >= car.getBoundaries().top)) && ((this.boundaries.right <= car.getBoundaries().right && this.boundaries.right >= car.getBoundaries().left) || (this.boundaries.left <= car.getBoundaries().right && this.boundaries.left >= car.getBoundaries().left))) {
      return true;
    }
    return false;
  }

  plotBoundaries() {
    this.context.beginPath();
    this.context.fillStyle = "rgba(255,255,255,0.2)";
    this.context.fillRect(this.boundaries.left, this.boundaries.top, 80, 140);
  }
}
