import Particles from './Particles.js';
import slides from './slides.js';

let gallerySlideNum = 0;
  
let slidesAmount = document.getElementsByClassName('list').length;
setInterfaceCol(slides[gallerySlideNum].color);

// Create gallery slide points
for (let i = slidesAmount; i--;){
	document.querySelector('.points').innerHTML += '<div class="point"></div>';
}
pointsControl();

document.getElementsByClassName('list').onclick = function (e) {
	urlPage();
}
document.querySelector('.gallery').onclick = function(e){
	let butt = e.target.className.split(' ')[0];
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
	setInterfaceCol(slides[gallerySlideNum].color);
	document.getElementsByClassName('list')[gallerySlideNum].style['z-index'] = 1;
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

function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function pointsControl(){
	let pointsDOM = document.getElementsByClassName('point');
	for (let i = pointsDOM.length; i--;){
		if (gallerySlideNum == i){
			pointsDOM[i].style.backgroundColor = 'white';
		} else {
			pointsDOM[i].style.backgroundColor = 'inherit';
		}
	}
}

function urlPage(){
	document.location.href = slides[gallerySlideNum].link;
}

function findParent(elem, name) {
	let elem0 = elem;
	if (elem.className == name){ return true; }
	while (elem0 && elem0.parentNode && elem0.parentNode.className != name){
		elem0 = elem0.parentNode;
	}
	return elem0 ? elem0.parentNode ? elem0.parentNode.className == name : false : undefined;
}

// Particles
const particleSystem = new Particles('#canv0', {
	onFrame: ({ths}) => {
		const colorElement = document.querySelector('.button');
		ths.options.color = window.getComputedStyle(colorElement).borderColor || colorElement.style.borderColor
	}
});

document.onmousedown = function(){
	particleSystem.options.mouseFieldRadius *= 2;
}
document.onmouseup = function(){
	particleSystem.options.mouseFieldRadius /= 2;
}