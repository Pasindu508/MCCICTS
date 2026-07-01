function getOffset(element, fromElement) {
	let el = element,
		offsetLeft = 0,
		offsetTop = 0;

	do {
		offsetLeft += el.offsetLeft;
		offsetTop += el.offsetTop;

		el = el.offsetParent;
	} while (el && el !== fromElement);

	return { offsetLeft, offsetTop };
}

window.monkey_patch_render = (obj) => obj.render();

class VisualizerOverlay {
	constructor(visualizerCanvas, renderOptions) {
		this.renderOptions = renderOptions;
		this.visualizerCanvas = visualizerCanvas;

		this.wrappyCanvas = document.createElement("canvas");
		this.wrappyCtx = this.wrappyCanvas.getContext("2d");

		this.overlayCanvases = [];
		this.animateFns = [];

		window.monkey_patch_render = (obj) => {
			// Butterchurn Milkdrop visualizer (WebGL)
			if (obj.audio && obj.renderer) {
				obj.render();
				const glCanvas = obj.renderer.gl && obj.renderer.gl.canvas;
				if (glCanvas) {
					this.visualizerCanvas = glCanvas;
				}
				this.render(this.renderOptions);
				return;
			}
			return obj.render();
		};
	}

	setVisualizerCanvas(canvas) {
		if (canvas) {
			this.visualizerCanvas = canvas;
		}
	}

	makeOverlayCanvas(windowEl) {
		const mountEl = windowEl.querySelector(".window-content") || windowEl;
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		canvas.style.position = "absolute";
		canvas.style.left = "0";
		canvas.style.top = "0";
		canvas.style.pointerEvents = "none";
		canvas.style.mixBlendMode = "color-dodge";
		canvas.style.zIndex = "99999";
		canvas.style.willChange = "opacity";
		canvas.className = "visualizer-overlay-canvas";
		if (getComputedStyle(mountEl).position === "static") {
			mountEl.style.position = "relative";
		}
		mountEl.appendChild(canvas);
		this.overlayCanvases.push(canvas);
		this.animateFns.push(options => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const scale =
				(mountEl.classList.contains("doubled") ? 2 : 1) *
				(window.devicePixelRatio || 1);
			if (
				canvas.width !== mountEl.clientWidth * scale ||
				canvas.height !== mountEl.clientHeight * scale
			) {
				canvas.width = mountEl.clientWidth * scale;
				canvas.height = mountEl.clientHeight * scale;
			}
			canvas.style.width = mountEl.clientWidth + "px";
			canvas.style.height = mountEl.clientHeight + "px";
			const stuff = mountEl.querySelectorAll("*");
			Array.from(stuff)
				.map(el => {
					const width = el.clientWidth;
					const height = el.clientHeight;
					const area = width * height;
					return { element: el, width, height, area };
				})
				.filter(({ area }) => area > 0)
				.sort((a, b) => b.area - a.area)
				.forEach(({ element, width, height, area }) => {
					const { offsetLeft, offsetTop } = getOffset(element, mountEl);
					ctx.save();
					ctx.scale(scale, scale);
					ctx.translate(offsetLeft, offsetTop);
					if (options.stretch) {
						ctx.drawImage(this.wrappyCanvas, 0, 0, width, height);
					} else {
						ctx.drawImage(
							this.wrappyCanvas,
							0,
							0,
							width,
							height,
							0,
							0,
							width,
							height
						);
					}
					if (area < 30 * 30) {
						ctx.globalCompositeOperation = "destination-out";
						ctx.globalAlpha = 0.5;
						ctx.fillStyle = "black";
						ctx.fillRect(0, 0, width, height);
					}
					ctx.restore();
				});
		});
	}

	render(options) {
		const { visualizerCanvas, wrappyCanvas, wrappyCtx, animateFns } = this;
		if (!visualizerCanvas || !visualizerCanvas.width || !visualizerCanvas.height) {
			return;
		}
		const options_ = options || this.renderOptions;
		const { width, height } = visualizerCanvas;
		if (options_.mirror) {
			const drawImage = () => {
				wrappyCtx.drawImage(
					visualizerCanvas,
					0,
					0,
					width,
					height,
					0,
					0,
					width,
					height
				);
			};
			wrappyCanvas.width = width * 2;
			wrappyCanvas.height = height * 2;
			wrappyCtx.save();
			drawImage();
			wrappyCtx.translate(0, height);
			wrappyCtx.scale(1, -1);
			wrappyCtx.translate(0, -height);
			drawImage();
			wrappyCtx.translate(width, 0);
			wrappyCtx.scale(-1, 1);
			wrappyCtx.translate(-width, 0);
			drawImage();
			wrappyCtx.translate(0, height);
			wrappyCtx.scale(1, -1);
			wrappyCtx.translate(0, -height);
			drawImage();
			wrappyCtx.restore();
		} else if (options_.tile) {
			wrappyCanvas.width = width * 2;
			wrappyCanvas.height = height * 2;
			for (let xi = 0; xi < 2; xi++) {
				for (let yi = 0; yi < 2; yi++) {
					wrappyCtx.drawImage(
						visualizerCanvas,
						0,
						0,
						width,
						height,
						width * xi,
						height * yi,
						width,
						height
					);
				}
			}
		} else {
			wrappyCanvas.width = width;
			wrappyCanvas.height = height;
			wrappyCtx.drawImage(visualizerCanvas, 0, 0, width, height);
		}

		animateFns.forEach(fn => fn(options_));
	}
	cleanUp() {
		this.overlayCanvases.forEach(canvas => {
			canvas.remove();
		});
		this.overlayCanvases = [];
		this.animateFns = [];
		window.monkey_patch_render = (obj) => obj.render();
	}
	fadeOutAndCleanUp() {
		if (!this.overlayCanvases.length) {
			this.cleanUp();
			return;
		}
		this.fadeOut();
		this.overlayCanvases[0].addEventListener("transitionend", () => {
			this.cleanUp();
		}, { once: true });
	}
	fadeOut() {
		this.overlayCanvases.forEach(canvas => {
			canvas.style.transition =
				"opacity 1s cubic-bezier(0.125, 0.960, 0.475, 0.915)";
			canvas.style.opacity = "0";
		});
	}
	fadeIn() {
		this.overlayCanvases.forEach(canvas => {
			canvas.style.transition = "opacity 0.2s ease";
			canvas.style.opacity = "1";
		});
	}
}
