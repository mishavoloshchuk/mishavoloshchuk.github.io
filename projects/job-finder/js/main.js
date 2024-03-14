// Animation
Element.prototype.show = function (){
	if (this.animState !== "hidden" && this.animState !== undefined) return;
	const animDuration = this.getAttribute('animationDuration');
	this.setAttribute('animState', 'showing');
	this.animState = 'showing';
	clearTimeout(this.timeout);
	this.timeout = setTimeout(() => {this.setAttribute('animState', 'showed'); this.animState = 'showed';}, animDuration);
}
Element.prototype.hide = function (){
	if (this.animState !== "showed" && this.animState !== undefined) return;
	const animDuration = this.getAttribute('animationDuration');
	this.setAttribute('animState', 'hiding');
	this.animState = 'hiding';
	clearTimeout(this.timeout);
	this.timeout = setTimeout(() => {this.setAttribute('animState', 'hidden'); this.animState = 'hidden'}, animDuration);
}

class Candidate {
    skills = [];

    constructor({name, age, skills}) {
        this.name = name;
        this.age = age;

        skills.forEach(skillName => this.addSkill(skillName));
    }

    addSkill(tech) {
        const skill = new CandidatesSkill(tech);
        this.skills.push(skill);
    }

    removeSkill(skill) {
        const skillId = this.skills.indexOf(skill);
        if (skillId < 0) return;
        this.skillsElem.removeChild(skill.element);
        return this.skills.splice(skillId, 1);
    }
}

class CandidateView {
    static list = document.getElementById('candidates_list');

    constructor(candidate) {
        this.candidate = candidate;
        this.element = document.getElementById('candidate_template')
            .content.cloneNode(true).firstElementChild;

        this.skillsElem = this.element.querySelector('.skills');

        this.setName(candidate.name);
        this.setAge(candidate.age);
        this.renderSkills();
    }

    setName(name) {
        this.element.querySelector('.candidate_name').innerHTML = name;
    }

    setAge(age) {
        this.element.querySelector('.candidate_age').innerHTML = age;
    }

    renderSkills() {
        this.candidate.skills.forEach(skill => {
            const skillElement = skill.element;
            skillElement.textContent = skill.tech.getMainName();
            this.skillsElem.appendChild(skillElement);
        });
    }

    showCandidate() {
        CandidateView.list.appendChild(this.element);
    }

    hideCandidate() {
        CandidateView.list.removeChild(this.element);
    }

    setSkillsMatched(matchedSkills) {
        // Очищення виділення попередніх навичок
        this.candidate.skills.forEach(skill => skill.setMatched(false));
        
        // Виділення навичок, які підходять по вакансії
        matchedSkills.forEach(matchedSkill => {
            const skill = this.candidate.skills.find(skill => skill.tech == matchedSkill);
            if (skill) {
                skill.setMatched(true);
            }
        });
    }

    setUnmatchedSkills(requiredSkills) {
        this.resetUnmatchedSkills();
        
        // Отримання навичок кандидата
        const candidateSkills = this.candidate.skills.map(skill => skill.tech);

        // Знаходження навичок, які не відповідають навичкам кандидата
        const unmatchedSkills = requiredSkills.filter(skill => !candidateSkills.includes(skill));

        // Відображення навичок, які не відповідають навичкам кандидата з відповідними стилями
        unmatchedSkills.forEach(skill => {
            const unmatchedSkillElement = document.createElement('span');
            unmatchedSkillElement.textContent = skill.getMainName();
            unmatchedSkillElement.classList.add('skill');
            unmatchedSkillElement.classList.add('unmatched-skill'); // Додайте стилі для невідповідних навичок
            this.skillsElem.appendChild(unmatchedSkillElement);
        });
    }

    resetUnmatchedSkills() {
        const unmatched = this.skillsElem.querySelectorAll(".unmatched-skill");
        unmatched.forEach(el => el.remove());
    }
}

class CandidatesSkill {
    constructor(tech) {
        this.element = document.getElementById('skill_template')
        .content.cloneNode(true).firstElementChild; 
        this.element.innerHTML = tech.getMainName();
        this.tech = tech;
    }

    setMatched(isMatched) {
        if (isMatched) {
            this.element.classList.add('matched-skill'); // Додайте стилі для виділення
        } else {
            this.element.classList.remove('matched-skill');
        }
    }
}

class Technology {
    names = [];

    constructor(...names) {
        this.names = names;
        this.names = names.map(name => name.toLowerCase())
    }

    getMainName() {
        return this.names[0];
    }
}

class Technologies {
    technologies = [];

    addTechnology(...tech) {
        this.technologies.push(...tech);
    }

    findTechInText(text) {
        text = text.toLowerCase();
        // Get all names of all technologies
        const sortedAllTechNames = this.getAllNames()
        .sort((a, b) => b.name.length - a.name.length);

        const matches = [];
        
        for (let tech of sortedAllTechNames) {
            let foundAt = text.indexOf(tech.name, 0);
            while(foundAt >= 0) {
                matches.push({
                    tech: tech.tech,
                    start: foundAt, 
                    end: foundAt + tech.name.length
                });

                foundAt = text.indexOf(tech.name, foundAt + 1);
            }
            text = text.replaceAll(tech.name, ';'.repeat(tech.name.length));
        }

        return matches;
    }

    getAllNames() {
        const techNames = [];
        for (let tech of this.technologies) {
            techNames.push(...tech.names.map(
                name => { return {name: name, tech: tech} }
            ));
        }
        return techNames;
    }
}

class Rating {
    static rate(foundTechs, candidates = candidates) {
        const candidatesRating = new Array(candidates.length).fill(0);
        for (let indx in candidates) {
            const candidate = candidates[indx];
            for (let skill of candidate.skills) {
                if (foundTechs.includes(skill.tech)) candidatesRating[indx] ++;
            }
        }
        
        return candidatesRating;
    }
}

const technologies = new Technologies();
technologies.addTechnology(
    new Technology("HTML", "HTML5"),
    new Technology("CSS", "CSS3"),
    new Technology("JavaScript", "JS", "ES5", "ES6", "ECMAScript"),
    new Technology("React"),
    new Technology("React Native"),
    new Technology("PHP", "PHP7", "PHP8"),
    new Technology("MySQL", "MariaDB")
);

class ScrollBlocker {
    static scrollWidth = this.getScrollWidth();
    static unlockScrollTimeout;
    
    static init() {
        window.addEventListener('resize', () => {
            this.scrollWidth = this.getScrollWidth();
        });
    }

    static lockScroll(){
        clearTimeout(this.unlockScrollTimeout);
        document.body.style.cssText = `overflow-y: hidden; margin-left: -${this.scrollWidth/2}px;`;
    }
    static unlockScroll(){
        document.body.style.cssText = 'overflow-y: auto; margin-left: 0;';
    }
    static getScrollWidth(){
        return innerWidth - document.body.offsetWidth;
    }
}
ScrollBlocker.init();

class ScreenSwitcher {
    static active;

    static setActive(elem) {
        this.active && this.active.hide();
        this.active = elem;
        this.active.show();
    }
}

ScreenSwitcher.setActive(main_screen);

const candidates = [
    new Candidate({name: "Іван Іваненко", age: 28, skills: [...technologies.technologies]}),
    new Candidate({name: "Іван Іваненко", age: 23, skills: [technologies.technologies[0]]}),
    // new Candidate({name: "Іван Іваненко", age: 22, skills: ["HTML", "CSS", "JavaScript", "React"]}),
];

const candidatesView = candidates.map(c => new CandidateView(c));

function showModal (modalId){
	const modalElement = getById(modalId);
	modalElement.show();
	ScrollBlocker.lockScroll();
}
function hideModal (modalId){
	const modalElement = getById(modalId);
	modalElement.hide();
	ScrollBlocker.unlockScroll();
}

function getById(id) {
    var el = document.getElementById(id);
    if (!el) {
         throw new ReferenceError(id + " is not defined");
    }
    return el;
 }

class TextSelector2 {
    constructor(elem, padding = 2) {
        this.elem = elem;
        this.DEFAULT_PADDING = padding
    }

    select(startIndx, endIndx, color = "#2B66C966", padding = this.DEFAULT_PADDING) {
        const secectionRect = this.getSelectionRect(startIndx, endIndx);
        const div = document.createElement('div');
        div.className = 'selection';
        Object.assign(div.style, {
            backgroundColor: color,
            top:    (secectionRect.top - padding)      + 'px',
            left:   (secectionRect.left - padding)     + 'px',
            width:  (secectionRect.width + padding*2)  + 'px',
            height: (secectionRect.height + padding*2) + 'px',
        });
    
        document.body.appendChild(div);
    
        const relativePos = this.getRelativePosition(div, this.elem);
    
        Object.assign(div.style, {
            top: relativePos.top + 'px',
            left: relativePos.left + 'px'
        });
    
        this.elem.appendChild(div);
    
        return div;       
    }

    getSelectionRect(startIndx, endIndx) {
        const range = document.createRange();
        range.setStart(this.elem.firstChild, startIndx);
        range.setEnd(this.elem.firstChild, endIndx);
        
        const rect = range.getBoundingClientRect();

        return rect;
    }

    getRelativePosition(element, relativeTo) {
        var rect1 = element.getBoundingClientRect();
        var rect2 = relativeTo.getBoundingClientRect();
    
        return {
            top: rect1.top - rect2.top,
            left: rect1.left - rect2.left,
            right: rect1.right - rect2.right,
            bottom: rect1.bottom - rect2.bottom
        };
    }

    removeAll() {
        const selections = this.elem.querySelectorAll('.selection');
        selections.forEach(sl => sl.remove());
    }
}


class TextSelector {
    constructor(elem) {
        this.elem = elem;
        this.allSelections = [];
        this.textSelection = false;
    }
    
    select(startIndx, endIndx, color = "#2B66C9", textColor = "white") {
        const offset = this.allSelections 
            ? this.allSelections.reduce((acc, val) => val.index > startIndx ? acc : acc + val.width, 0) 
            : 0;
    
        const spanOpenTag = `<span class="selected" style="color: ${textColor}; background-color: ${color};">`;
        const spanCloseTag = '</span>';
        
        // Insert span
        this.elem.innerHTML = insertString(this.elem.innerHTML, spanOpenTag, startIndx + offset);
        this.elem.innerHTML = insertString(this.elem.innerHTML, spanCloseTag, endIndx + offset + spanOpenTag.length);
    
        const spanTextLength = spanOpenTag.length + spanCloseTag.length;
    
        this.allSelections 
            ? this.allSelections.push({index: startIndx, width: spanTextLength})
            : this.allSelections = [{index: startIndx, width: spanTextLength}];
    
        this.textSelection = true;
    }

    removeAll() {
        if (!this.textSelection) return;
        const selections = this.elem.querySelectorAll('.selected');
        selections.forEach(sl => sl.replaceWith(...sl.childNodes));
        this.elem.normalize();
        this.allSelections = [];
        this.textSelection = false;
    }
}

const resumeSelection = new TextSelector(getById('resume_text'));


function insertString(originalString, insertion, index) {
    if (index > originalString.length) {
        // If the index is greater than the length of the original string,
        // append the insertion at the end of the original string.
        return originalString + insertion;
    }

    return (
        originalString.slice(0, index) +
        insertion +
        originalString.slice(index)
    );
}

function pasteClipboardIn(elem) {
    navigator.clipboard.readText().then(text => {
        if (elem.innerHTML.length > 0) elem.innerHTML += "\n\n";
        elem.innerHTML += text;
    });
    resumeSelection.removeAll();
}

function process() {
    const elem = getById("resume_text");
    resumeSelection.removeAll();

    const text = elem.innerHTML;
    const findTechResult = technologies.findTechInText(text);
    const foundTechs = [];

    for (let result of findTechResult) {
        if (!foundTechs.includes(result.tech)) {
            foundTechs.push(result.tech);
        }
    }

    for (let range of findTechResult) {
        resumeSelection.select(range.start, range.end, "white", "var(--second-color)");
    }

    const ratingResult = Rating.rate(foundTechs, candidates).map((rating, indx) => {return {rating: rating, view: candidatesView[indx]}});

    ratingResult.sort((a, b) => b.rating - a.rating);

    ratingResult.forEach(({view}) => {
        view.showCandidate();
        view.setSkillsMatched(foundTechs);
        view.setUnmatchedSkills(foundTechs);
    });
    
    ScreenSwitcher.setActive(getById("candidates_screen"));
    // candidateSelection2.select(0, 6);
}

const candidateSelection = new TextSelector(candidatesView[1].element.querySelector('h2'));
// candidateSelection.select(0, 6);

const candidateSelection2 = new TextSelector2(candidatesView[0].element.querySelector('h2'));

