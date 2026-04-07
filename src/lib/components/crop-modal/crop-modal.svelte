<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import LucideX from '~icons/lucide/x';
	import LucideCheck from '~icons/lucide/check';
	import LucideRotateCw from '~icons/lucide/rotate-cw';
	import LucideRotateCcw from '~icons/lucide/rotate-ccw';
	import LucideZoomIn from '~icons/lucide/zoom-in';
	import LucideZoomOut from '~icons/lucide/zoom-out';

	let {
		src,
		onclose,
		oncrop
	}: {
		src: string;
		onclose: () => void;
		oncrop: (blob: Blob) => void;
	} = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = $state(null);
	let image: HTMLImageElement | null = null;
	let scale = $state(1);
	let rotation = $state(0);
	let offset = $state({ x: 0, y: 0 });
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });

	const canvasSize = 300;
	const maxScale = 5;
	const minScale = 0.5;

	$effect(() => {
		if (canvas) {
			ctx = canvas.getContext('2d');
			canvas.width = canvasSize;
			canvas.height = canvasSize;
			loadImage();
		}
	});

	function loadImage() {
		image = new Image();
		image.onload = () => {
			offset = { x: 0, y: 0 };
			drawCanvas();
		};
		image.src = src;
	}

	function drawCanvas() {
		if (!ctx || !image) return;

		ctx.clearRect(0, 0, canvasSize, canvasSize);

		ctx.fillStyle = '#1a1a1a';
		ctx.fillRect(0, 0, canvasSize, canvasSize);

		ctx.save();
		ctx.translate(canvasSize / 2, canvasSize / 2);
		ctx.rotate((rotation * Math.PI) / 180);
		ctx.scale(scale, scale);
		ctx.translate(offset.x, offset.y);

		const displaySize = Math.min(image.width, image.height);
		const sx = (image.width - displaySize) / 2;
		const sy = (image.height - displaySize) / 2;

		ctx.drawImage(
			image,
			sx,
			sy,
			displaySize,
			displaySize,
			-canvasSize / 2,
			-canvasSize / 2,
			canvasSize,
			canvasSize
		);
		ctx.restore();

		ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		ctx.fillRect(0, 0, canvasSize, canvasSize);

		ctx.save();
		ctx.translate(canvasSize / 2, canvasSize / 2);
		ctx.rotate((rotation * Math.PI) / 180);
		ctx.scale(scale, scale);
		ctx.translate(offset.x, offset.y);

		const cropSize = canvasSize;
		ctx.clearRect(-cropSize / 2, -cropSize / 2, cropSize, cropSize);
		ctx.drawImage(
			image,
			sx,
			sy,
			displaySize,
			displaySize,
			-canvasSize / 2,
			-canvasSize / 2,
			canvasSize,
			canvasSize
		);
		ctx.restore();

		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.strokeRect(0, 0, canvasSize, canvasSize);

		const gridColor = 'rgba(255, 255, 255, 0.4)';
		ctx.strokeStyle = gridColor;
		ctx.lineWidth = 1;
		for (let i = 1; i < 3; i++) {
			const gx = (canvasSize / 3) * i;
			ctx.beginPath();
			ctx.moveTo(gx, 0);
			ctx.lineTo(gx, canvasSize);
			ctx.stroke();
			const gy = (canvasSize / 3) * i;
			ctx.beginPath();
			ctx.moveTo(0, gy);
			ctx.lineTo(canvasSize, gy);
			ctx.stroke();
		}
	}

	function handleMouseDown(e: MouseEvent) {
		if (!image) return;
		isDragging = true;
		const rect = canvas.getBoundingClientRect();
		dragStart = {
			x: e.clientX - rect.left - offset.x,
			y: e.clientY - rect.top - offset.y
		};
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !image) return;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		offset = {
			x: x - dragStart.x,
			y: y - dragStart.y
		};
		drawCanvas();
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function zoom(delta: number) {
		const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));
		if (newScale !== scale) {
			scale = newScale;
			drawCanvas();
		}
	}

	function rotate(dir: 1 | -1) {
		rotation += dir * 90;
		drawCanvas();
	}

	function handleCrop() {
		if (!image) return;
		const outputCanvas = document.createElement('canvas');
		const outputSize = 400;
		outputCanvas.width = outputSize;
		outputCanvas.height = outputSize;
		const outputCtx = outputCanvas.getContext('2d');
		if (!outputCtx) return;

		const displaySize = Math.min(image.width, image.height);
		const sx = (image.width - displaySize) / 2;
		const sy = (image.height - displaySize) / 2;

		// Scale offset proportionally from preview canvas (canvasSize) to output canvas (outputSize)
		const offsetScale = outputSize / canvasSize;

		outputCtx.save();
		outputCtx.translate(outputSize / 2, outputSize / 2);
		outputCtx.rotate((rotation * Math.PI) / 180);
		outputCtx.scale(scale, scale);
		outputCtx.translate(offset.x * offsetScale, offset.y * offsetScale);
		outputCtx.drawImage(
			image,
			sx,
			sy,
			displaySize,
			displaySize,
			-outputSize / 2,
			-outputSize / 2,
			outputSize,
			outputSize
		);
		outputCtx.restore();

		outputCanvas.toBlob(
			(blob) => {
				if (blob) {
					oncrop(blob);
				}
			},
			'image/jpeg',
			0.9
		);
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
	<div class="flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-card p-6 shadow-xl">
		<div class="flex w-full items-center justify-between">
			<h2 class="text-lg font-bold">Crop Profile Photo</h2>
			<button type="button" onclick={onclose} class="text-muted-foreground hover:text-foreground">
				<LucideX class="h-5 w-5" />
			</button>
		</div>

		<div
			class="relative overflow-hidden rounded-lg"
			style="width: {canvasSize}px; height: {canvasSize}px;"
		>
			<canvas
				bind:this={canvas}
				class="cursor-pointer"
				onmousedown={handleMouseDown}
				onmousemove={handleMouseMove}
				onmouseup={handleMouseUp}
				onmouseleave={handleMouseUp}
			></canvas>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => rotate(-1)}
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"
			>
				<LucideRotateCcw class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={() => zoom(-0.2)}
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"
			>
				<LucideZoomOut class="h-4 w-4" />
			</button>
			<input
				type="range"
				min={minScale}
				max={maxScale}
				step="0.1"
				value={scale}
				oninput={(e) => {
					scale = parseFloat(e.currentTarget.value);
					drawCanvas();
				}}
				class="h-2 w-24 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
			/>
			<button
				type="button"
				onclick={() => zoom(0.2)}
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"
			>
				<LucideZoomIn class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={() => rotate(1)}
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"
			>
				<LucideRotateCw class="h-4 w-4" />
			</button>
		</div>

		<div class="flex gap-2">
			<Button variant="outline" onclick={onclose}>
				<LucideX class="mr-1 h-4 w-4" />
				Cancel
			</Button>
			<Button onclick={handleCrop}>
				<LucideCheck class="mr-1 h-4 w-4" />
				Apply Crop
			</Button>
		</div>
	</div>
</div>
