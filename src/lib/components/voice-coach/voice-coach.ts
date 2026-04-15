/**
 * VoiceCoach — Text-to-speech workout coaching service.
 *
 * Uses the Web Speech API SpeechSynthesis. No external dependencies, no API keys,
 * works fully offline with system voices.
 *
 * Priority levels (higher = spoken sooner, cancels lower):
 *   urgent (3) > normal (2) > ambient (1)
 *
 * Per-category cooldowns prevent repetitive chatter on every frame.
 */

export type VoiceCoachPriority = 'urgent' | 'normal' | 'ambient';

interface QueuedUtterance {
	text: string;
	priority: number;
	category: string;
}

const PRIORITY_MAP: Record<VoiceCoachPriority, number> = {
	urgent: 3,
	normal: 2,
	ambient: 1
};

/** Minimum ms between two speech events of the same category. */
const CATEGORY_COOLDOWNS: Record<string, number> = {
	state: 500,
	form: 8000,
	safety: 12000,
	rep: 0,
	milestone: 0,
	set: 2000,
	session: 0
};

const RECENT_WORDS = {
	WORKOUT_STARTED: 'workout-started',
	WORKOUT_ENDED: 'workout-ended',
	WATCH_FORM: 'watch-form'
} as const;

let recentUtteredWord = '';

class VoiceCoachService {
	private enabled = true;
	private queue: QueuedUtterance[] = [];
	private speaking = false;
	private lastSpokenAt: Map<string, number> = new Map();
	private preferredVoice: SpeechSynthesisVoice | null = null;

	constructor() {
		if (typeof window !== 'undefined' && window.speechSynthesis) {
			// Voices load asynchronously on some browsers
			const pickVoice = () => {
				const voices = window.speechSynthesis.getVoices();
				// Prefer an English voice
				this.preferredVoice =
					voices.find((v) => v.lang.startsWith('en') && v.localService) ??
					voices.find((v) => v.lang.startsWith('en')) ??
					voices[0] ??
					null;
			};
			pickVoice();
			window.speechSynthesis.onvoiceschanged = pickVoice;
		}
	}

	/** Whether TTS is currently enabled. */
	get isEnabled(): boolean {
		return this.enabled;
	}

	/** True if the browser supports SpeechSynthesis. */
	get isSupported(): boolean {
		return typeof window !== 'undefined' && 'speechSynthesis' in window;
	}

	enable(): void {
		this.enabled = true;
	}

	disable(): void {
		this.enabled = false;
		if (typeof window !== 'undefined' && window.speechSynthesis) {
			window.speechSynthesis.cancel();
		}
		this.queue = [];
		this.speaking = false;
	}

	toggle(): boolean {
		if (this.enabled) {
			this.disable();
		} else {
			this.enable();
		}
		return this.enabled;
	}

	/**
	 * Enqueue a coaching message.
	 * @param text       Text to speak.
	 * @param category   Throttle key (see CATEGORY_COOLDOWNS).
	 * @param priority   'urgent' | 'normal' | 'ambient'
	 */
	speak(text: string, category: string, priority: VoiceCoachPriority = 'normal'): void {
		if (!this.enabled || !this.isSupported) return;

		// Cooldown check
		const cooldown = CATEGORY_COOLDOWNS[category] ?? 3000;
		const lastTime = this.lastSpokenAt.get(category) ?? 0;
		if (Date.now() - lastTime < cooldown) return;

		const p = PRIORITY_MAP[priority];

		// If urgent, clear everything and speak immediately
		if (p === PRIORITY_MAP.urgent) {
			window.speechSynthesis.cancel();
			this.queue = [];
			this.speaking = false;
		}

		this.queue.push({ text, priority: p, category });
		// Sort descending by priority so highest-priority items speak first
		this.queue.sort((a, b) => b.priority - a.priority);

		this._processQueue();
	}

	private _processQueue(): void {
		if (this.speaking || this.queue.length === 0) return;
		if (!this.isSupported) return;

		const item = this.queue.shift()!;
		this.speaking = true;
		this.lastSpokenAt.set(item.category, Date.now());

		const utterance = new SpeechSynthesisUtterance(item.text);
		utterance.rate = 1.05;
		utterance.pitch = 1;
		utterance.volume = 1;
		if (this.preferredVoice) {
			utterance.voice = this.preferredVoice;
		}

		utterance.onend = () => {
			this.speaking = false;
			this._processQueue();
		};
		utterance.onerror = () => {
			this.speaking = false;
			this._processQueue();
		};

		window.speechSynthesis.speak(utterance);
	}

	// ─── Convenience helpers ───────────────────────────────────────────────

	sayWorkoutStarted(exerciseName: string): void {
		if (recentUtteredWord === RECENT_WORDS.WORKOUT_STARTED) return;
		recentUtteredWord = RECENT_WORDS.WORKOUT_STARTED;
		this.speak(`${exerciseName} started. Let's go!`, 'session', 'normal');
	}

	sayWorkoutEnded(): void {
		if (recentUtteredWord === RECENT_WORDS.WORKOUT_ENDED) return;
		recentUtteredWord = RECENT_WORDS.WORKOUT_ENDED;
		this.speak('Workout complete. Nice job!', 'session', 'normal');
	}

	saySetComplete(setNumber: number, reps: number): void {
		this.speak(`Set ${setNumber} complete — ${reps} reps. Take a rest.`, 'set', 'normal');
	}

	sayStateChange(state: 'down' | 'up' | 'ready'): void {
		if (state === 'ready') return;
		const text = state === 'down' ? 'Down' : 'Up';
		this.speak(text, 'state', 'ambient');
	}

	sayRepMilestone(repCount: number): void {
		if (repCount === 0) return;
		if (repCount % 10 === 0) {
			this.speak(`${repCount} reps — great work!`, 'milestone', 'normal');
		} else if (repCount % 5 === 0) {
			this.speak(`${repCount} reps — keep it up!`, 'milestone', 'ambient');
		}
	}

	sayFormWarning(score: number): void {
		if (recentUtteredWord === RECENT_WORDS.WATCH_FORM) return;
		recentUtteredWord = RECENT_WORDS.WATCH_FORM;
		if (score < 70) {
			this.speak('Watch your form', 'form', 'normal');
		}
	}

	saySafetyAlert(): void {
		this.speak('Stop! Adjust your posture to avoid injury.', 'safety', 'urgent');
	}
}

// Singleton export — one instance shared across the app
export const voiceCoach = new VoiceCoachService();
