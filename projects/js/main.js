canv0.width = window.innerWidth; canv0.height = window.innerHeight;
ctx = canv0.getContext('2d');

var pieces = []; // Pieces array

var mousePos = {x: canv0.width/2, y: canv0.height/2};

var pieceRadius = 4,
	piecesCount = 64, 
	outScreenPixel = 16, // Outside screen space size
	lineRouteRadius = Math.sqrt( Math.pow(canv0.width, 2) + Math.pow(canv0.height, 2) )*0.15, // Length of dots routing lines
	mouseFieldRadius = 64, // Mouse repulsion radius
	mouseRepulsionStrength = 4,
	maxSpeed = 5; // Piece max speed

var gallerySlideNum = 0;
var slidesColors = ['#000000', '#4A4CA3', '#2661A2', '#F5CA46', '#B844A9', '#66DDAA', '#222222'];
var slidesURL = ['Orbit-Simulator/', '#', '#', '#', '#', '#', 'Theremin/'];

let slides = [
	{
		name: "Orbit Simulator",
		mainColor: "#000000",
		link: "/Orbit-Simulator"
	},
	{
		name: "Theremin",
		mainColor: "#222",
		link: "/Theremin"
	},
];
var slidesAmount = document.getElementsByClassName('list').length;
setInterfaceCol(slidesColors[gallerySlideNum]);

// Create gallery slide points
for (let i = slidesAmount; i--;){
	document.querySelector('.points').innerHTML += '<div class="point"></div>';
}
pointsControl();

// Create all peaces
for (let i = piecesCount; i--;){
	pieces[pieces.length] = {x: Math.round(Math.random()*(canv0.width+outScreenPixel))-outScreenPixel/2, y: Math.round(Math.random()*(canv0.height+outScreenPixel))-outScreenPixel/2, vx: Math.random()*2-1, vy: Math.random()*2-1};
}

// Mouse move event listener
document.addEventListener('mousemove', function (e){ // Write mouse position in mousePose variable
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
});


window.onresize = function(){
	canv0.width = window.innerWidth; canv0.height = window.innerHeight;
	// Create all peaces
	pieces = [];
	for (let i = piecesCount; i--;){
		pieces[pieces.length] = {x: Math.round(Math.random()*(canv0.width+outScreenPixel))-outScreenPixel/2, y: Math.round(Math.random()*(canv0.height+outScreenPixel))-outScreenPixel/2, vx: Math.random()*2-1, vy: Math.random()*2-1};
	}
	lineRouteRadius = Math.sqrt( Math.pow(canv0.width, 2) + Math.pow(canv0.height, 2) )*0.15; // Length of dots routing lines
}
document.getElementsByClassName('list').onclick = function (e) {
	urlPage();
}
document.querySelector('.gallery').onclick = function(e){
	var butt = e.target.className.split(' ')[0];
	let slidesCount = document.getElementsByClassName('list').length-1;
	document.getElementsByClassName('list')[gallerySlideNum].style['z-index'] = -10;
	if (butt == 'buttLeft') {
		let prevSlide = gallerySlideNum - 1 < 0 ? slidesCount : gallerySlideNum - 1;

		document.getElementsByClassName('list')[gallerySlideNum].style.animationName = 'hideRight';
		document.getElementsByClassName('list')[prevSlide].style.animationName = 'showRight';

		gallerySlideNum = gallerySlideNum > 0 ? gallerySlideNum-1 : slidesCount;
	} else if (butt == 'buttRight') {
		let nextSlide = gallerySlideNum + 1 > slidesCount ? 0 : gallerySlideNum + 1;

		document.getElementsByClassName('list')[gallerySlideNum].style.animationName = 'hideLeft';
		document.getElementsByClassName('list')[nextSlide].style.animationName = 'showLeft';

		gallerySlideNum = gallerySlideNum < slidesCount ? gallerySlideNum+1 : 0;
	}
	if (findParent(e.target, 'list')){
		urlPage();
	}
	pointsControl();
	setInterfaceCol(slidesColors[gallerySlideNum]);
	document.getElementsByClassName('list')[gallerySlideNum].style['z-index'] = 1;
}
document.querySelector('.outerList').onclick = function(){
}
document.onmousedown = function(){
	mouseFieldRadius *= 2;
}
document.onmouseup = function(){
	mouseFieldRadius /=2;
}
document.addEventListener('keydown', function(e){
	// console.log(e.keyCode);
	switch (e.keyCode) {
		case 37: {
			document.querySelector('.buttLeft').click();
			break;
		}
		case 39: {
			document.querySelector('.buttRight').click();
			break;
		}
	}
});

// Init
frame();
function frame(){
	window.requestAnimationFrame(frame); // Frame callback

	ctx.clearRect(0,0,canv0.width,canv0.height); // Clear screen

	// Calculatings
	for (let i = pieces.length; i--;){
		var p = pieces[i];
		// Mouse repulsion effect
		if ( distance(mousePos.x,mousePos.y,p.x,p.y) < mouseFieldRadius ) {
			var a = p.x-mousePos.x,
				b = p.y-mousePos.y,
				c = Math.sqrt(a*a+b*b);
			var cos = a/c;
			var sin = b/c;
			var R = distance(mousePos.x,mousePos.y,p.x,p.y) < 5 ? 5 : distance(mousePos.x,mousePos.y,p.x,p.y);
			p.vx += cos/Math.pow(R, 1/mouseRepulsionStrength);
			p.vy += sin/Math.pow(R, 1/mouseRepulsionStrength);
		}
		if ( (p.vx*p.vx) + (p.vy*p.vy) > (maxSpeed*maxSpeed) ) {
			var s = (maxSpeed*maxSpeed)/( (p.vx*p.vx) + (p.vy*p.vy) );
			p.vx *= s; p.vy *= s;
		} else {
			p.vx = p.vx > 1 ? p.vx * 0.995 : p.vx;
			p.vy = p.vy > 1 ? p.vy * 0.995 : p.vy;
		}
		p.vx = ( p.x + p.vx <= -(pieceRadius*2 + outScreenPixel) ) || ( p.x + p.vx >= canv0.width + (pieceRadius*2 + outScreenPixel) ) ? -p.vx : p.vx; // Walls outside screen
		p.vy = ( p.y + p.vy <= -(pieceRadius*2 + outScreenPixel) ) || ( p.y + p.vy >= canv0.height + (pieceRadius*2 + outScreenPixel) ) ? -p.vy : p.vy; // Walls outside screen
		p.x += p.vx; // Apply velocity
		p.y += p.vy; // Apply velocity
		//p.x = ( p.x <= -(pieceRadius*2 + outScreenPixel) ) || ( p.x >= canv0.width + (pieceRadius*2 + outScreenPixel) ) ? -(p.x - canv0.width) : p.x;
		//p.y = ( p.y <= -(pieceRadius*2 + outScreenPixel) ) || ( p.y >= canv0.height + (pieceRadius*2 + outScreenPixel) ) ? -(p.y - canv0.height) : p.y;
	}
	var colObj = document.getElementsByClassName('button')[0];

	ctx.fillStyle = window.getComputedStyle(colObj).borderColor || colObj.style.borderColor;
	ctx.strokeStyle = ctx.fillStyle; // Lines color

	// Rendering
	for (let i = pieces.length; i--;){
		var p = pieces[i];
		// Draw points
		ctx.beginPath();
		ctx.arc( p.x, p.y, pieceRadius, 0, 7);
		ctx.fill();

		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc( p.x, p.y, pieceRadius*2, 0, 7);
		ctx.stroke();

		for (let n = pieces.length; n--;){
			if (n == i || n<=i) { continue; } else {
				if ( distance(p.x,p.y,pieces[n].x,pieces[n].y) < lineRouteRadius ){
					//Lines width
					ctx.lineWidth = (1-distance(p.x,p.y,pieces[n].x,pieces[n].y)/lineRouteRadius)*pieceRadius; // Line width from distance
					ctx.lineWidth = ctx.lineWidth < 0.05 ? 0.05 : ctx.lineWidth; // Min line width check
					// Draw lines
					ctx.beginPath();
					ctx.moveTo(p.x,p.y);
					ctx.lineTo(pieces[n].x, pieces[n].y);
					ctx.stroke();
				} else { continue; }
			}
		}
		
	}
}

function distance(x0,y0,x1,y1){
	return Math.sqrt( Math.pow( x1-x0 , 2) + Math.pow( y1-y0 , 2) );
}

function rgbToHex(str){
	let col = str.split('(')[1].split(',');
	let hexCol = [];
	hexCol[0] = +col[0];
	hexCol[1] = +col[1];
	hexCol[2] = +col[2];
	hexCol[0] = hexCol[0].toString(16);
	hexCol[1] = hexCol[1].toString(16);
	hexCol[2] = hexCol[2].toString(16);
	hexCol[0] = hexCol[0].length == 1 ? '0'+hexCol[0] : hexCol[0];
	hexCol[1] = hexCol[1].length == 1 ? '0'+hexCol[1] : hexCol[1];
	hexCol[2] = hexCol[2].length == 1 ? '0'+hexCol[2] : hexCol[2];
	return '#'+hexCol.join('');
}

function setInterfaceCol(hexColor){
	let rgb = hexToRgb(hexColor);
	let button = document.getElementsByClassName('button'),
		list = document.getElementsByClassName('list');
	document.querySelector('.colZone').style.borderColor = 'rgb('+rgb.join()+')';
	list[gallerySlideNum].style.backgroundColor = 'rgba('+rgb.join()+',0.2)';
	list[gallerySlideNum].style.borderColor = 'rgb('+rgb.join()+')';
	list[gallerySlideNum].childNodes[3].childNodes[1].style.background = 'linear-gradient(90deg, '+hexColor+' 0%, rgba(0,0,0,0) 30%)';
	list[gallerySlideNum].childNodes[3].style.boxShadow = '-2px 0 5vh ' + 'rgba('+rgb.join()+',0.8)';
	button[0].style.backgroundColor = 'rgba('+rgb.join()+',0.2)';
	button[0].style.borderColor = 'rgb('+rgb.join()+')';
	//button[0].style.color = 'rgb('+rgb.join()+')';
	button[1].style.backgroundColor = 'rgba('+rgb.join()+',0.2)';
	button[1].style.borderColor = 'rgb('+rgb.join()+')';
	//button[1].style.color = 'rgb('+rgb.join()+')';	
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex2(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function pointsControl(){
	var pointsDOM = document.getElementsByClassName('point');
	for (let i = pointsDOM.length; i--;){
		if (gallerySlideNum == i){
			pointsDOM[i].style.backgroundColor = 'white';
		} else {
			pointsDOM[i].style.backgroundColor = 'inherit';
		}
	}
}

function urlPage(){
	document.location.href = slidesURL[gallerySlideNum];
}

function findParent(elem, name) {
	let elem0 = elem;
	if (elem.className == name){ return true; }
	while (elem0 && elem0.parentNode && elem0.parentNode.className != name){
		elem0 = elem0.parentNode;
	}
	return elem0 ? elem0.parentNode ? elem0.parentNode.className == name : false : undefined;
}