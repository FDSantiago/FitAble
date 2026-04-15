<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	interface Landmark {
		x: number;
		y: number;
		z: number;
		visibility?: number;
	}

	interface PoseResults {
		poseLandmarks: Landmark[] | null;
	}

	interface Pose {
		new (options: { locateFile?: (file: string) => string }): PoseInstance;
	}

	interface PoseInstance {
		setOptions(options: {
			modelComplexity?: number;
			smoothLandmarks?: boolean;
			enableSegmentation?: boolean;
			smoothSegmentation?: boolean;
			minDetectionConfidence?: number;
			minTrackingConfidence?: number;
		}): void;
		onResults(callback: (results: PoseResults) => void): void;
		send(options: { image: HTMLVideoElement }): Promise<void>;
		close(): void;
	}

	interface CameraInstance {
		start(): Promise<void>;
		stop(): void;
	}

	interface Camera {
		new (
			videoElement: HTMLVideoElement,
			options: {
				onFrame: () => Promise<void>;
				width: number;
				height: number;
			}
		): CameraInstance;
	}

	let {
		exercise = 'pushup' as 'pushup' | 'squat' | 'situp' | 'jumpingjack',
		onRepCount = () => {},
		onFormFeedback = () => {},
		onStateChange = () => {},
		onAngleUpdate = () => {},
		onSafetyAlert = () => {},
		badFormThreshold = 70,
		badFormAlertDelay = 5000
	}: {
		exercise?: 'pushup' | 'squat' | 'situp' | 'jumpingjack';
		onRepCount?: (count: number) => void;
		onFormFeedback?: (feedback: string, score: number) => void;
		onStateChange?: (state: 'ready' | 'down' | 'up') => void;
		onAngleUpdate?: (angle: number) => void;
		/** Called when bad form is sustained for badFormAlertDelay ms */
		onSafetyAlert?: (durationMs: number) => void;
		/** Form score (0-100) below which bad-form tracking begins. Default: 70 */
		badFormThreshold?: number;
		/** Milliseconds of sustained bad form before alert fires. Default: 5000 */
		badFormAlertDelay?: number;
	} = $props();

	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let canvasCtx: CanvasRenderingContext2D | null = null;

	let pose: PoseInstance | null = null;
	let camera: CameraInstance | null = null;
	let isCameraRunning = $state(false);
	let currentAngle = $state(0);
	let detectionStatus = $state<'searching' | 'detected' | 'lost'>('searching');

	let repCount = $state(0);
	let currentExerciseState: 'ready' | 'down' | 'up' = 'ready';
	let lastStateChangeTime = 0;
	let formScores: number[] = [];

	// Safety alert tracking
	let badFormStartTime: number | null = null;
	let safetyAlertFired = false;
	let badFormDuration = $state(0); // milliseconds of sustained bad form

	const POSE_CONFIDENCE_THRESHOLD = 0.5;
	//const REP_COUNT_COOLDOWN = 500;
	const STATE_TRANSITION_MIN_TIME = 300;

	function calculateAngle(
		a: { x: number; y: number },
		b: { x: number; y: number },
		c: { x: number; y: number }
	): number {
		const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
		let angle = Math.abs((radians * 180) / Math.PI);
		if (angle > 180) angle = 360 - angle;
		return angle;
	}

	function getLandmarkString(landmarks: Landmark[], part: number): Landmark | null {
		if (
			!landmarks[part] ||
			(landmarks[part].visibility && landmarks[part].visibility < POSE_CONFIDENCE_THRESHOLD)
		)
			return null;
		return landmarks[part];
	}

	function calculatePushupAngle(landmarks: Landmark[]): number | null {
		const shoulder = getLandmarkString(landmarks, 11);
		const elbow = getLandmarkString(landmarks, 13);
		const wrist = getLandmarkString(landmarks, 15);

		if (!shoulder || !elbow || !wrist) return null;
		return calculateAngle(shoulder, elbow, wrist);
	}

	function calculateSquatAngle(landmarks: Landmark[]): number | null {
		const hip = getLandmarkString(landmarks, 23);
		const knee = getLandmarkString(landmarks, 25);
		const ankle = getLandmarkString(landmarks, 27);

		if (!hip || !knee || !ankle) return null;
		return calculateAngle(hip, knee, ankle);
	}

	function calculateSitupAngle(landmarks: Landmark[]): number | null {
		const shoulder = getLandmarkString(landmarks, 11);
		const hip = getLandmarkString(landmarks, 23);
		const knee = getLandmarkString(landmarks, 25);

		if (!shoulder || !hip || !knee) return null;
		return calculateAngle(shoulder, hip, knee);
	}

	function calculateJumpingJackAngle(landmarks: Landmark[]): number | null {
		const leftShoulder = getLandmarkString(landmarks, 11);
		const rightShoulder = getLandmarkString(landmarks, 12);
		const leftElbow = getLandmarkString(landmarks, 13);
		const rightElbow = getLandmarkString(landmarks, 14);

		if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow) return null;
		const leftArmAngle = calculateAngle(leftElbow, leftShoulder, rightShoulder);
		const rightArmAngle = calculateAngle(rightElbow, rightShoulder, leftShoulder);
		return (leftArmAngle + rightArmAngle) / 2;
	}

	function getExerciseAngle(landmarks: Landmark[]): number | null {
		switch (exercise) {
			case 'pushup':
				return calculatePushupAngle(landmarks);
			case 'squat':
				return calculateSquatAngle(landmarks);
			case 'situp':
				return calculateSitupAngle(landmarks);
			case 'jumpingjack':
				return calculateJumpingJackAngle(landmarks);
			default:
				return null;
		}
	}

	function getStateFromAngle(angle: number): 'up' | 'down' | 'ready' {
		switch (exercise) {
			case 'pushup':
				if (angle > 160) return 'up';
				if (angle < 90) return 'down';
				return 'ready';
			case 'squat':
				if (angle > 160) return 'up';
				if (angle < 100) return 'down';
				return 'ready';
			case 'situp':
				if (angle > 120) return 'up';
				if (angle < 60) return 'down';
				return 'ready';
			case 'jumpingjack':
				if (angle < 60) return 'up';
				if (angle > 120) return 'down';
				return 'ready';
			default:
				return 'ready';
		}
	}

	function calculateFormScore(angle: number, state: 'up' | 'down' | 'ready'): number {
		if (state === 'ready') return 100;

		let targetMin: number;
		let targetMax: number;
		switch (exercise) {
			case 'pushup':
				targetMin = state === 'up' ? 160 : 70;
				targetMax = state === 'up' ? 180 : 110;
				break;
			case 'squat':
				targetMin = state === 'up' ? 160 : 70;
				targetMax = state === 'up' ? 180 : 110;
				break;
			case 'situp':
				targetMin = state === 'up' ? 120 : 40;
				targetMax = state === 'up' ? 180 : 80;
				break;
			case 'jumpingjack':
				targetMin = state === 'up' ? 30 : 150;
				targetMax = state === 'up' ? 60 : 180;
				break;
			default:
				return 80;
		}

		const idealAngle = (targetMin + targetMax) / 2;
		const deviation = Math.abs(angle - idealAngle);
		const maxDeviation = (targetMax - targetMin) / 2 + 20;
		const score = Math.max(0, 100 - (deviation / maxDeviation) * 100);
		return Math.round(score);
	}

	function processResults(results: PoseResults): void {
		if (!canvasCtx || !canvasElement) return;

		canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		canvasCtx.fillStyle = 'transparent';
		canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

		if (!results.poseLandmarks) {
			detectionStatus = 'searching';
			return;
		}

		detectionStatus = 'detected';
		const landmarks = results.poseLandmarks;

		drawPoseSkeleton(landmarks, results);

		const angle = getExerciseAngle(landmarks);
		if (angle === null) {
			detectionStatus = 'lost';
			return;
		}

		currentAngle = Math.round(angle);
		onAngleUpdate(currentAngle);

		const newState = getStateFromAngle(currentAngle);
		const now = Date.now();

		if (
			newState !== currentExerciseState &&
			now - lastStateChangeTime > STATE_TRANSITION_MIN_TIME
		) {
			if (currentExerciseState !== 'ready') {
				formScores.push(calculateFormScore(currentAngle, currentExerciseState));
			}

			if (currentExerciseState === 'down' && newState !== 'down') {
				repCount++;
				onRepCount(repCount);
			}

			currentExerciseState = newState;
			lastStateChangeTime = now;
			onStateChange(currentExerciseState);
		}

		const formScore = calculateFormScore(currentAngle, currentExerciseState);
		const feedbackText =
			formScore < badFormThreshold
				? 'Watch your form'
				: currentExerciseState === 'ready'
					? 'Get into position'
					: currentExerciseState === 'down'
						? 'Good depth!'
						: 'Full extension';

		onFormFeedback(feedbackText, formScore);

		// Safety alert: track sustained bad form
		if (formScore < badFormThreshold && currentExerciseState !== 'ready') {
			if (badFormStartTime === null) {
				badFormStartTime = now;
				safetyAlertFired = false;
			}
			badFormDuration = now - badFormStartTime;
			if (!safetyAlertFired && badFormDuration >= badFormAlertDelay) {
				safetyAlertFired = true;
				onSafetyAlert(badFormDuration);
			}
		} else {
			// Form is good — reset tracker so alert can fire again next time
			badFormStartTime = null;
			safetyAlertFired = false;
			badFormDuration = 0;
		}
	}

	function drawPoseSkeleton(landmarks: Landmark[], results: PoseResults): void {
		if (!canvasCtx) return;

		const width = canvasElement.width;
		const height = canvasElement.height;

		canvasCtx.fillStyle = 'transparent';
		canvasCtx.fillRect(0, 0, width, height);

		if (results.poseLandmarks) {
			for (const landmark of results.poseLandmarks) {
				if (landmark.visibility && landmark.visibility < POSE_CONFIDENCE_THRESHOLD) continue;

				canvasCtx!.beginPath();
				canvasCtx!.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
				canvasCtx!.fillStyle =
					currentExerciseState === 'down'
						? '#22c55e'
						: currentExerciseState === 'up'
							? '#3b82f6'
							: '#f59e0b';
				canvasCtx!.fill();
			}

			const connections: [number, number, string][] = [
				[11, 13, '#22c55e'],
				[13, 15, '#22c55e'],
				[12, 14, '#22c55e'],
				[14, 16, '#22c55e'],
				[11, 23, '#3b82f6'],
				[23, 25, '#3b82f6'],
				[25, 27, '#3b82f6'],
				[12, 24, '#3b82f6'],
				[24, 26, '#3b82f6'],
				[26, 28, '#3b82f6'],
				[11, 12, '#f59e0b'],
				[23, 24, '#f59e0b']
			];

			for (const [startIdx, endIdx, color] of connections) {
				const startLandmark = landmarks[startIdx];
				const endLandmark = landmarks[endIdx];

				if (
					startLandmark &&
					endLandmark &&
					startLandmark.visibility &&
					endLandmark.visibility &&
					startLandmark.visibility > POSE_CONFIDENCE_THRESHOLD &&
					endLandmark.visibility > POSE_CONFIDENCE_THRESHOLD
				) {
					canvasCtx!.beginPath();
					canvasCtx!.moveTo(startLandmark.x * width, startLandmark.y * height);
					canvasCtx!.lineTo(endLandmark.x * width, endLandmark.y * height);
					canvasCtx!.strokeStyle = color;
					canvasCtx!.lineWidth = 3;
					canvasCtx!.stroke();
				}
			}
		}
	}

	async function initCamera(): Promise<void> {
		if (!browser) return;

		try {
			const cameraUtils = await import('@mediapipe/camera_utils');
			const poseModule = await import('@mediapipe/pose');

			const Camera: Camera = cameraUtils.Camera;
			const Pose: Pose = poseModule.Pose;

			pose = new Pose({
				locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
			});

			pose.setOptions({
				modelComplexity: 1,
				smoothLandmarks: true,
				enableSegmentation: false,
				smoothSegmentation: false,
				minDetectionConfidence: 0.3,
				minTrackingConfidence: 0.3
			});

			pose.onResults(processResults);

			camera = new Camera(videoElement, {
				onFrame: async () => {
					if (pose) {
						await pose.send({ image: videoElement });
					}
				},
				width: 640,
				height: 480
			});

			await camera.start();
			isCameraRunning = true;

			if (canvasElement) {
				canvasCtx = canvasElement.getContext('2d');
			}
		} catch (error) {
			console.error('Failed to initialize camera:', error);
			detectionStatus = 'lost';
		}
	}

	function stopCamera(): void {
		if (camera) {
			camera.stop();
			camera = null;
		}
		if (pose) {
			pose.close();
			pose = null;
		}
		isCameraRunning = false;
	}

	export function toggleCamera(): boolean {
		if (isCameraRunning) {
			stopCamera();
		} else {
			initCamera();
		}
		return isCameraRunning;
	}

	export function getRepCount(): number {
		return repCount;
	}

	export function getAverageFormScore(): number {
		if (formScores.length === 0) return 100;
		return Math.round(formScores.reduce((a, b) => a + b, 0) / formScores.length);
	}

	export {
		isCameraRunning,
		detectionStatus,
		currentAngle,
		repCount,
		currentExerciseState as currentState,
		badFormDuration
	};

	onMount(() => {
		if (browser) {
			initCamera();
		}
	});

	onDestroy(() => {
		stopCamera();
	});
</script>

<div
	class="pose-detector relative h-full w-full overflow-hidden rounded-2xl bg-black object-contain"
>
	<video
		bind:this={videoElement}
		class="absolute inset-0 h-full w-full object-contain"
		autoplay
		muted
		playsinline
		aria-label="Camera feed for exercise detection"
	></video>
	<canvas bind:this={canvasElement} class="absolute inset-0 h-full w-full" width="640" height="480"
	></canvas>

	<div
		class="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white"
	>
		<span
			class="h-2 w-2 rounded-full {detectionStatus === 'detected'
				? 'bg-green-500'
				: detectionStatus === 'searching'
					? 'bg-yellow-500'
					: 'bg-red-500'}"
		></span>
		<span
			>{detectionStatus === 'detected'
				? 'Tracking'
				: detectionStatus === 'searching'
					? 'Searching...'
					: 'Lost'}</span
		>
	</div>

	<div
		class="absolute top-3 right-3 rounded-full bg-black/50 px-3 py-1.5 text-sm font-bold text-white"
	>
		{currentAngle}°
	</div>
</div>
