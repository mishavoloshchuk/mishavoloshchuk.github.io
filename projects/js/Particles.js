export default class Particles {
    constructor(canvas, options) {
        this.canvas = this.#getCanvas(canvas);
        this.canvasFitScreen();
        this.ctx = this.canvas.getContext('2d');
        
        this.mousePos = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.options = this.#getOptions(options);
        this.pieces = this.#createPieces();
        
        window.addEventListener('resize', () => this.#onResize());
        document.addEventListener('mousemove', (e) => this.#onMouseMove(e));
        
        this.animate();
    }

    #getCanvas(canvasOrQuerySelector) {
        if (typeof canvasOrQuerySelector === 'string') {
            return document.querySelector(canvasOrQuerySelector);
        } else if (canvasOrQuerySelector instanceof HTMLCanvasElement) {
            return canvasOrQuerySelector;
        } else {
            throw new Error("Invalid canvas input. Must be a canvas element or selector string.");
        }
    }

    canvasFitScreen() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    #getOptions(options) {
        return Object.assign(this.#getDefaultOptions(), options);
    }

    #getDefaultOptions() {
        return {
            color: '#000000',
            pieceRadius: 4,
            piecesCount: 64,
            outScreenPixel: 16,
            mouseFieldRadius: 64,
            mouseRepulsionStrength: 4,
            maxSpeed: 5,
            lineRouteRadius: Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) * 0.15
        };
    }

    #createPieces() {
        const pieces = [];
        for (let i = 0; i < this.options.piecesCount; i++) {
            pieces.push({
                x: Math.random() * (this.canvas.width + this.options.outScreenPixel) - this.options.outScreenPixel / 2,
                y: Math.random() * (this.canvas.height + this.options.outScreenPixel) - this.options.outScreenPixel / 2,
                vx: Math.random() * 2 - 1,
                vy: Math.random() * 2 - 1
            });
        }
        return pieces;
    }

    #onResize() {
        this.canvasFitScreen();
        this.pieces = this.#createPieces();
        this.options.lineRouteRadius = Math.sqrt(this.canvas.width ** 2 + this.canvas.height ** 2) * 0.15;
    }

    #onMouseMove(event) {
        this.mousePos.x = event.clientX;
        this.mousePos.y = event.clientY;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.options.onFrame && this.options.onFrame({
            ths: this
        });
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.#updatePieces();
        this.#drawParticles();
    }

    #updatePieces() {
        for (const p of this.pieces) {
            const distToMouse = this.#distance(this.mousePos.x, this.mousePos.y, p.x, p.y);

            if (distToMouse < this.options.mouseFieldRadius) {
                const dx = p.x - this.mousePos.x;
                const dy = p.y - this.mousePos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const cos = dx / dist;
                const sin = dy / dist;
                const R = Math.max(distToMouse, 5);
                const mouseForce = Math.pow(R, 1 / this.options.mouseRepulsionStrength);
                p.vx += cos/mouseForce;
                p.vy += sin/mouseForce;
            }
            
            const speed = Math.sqrt(p.vx ** 2 + p.vy ** 2);
            if (speed > this.options.maxSpeed) {
                p.vx *= this.options.maxSpeed / speed;
                p.vy *= this.options.maxSpeed / speed;
            }
            
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < -this.options.outScreenPixel || p.x > this.canvas.width + this.options.outScreenPixel) p.vx *= -1;
            if (p.y < -this.options.outScreenPixel || p.y > this.canvas.height + this.options.outScreenPixel) p.vy *= -1;
        }
    }

    #drawParticles() {
        this.ctx.fillStyle = this.options.color;
        this.ctx.strokeStyle = this.options.color;
        
        for (const [i, p] of this.pieces.entries()) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.options.pieceRadius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.options.pieceRadius * 2, 0, Math.PI * 2);
            this.ctx.stroke();
            
            for (let j = i + 1; j < this.pieces.length; j++) {
                const other = this.pieces[j];
                const dist = this.#distance(p.x, p.y, other.x, other.y);
                if (dist < this.options.lineRouteRadius) {
                    this.ctx.lineWidth = Math.max(0.05, (1 - dist / this.options.lineRouteRadius) * this.options.pieceRadius);
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    #distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
}
