import Particles from './Particles.js';
import slides from './slides.js';

generateSlides(slides);

let gallerySlideNum = 0;

setInterfaceCol(slides[gallerySlideNum].color);

// Create gallery slide points
const pointsContainer = document.querySelector('.points');
for (let slide of slides){
	pointsContainer.innerHTML += `
		<button 
			class="point" 
			title="${slide.name}" 
			style="border-color: color-mix(in srgb, white 50%, ${slide.color});"
		></button>
	`;
}

pointsContainer.addEventListener('click', (e) => {
	const points = Array.from(pointsContainer.children);
	const point = e.target.closest('.point');
	if (!point) return;

	setSlide(points.indexOf(point));
})

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
		<a href="${slide.link}" class="list" style="opacity: 0; --slide-color: ${slide.color};">
			<h1>${slide.name}</h1>
			<div class="colZone">
				<div class="colorGradient"></div>
				<div class="backImg" style="background-image: url('${slide.image}');"></div>
			</div>
		</a>
	`;
}

document.querySelector('.gallery').addEventListener('click', onBtnBlockClick);
document.querySelector('.mobileButtons').addEventListener('click', onBtnBlockClick);

function onBtnBlockClick(e) {
	let butt = e.target.closest('button');
	if (!butt) return;
	
	const classList = butt.classList;

	let direction = 0;
	if (classList.contains('buttLeft')) {
		direction = -1;
	} else if (classList.contains('buttRight')) {
		direction = 1;
	}
	setSlide(gallerySlideNum + direction);
}

function setSlide(slideIndex) {
	if (slideIndex == gallerySlideNum) return;
	
	const slidesCount = slides.length;
	const direction = slideIndex > gallerySlideNum ? 1 : -1;
	slideIndex = Math.abs((slideIndex + slidesCount) % slidesCount);

	hideSlide(gallerySlideNum, direction);
	showSlide(slideIndex, direction);

	gallerySlideNum = slideIndex;

	pointsControl();
	setInterfaceCol(slides[gallerySlideNum].color);
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
	document.body.style.setProperty('--theme-color', hexColor);
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