var anim = {dblsctt: false, weOffer: false};
document.onscroll = (e) => {
	var elem = document.querySelector('.aboutNow');
	var posY = (getCoords(elem).bottom+getCoords(elem).top)/2;
	if (window.scrollY+window.innerHeight >= posY && window.scrollY <= posY && !anim.dblsctt){
		anim.dblsctt = true;
	}
	elem = document.querySelector('.serviceItem');
	posY = (getCoords(elem).bottom+getCoords(elem).top)/2;
	if (window.scrollY+window.innerHeight >= posY && window.scrollY <= posY && !anim.weOffer){
		anim.weOffer = true;
	}

}

function getCoords(elem) {
	let box = elem.getBoundingClientRect();
	return {
		top: box.top + scrollY,
		left: box.left + scrollX,
		bottom: box.bottom + scrollY,
	};
}

frame()
function frame(){
	window.requestAnimationFrame(frame);
	if (anim.dblsctt){
		document.querySelector('.dblLeftBox').style['animation-name'] = 'mainTSlide';
		let ourAchieves = document.querySelector('.ourAchieves');
		document.querySelector('.backGradient').style['animation-name'] = 'mainTSlide';
		ourAchieves.childNodes[1].style.animationName = 'mainTSlide';
		ourAchieves.childNodes[3].style.animationName = 'mainTSlide';
		ourAchieves.childNodes[5].style.animationName = 'mainTSlide';
	}
	if (anim.weOffer){
		let elems = document.querySelector('.services').childNodes;
		for (let i in elems){
			if (elems[i].className == 'serviceItem'){
				elems[i].style.animationName = 'mainTSlide';
			}
		}
		
	}
}

class AnimScroll {
	static speed = 0.25;
	
	static posY;
	static scrolling = false;

	static promiseResolve;
	
	static anim() {
		window.requestAnimationFrame(this.anim.bind(this));
		if (!this.scrolling) return;

		const difference = Math.abs(this.posY - window.scrollY);
		window.scrollTo(0, difference / (this.speed + 1));

		// Finish scrolling
		if (Math.abs(this.posY - window.scrollY) < 1) {
			this.scrolling = false;
			
			this.promiseResolve();
		};
		
	}

	static scrollTo(posY = 0) {
		this.scrolling = true;
		this.posY = posY;
		return new Promise((resolve) => {
			this.promiseResolve = resolve;
		});
	}

	static init() {
		this.anim();
	}
}
AnimScroll.init();

class UpButton {
	animDuration = 150;
	BOUNDARY = 50;
	prevScrollY = window.scrollY;
	timeout;
	showed = false;

	constructor(element) {
		this.element = element;
		setInterval(this.checkDirection, 200);

		element.addEventListener('click', e => {
			AnimScroll.scrollTo(0)
			.then(() => {
				this.hide();
				this.prevScrollY = 0;
			})
		});
	}

	checkDirection = () => {
		if (this.prevScrollY - window.scrollY > this.BOUNDARY){
			this.show();
			this.prevScrollY = scrollY;
		} else 
		if (window.scrollY - this.prevScrollY > 0 || window.scrollY < this.BOUNDARY) {
			this.hide();
			this.prevScrollY = scrollY;
		}
	}

	show() {
		if (this.showed) return;
		clearTimeout(this.timeout);
		this.showed = true;

		this.element.style.display = 'initial';
		this.timeout = setTimeout(() => {
			this.element.style.opacity = '0.8';
		}, this.animDuration);
	}

	hide() {
		if (!this.showed) return;
		clearTimeout(this.timeout);
		this.showed = false;

		this.element.style.opacity = '0';
		this.timeout = setTimeout(() => {
			this.element.style.display = 'none';
	}, this.animDuration);
	}

}

const upBtn = new UpButton(document.querySelector('.toUp'));