import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.msRequestAnimationFrame;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements AfterViewInit {
  @HostListener('document:keyup.arrowup', ['$event']) onArrorUpBreakHandler(event: KeyboardEvent) {
      this.onArrowDown();
  }
  @HostListener('document:keydown.arrowup', ['$event']) onArrorUpHandler(event: KeyboardEvent) {
      this.onArrowUp();
  }
  @HostListener('document:keydown.arrowdown', ['$event']) onArrowDownHandler(event: KeyboardEvent) {
      this.onArrowDown(true);
  }
  @HostListener('document:keydown', ['$event']) onKeyDownHandler(event: KeyboardEvent) {
      console.log(event);
  }
  @ViewChild('canvas') canvas : ElementRef;
  public context: CanvasRenderingContext2D;
  roads: Road[] = [];
  grass: GrassPatch[] = [];
  cars: Car[] = [];

  constructor() { }

  ngAfterViewInit(): void {
    this.context = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
    this.canvas.nativeElement.width = window.innerWidth;
    this.canvas.nativeElement.height = window.innerHeight * 0.9;
    this.grass.push(new GrassPatch(0, this.context, this.canvas.nativeElement));
    this.grass.push(new GrassPatch(3.8, this.context, this.canvas.nativeElement, true));
    this.roads.push(new Road(3, this.context, this.canvas.nativeElement, false, false));
    this.roads.push(new Road(2, this.context, this.canvas.nativeElement, true, true));
    this.cars.push(new Car('../assets/orange.png', -(this.canvas.nativeElement.height / 2), -75, this.context, this.canvas.nativeElement, true));
    this.cars.push(new Car('http://www.clker.com/cliparts/o/h/i/f/Y/K/red-car-top-view-md.png', this.canvas.nativeElement.height / 2, 0, this.context, this.canvas.nativeElement));
    this.draw();
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.grass.forEach((grass: any) => {
      grass.draw();
    });
    this.roads.forEach((road: any) => {
      road.draw();
    });
    this.cars.forEach((car: any) => {
      car.draw();
      if (!car.isMain()) {
        car.accelarate();
      }
    });
    requestAnimationFrame(this.draw.bind(this));
  }

  onArrowUp() {
    this.cars[0].accelarate();
  }

  onArrowDown(hard = false) {
    this.cars[0].deccelarate(hard);
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
    setInterval(() => {
      if (this.speed < 0) return;
      this.speed -= 0.005;
      this.x += this.speed;
      if (this.x > 350) {
        this.x = -450;
      }
    }, 10);
  }

  accelarate() {
    if (this.speed < 0) this.speed = 0;
    if (this.speed > 1 && !this.main) return;
    this.driving = true;
    this.speed += this.main ? 0.08 : (Math.random() * 10) / 100;
    this.x += this.speed;
    if (this.x > 350) {
      this.x = -500;
    }
    console.log(this.speed);
  }

  deccelarate(hard = false) {
    if (this.speed < 0) {
      this.speed = 0;
      return;
    }
    this.driving = false;
    this.speed -= hard ? 0.5 : 0.08;
    this.x += this.speed;
    if (this.x > 350) {
      this.x = -500;
    }
  }

  draw() {
    this.context.save();
    this.context.translate(this.canvas.width/2,this.canvas.height/2);
    this.context.rotate((this.main ? 270 : 90) *Math.PI/180);
    this.context.drawImage(this.img, this.x, this.y, 140, 80);
    this.boundaries.top = this.x + 140;
    this.boundaries.right = this.y + 80;
    this.boundaries.left = this.y;
    this.boundaries.bottom = this.x;
    this.plotBoundaries();
  }

  getBoundaries() {
    return this.boundaries;
  }

  isMain() {
    return this.main;
  }

  plotBoundaries() {
    this.context.beginPath();
    this.context.fillStyle = "rgba(255,255,255,0.2)";
    this.context.fillRect(this.boundaries.bottom, this.boundaries.left, 140, 80);
    this.context.restore();
  }
}
