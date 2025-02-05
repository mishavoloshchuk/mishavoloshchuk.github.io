import CollisionMode from "./Enums/CollisionMode.js";
import Painter from "./Painter.js";
export default class TrajectoryPreview {
	constructor ({scene, renderer, camera, physics}){
		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.physics = physics;
	}

	process ({trajLen = 256, accuracity = 1}){
		// Save physics params
		const savedTimeSpeed = this.physics.timeSpeed;
		
		
		this.sceneClone = this.physics.scene = this.scene.makeCopy();
		this.physics.scene = this.sceneClone;
		this.physics.timeSpeed = savedTimeSpeed / accuracity;

		const calcInfo = this.calculate({trajLen: trajLen, accuracity: accuracity});

		this.render(calcInfo);
		
		// Restore physics params
		this.physics.scene = this.scene;
		this.physics.timeSpeed = savedTimeSpeed;
	}

	render({tracesArray, deletedObjectsList, distances, minDistance}){
		const ctx1 = this.renderer.ctx1;
		const newObjId = tracesArray.length - 1; // Created object id
		const otherObjTraceColor = "#999999"; // The trace color for non new object
		// Line dash settings
		const dashLineLen = 2; // Dash pattern line length
		const dashSpaceLen = 3; // Dash pattern space length
		const trajectoryEndSmooth = 300; // Trajectory end smooth length
		// Iterating trajectory traces
		for (let trace = 0; trace < tracesArray.length; trace ++){
			if (tracesArray[trace] === undefined) continue; // Don't draw if the object is locked
			
			let R, color;
			// Set styles to new object trajectory trace
			if (trace === newObjId){
				color  = ui.newObjColor.state;
				R = 2.5;
			} else {
				color = otherObjTraceColor;
				R = 0.75;
			}
			// ==== Making line dash pattern ===========================
			const dashPattern = []; // Dashed line pattern array
			// Trajectory trace length in pixels
			let traceLenInPixs = tracesArray[trace].reduce((trajLength, point, pId, pArr)=>{
				if (pId != 0) {
					return trajLength + UtilityMethods.distance(point[0], point[1], pArr[pId-1][0], pArr[pId-1][1]);
				}
				return trajLength;
			}, 0) * this.camera.animZoom;
				// Minimal value between trajectory end smooth length and trajectory trace length in pixels
			const possibleTrajEndSmooth = Math.min(trajectoryEndSmooth, traceLenInPixs);
			// Form dash pattern to smooth the end of trajectory
			while (traceLenInPixs > 0){
				if (traceLenInPixs > possibleTrajEndSmooth){ // Trajecroty pattern
					if (dashPattern.length % 2 === 0){ // Line
						traceLenInPixs -= dashLineLen;
						dashPattern.push(dashLineLen); // Add pattern
					} else { // Space
						traceLenInPixs -= dashSpaceLen;
						dashPattern.push(dashSpaceLen); // Add pattern
					}
				} else { // Trajectory end smoothing pattern
					if (dashPattern.length % 2 === 0){ // Line
						const line = traceLenInPixs / possibleTrajEndSmooth * dashLineLen;
						traceLenInPixs -= line;
						dashPattern.push(line); // Add pattern
					} else { // Space
						traceLenInPixs -= dashSpaceLen;
						dashPattern.push(dashSpaceLen); // Add pattern
					}
				}
			}
			ctx1.setLineDash(dashPattern); // Dash line
			Painter.drawOn(ctx1)
			.line(...tracesArray[trace], (x, y) => this.renderer.crd2(x, y))
			.stroke(color, R);
			ctx1.setLineDash([]); // Solid line
		}
		// Proximity display
		for (let distance of distances){
			const dObj = distance.obj;
			// New object arc
			const isNearest = distance.D === minDistance;
			if (isNearest){
				// New object
				let drawRadius = this.renderer.getScreenRad(ui.newObjMass.state);
				drawRadius = drawRadius < 2 ? 2 : drawRadius;
				Painter.drawOn(ctx1)
				.circle(...this.renderer.crd2(dObj.x, dObj.y), drawRadius)
				.fill(ui.newObjColor.state, { globalAlpha: 0.7 });

				// Second object arc
				drawRadius = this.renderer.getScreenRad(this.scene.objArr[dObj.obj2Id].m);
				drawRadius = drawRadius < 2 ? 2 : drawRadius;
				Painter.circle(...this.renderer.crd2(dObj.x2, dObj.y2), drawRadius)
				.fill(this.scene.objArr[dObj.obj2Id].color, { globalAlpha: 0.7 });
			} else {
				ctx1.globalAlpha = 0.3;
				if (this.renderer.isOutOfScreen(...this.renderer.crd2(dObj.x2, dObj.y2), 0)) continue;
			}

			// The line between approachment points	
			if (isNearest){
				let gradient = ctx1.createLinearGradient(// Line gradient
					...this.renderer.crd2(dObj.x, dObj.y),// X1Y1
					...this.renderer.crd2(dObj.x2, dObj.y2));// X2Y2
				gradient.addColorStop(0, ui.newObjColor.state); // New object color
				gradient.addColorStop(1, this.scene.objArr[dObj.obj2Id].color); // Second object color
				ctx1.strokeStyle = gradient;
				ctx1.lineWidth = 2; // Line width between approachment points
			} else {
				ctx1.strokeStyle = otherObjTraceColor;
				ctx1.lineWidth = 1; // Line width between approachment points
			}
			Painter.drawOn(ctx1)
			.line(this.renderer.crd2(dObj.x, dObj.y), this.renderer.crd2(dObj.x2, dObj.y2))
			.stroke();
			ctx1.globalAlpha = 1;
		}
		// Draw the cross if object(s) deleted after collision
		for (let deletedObj of deletedObjectsList){
			const size = this.renderer.getScreenRad(deletedObj.m)*0.7 < 3? 3 : this.renderer.getScreenRad(deletedObj.m)*0.7;
			// Circle
			let drawRadius = this.renderer.getScreenRad(deletedObj.m);
			drawRadius = drawRadius < 2 ? 2 : drawRadius;
			Painter.drawOn(ctx1)
			.circle(...this.renderer.crd2(deletedObj.x, deletedObj.y), drawRadius)
			.fill('#f30', { globalAlpha: 0.3 });

			Painter.drawCross(
				this.renderer.crd(deletedObj.x, 'x'),
				this.renderer.crd(deletedObj.y, 'y'), 
				1.5, 
				size, 
				'#ff0000'
			);
		}
	}

	calculate({trajLen, accuracity}) {
		const objArrCopy = this.sceneClone.objArr;
		// Create new object
		let newObjId = this.sceneClone.addNewObject({...newObjParams, callback: false});

		// Array with all trajectory traces
		const trajectoryTraces = [];
		for (let objectId in objArrCopy){
			objArrCopy[objectId].initId = objectId;
			if (objArrCopy[objectId].lock !== true){
				trajectoryTraces[objectId] = [[objArrCopy[objectId].x, objArrCopy[objectId].y]];
			}
		}

		// Trajectory calculation accuracity. Change iterations count to keep the same length.
		trajLen = trajLen * accuracity;

		const deletedObjectsList = []; // Array of deleted objects
		// Make distances array
		const distances = [];
		for (let i = objArrCopy.length - 1; i--;){
			distances[i] = {D: Infinity, obj: {}};
		}
		// Minimal distance during trajectory calculating
		let minDistance = Infinity;

		// Calculate all trajectories
		for (let i = trajLen; i--;){
			// Calculate minimal distance
			for (let objectId = objArrCopy.length; objectId--;){
				const obj = objArrCopy[objectId];
				if (!objArrCopy[newObjId]) continue;
				if (objectId === newObjId) continue;

				// Check distances
				const D = objArrCopy[newObjId].distance(obj);
				if (D < distances[objectId].D){
					distances[objectId].D = D;
					distances[objectId].obj = {
						x: objArrCopy[newObjId].x, 
						y: objArrCopy[newObjId].y, 
						x2: obj.x, 
						y2: obj.y, 
						obj2Id: objectId
					};
				}
				if (D < minDistance){
					minDistance = D;
				}
			}
						
			// Before calculation logics
			const beforeComputeData = this.physics.beforePhysics();

			// Merge collision
			if (ui.collisionMode.state === CollisionMode.Merge){
				const {deletedObjectsData} = beforeComputeData;
				deletedObjectsList.push(...deletedObjectsData.objArr);

				// Change newObjId after delete some objects after collision
				newObjId = UtilityMethods.getIdAfterArrChange(deletedObjectsData.idArr, newObjId);
			}

			// Physics compute
			if (gpuComputeAvailable && ui.gpuCompute.state && objArrCopy.length > 400) { // If objects more than 400, calculate on GPU
				this.physics.gpuComputeVelocities();
			} else {
				this.physics.physicsCalculate();
			}

			// Add points to trajectory trace array
			for (let objectId = objArrCopy.length; objectId--;){
				const obj = objArrCopy[objectId];

				// Add point to traces array
				if (obj.lock === false) trajectoryTraces[obj.initId].push([obj.x, obj.y]);
			}
		}
		// Params to return
		return {
			tracesArray: trajectoryTraces,
			deletedObjectsList: deletedObjectsList,
			distances: distances,
			minDistance: minDistance
		};
	}
}