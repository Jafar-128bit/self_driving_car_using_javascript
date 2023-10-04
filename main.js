console.log('Self Driving Car');

/* Car Info HTML Elements */
let pos_x = document.getElementById('pos_x');
let pos_y = document.getElementById('pos_y');
let angle = document.getElementById('angle');

let fwd = document.getElementById('fwd');
let rev = document.getElementById('rev');
let left = document.getElementById('left');
let right = document.getElementById('right');

let speed = document.getElementById('speed');
let acceleration = document.getElementById('accr');
let friction = document.getElementById('fric');
let max_speed = document.getElementById('mx_speed');

/* Canvas Element */
const carCanvas = document.getElementById('myCanvas');
carCanvas.height = window.innerHeight;
carCanvas.width = 250;

const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.height = window.innerHeight;
networkCanvas.width = 800;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const cars = generateCars(50);//Number of cars

let bestCar = cars[0];
let reloadPage = true;

if (localStorage.getItem('bestBrain')) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
    if (i!==0) {
      NeuralNetwork.mutate(cars[i].brain,0.5);//Mutation
    }
  }
}

const traffic = [
  new Car(road.getLAneCenter(0), -100, 30, 50, 'DUMMY', 2),
  new Car(road.getLAneCenter(1), -200, 30, 50, 'DUMMY', 3.5),
  new Car(road.getLAneCenter(2), -300, 30, 50, 'DUMMY', 2),
  new Car(road.getLAneCenter(0), -700, 30, 50, 'DUMMY', 2),
  new Car(road.getLAneCenter(0), -500, 30, 50, 'DUMMY', 2),
  new Car(road.getLAneCenter(2), -600, 30, 50, 'DUMMY', 3)
];

animate();

function infoScreen(infoData) {
  pos_x.innerHTML = 'Position X : ' + infoData.positionX.toFixed(4);
  pos_y.innerHTML = 'Position Y : ' + infoData.positionY.toFixed(4);
  angle.innerHTML = 'Angle : ' + (infoData.angle * (180 / Math.PI)).toFixed(4);

  const changeColor = (elementName, condition) => {
    if (condition) elementName.style.backgroundColor = 'GREEN';
    else elementName.style.backgroundColor = 'RED';
  };

  changeColor(fwd, infoData.controls.forward);
  changeColor(rev, infoData.controls.reverse);
  changeColor(left, infoData.controls.left);
  changeColor(right, infoData.controls.right);

  speed.innerHTML = 'Speed : ' + infoData.speed.toFixed(4);
  acceleration.innerHTML = 'Acceleration : ' + infoData.acceleration;
  friction.innerHTML = 'Friction : ' + infoData.friction;
  max_speed.innerHTML = 'Max Speed : ' + infoData.maxSpeed;
}

function generateCars(N) {
  const cars = [];
  const laneCenter = Math.floor(Math.random() * 3);
  for (let i = 1; i <= N; i++) cars.push(new Car(road.getLAneCenter(laneCenter), 100, 30, 50, 'AI', 4.5));
  return cars;
}

const saveCar = () => localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
const deleteCar = () => localStorage.removeItem('bestBrain');

const reRun = () => {
  setTimeout(() => {
    saveCar();
    location.reload();
    reloadPage = false;
  }, 5000);
};

function animate(time) {
  for (let i = 0; i < traffic.length; i++) traffic[i].update(road.borders, []);
  for (let i = 0; i < cars.length; i++) cars[i].update(road.borders, traffic);

  bestCar = cars.find(c => c.y === Math.min(...cars.map(c => c.y)));
  const carInfo = bestCar.info();

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.8);

  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++) traffic[i].draw(carCtx, 'red');
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) cars[i].draw(carCtx, 'blue');
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, 'blue', true);

  infoScreen(carInfo);
  carCtx.restore();

  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  // if (bestCar.damaged) {
  //   if (reloadPage) reRun();
  // }
  requestAnimationFrame(animate);
}