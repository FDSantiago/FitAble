<script lang="ts">
	import { onMount } from 'svelte';
	import pkg from '@mediapipe/pose';
    const {Pose} = pkg;
	import campkg from '@mediapipe/camera_utils';
    const {Camera} = campkg;

	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let canvasCtx: CanvasRenderingContext2D | null = null;

	interface CapturedFrame {
		label: string;
		features: number[];
	}

	let capturedData = $state<CapturedFrame[]>([]);
	let currentLabel = $state('rest');
	let currentFeatures = $state<number[] | null>(null);

	const poseClasses = ['rest', 'arm_stretch', 'squat_down', 'squat_up'];

	let classCounts = $derived(
		poseClasses.reduce<Record<string, number>>((acc, label) => {
			acc[label] = capturedData.filter((d) => d.label === label).length;
			return acc;
		}, {})
	);

	let totalFrames = $derived(capturedData.length);

	onMount(() => {
		canvasCtx = canvasElement.getContext('2d');

		const pose = new Pose({
			locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
		});
		pose.setOptions({
			modelComplexity: 1,
			smoothLandmarks: true,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5
		});
		pose.onResults(onResults);

		const camera = new Camera(videoElement, {
			onFrame: async () => {
				await pose.send({ image: videoElement });
			},
			width: 640,
			height: 480
		});
		camera.start();
	});

	function onResults(results: {
		image: unknown;
		poseLandmarks?: { x: number; y: number; z: number }[];
	}) {
		if (!canvasCtx) return;
		canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		canvasCtx.drawImage(
			results.image as HTMLCanvasElement | HTMLImageElement,
			0,
			0,
			canvasElement.width,
			canvasElement.height
		);

		if (results.poseLandmarks) {
			currentFeatures = results.poseLandmarks.flatMap((landmark) => [
				landmark.x,
				landmark.y,
				landmark.z
			]);
		} else {
			currentFeatures = null;
		}
	}

	function captureFrame() {
		if (!currentFeatures) {
			alert('No pose detected in the frame. Make sure you are in view of the camera.');
			return;
		}

		capturedData = [
			...capturedData,
			{
				label: currentLabel,
				features: currentFeatures
			}
		];
	}

	function exportDataset() {
		if (capturedData.length === 0) {
			alert('No data to export!');
			return;
		}

		const dataStr =
			'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(capturedData, null, 2));

		const downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute('href', dataStr);
		downloadAnchorNode.setAttribute('download', 'fitable_knn_dataset.json');
		document.body.appendChild(downloadAnchorNode);
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	function clearDataset() {
		if (confirm('Are you sure you want to delete all captured frames in this session?')) {
			capturedData = [];
		}
	}
</script>

<div class="developer-container">
	<header>
		<h1>FitAble k-NN Data Capture</h1>
		<p>Total Frames: <strong>{totalFrames}</strong> / 100</p>
	</header>

	<div class="video-section">
		<video bind:this={videoElement} class="hidden"></video>
		<canvas bind:this={canvasElement} width="640" height="480"></canvas>
	</div>

	<div class="controls-section">
		<div class="class-selector">
			<h3>1. Select Active Class</h3>
			<div class="button-group">
				{#each poseClasses as poseClass}
					<button
						class:active={currentLabel === poseClass}
						onclick={() => (currentLabel = poseClass)}
					>
						{poseClass} ({classCounts[poseClass] || 0})
					</button>
				{/each}
			</div>
		</div>

		<div class="action-buttons">
			<h3>2. Capture & Export</h3>
			<button class="capture-btn" onclick={captureFrame}>
				Capture Current Frame as '{currentLabel}'
			</button>

			<div class="export-group">
				<button onclick={exportDataset} class="export-btn">Export dataset.json</button>
				<button onclick={clearDataset} class="clear-btn">Clear Data</button>
			</div>
		</div>
	</div>
</div>

<style>
	.developer-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		font-family: system-ui, sans-serif;
	}

	.hidden {
		display: none;
	}

	canvas {
		width: 100%;
		max-width: 640px;
		border: 2px solid #333;
		border-radius: 8px;
		background-color: #f0f0f0;
	}

	.controls-section {
		margin-top: 20px;
		display: grid;
		gap: 20px;
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	button {
		padding: 10px 15px;
		border: 1px solid #ccc;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		font-weight: 500;
	}

	button.active {
		background: #007bff;
		color: white;
		border-color: #0056b3;
	}

	.capture-btn {
		width: 100%;
		padding: 15px;
		background: #28a745;
		color: white;
		font-size: 1.1em;
		margin-bottom: 15px;
		border: none;
	}

	.capture-btn:hover {
		background: #218838;
	}

	.export-group {
		display: flex;
		gap: 10px;
	}

	.export-btn {
		flex: 1;
		background: #17a2b8;
		color: white;
		border: none;
	}
	.clear-btn {
		background: #dc3545;
		color: white;
		border: none;
	}
</style>
