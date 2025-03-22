import Particles from './Particles.js';
import slides from './slides.js';

generateSlides(slides);

let gallerySlideNum = 0;
  
let slidesAmount = document.getElementsByClassName('list').length;
setInterfaceCol(slides[gallerySlideNum].color);

// Create gallery slide points
for (let i = slidesAmount; i--;){
	document.querySelector('.points').innerHTML += '<div class="point"></div>';
}
pointsControl();

function generateSlides(slides) {
	let slidesString = '';

	for (let slide of slides) {
		slidesString += getSlide(slide);
	}

	const container = document.getElementById('slidesContainer');
	container.innerHTML = slidesString;
}

function getSlide(slide) {
	return `
		<a href="${slide.link}" class="list" style="opacity: 0;">
			<h1>${slide.name}</h1>
			<div class="colZone">
				<div class="colorGradient"></div>
				<div class="backImg" style="background-image: url('${slide.image}');"></div>
			</div>
		</a>
	`;
}

document.querySelector('.gallery').onclick = function(e){
	let butt = e.target.className.split(' ')[0];

	let direction = 0;
	if (butt === 'buttLeft') {
		direction = -1;
	} else if (butt === 'buttRight') {
		direction = 1;
	}
	setSlide(gallerySlideNum + direction, direction);

	pointsControl();
	setInterfaceCol(slides[gallerySlideNum].color);
}

function setSlide(slideIndex) {
	if (slideIndex == gallerySlideNum) return;
	
	const slidesCount = slides.length;
	const direction = slideIndex > gallerySlideNum ? 1 : -1;
	slideIndex = Math.abs((slideIndex + slidesCount) % slidesCount);

	hideSlide(gallerySlideNum, direction);
	showSlide(slideIndex, direction);

	gallerySlideNum = slideIndex;
}

const slidesContainer = document.getElementById('slidesContainer');
const slidesList = slidesContainer.children;

showSlide(gallerySlideNum);

function showSlide(index, direction = 1) {
	slidesList[index].style.animationName = direction > 0
		? 'showLeft'
		: 'showRight';
	
	slidesList[index].style['z-index'] = 1;
}

function hideSlide(index, direction = 1) {
	slidesList[index].style['z-index'] = -10;

	slidesList[index].style.animationName = direction > 0
		? 'hideLeft'
		: 'hideRight';
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