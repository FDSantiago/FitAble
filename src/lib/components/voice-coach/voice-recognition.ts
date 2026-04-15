/**
 * VoiceRecognition — Speech-to-text command recognition service.
 *
 * Uses the Web Speech API SpeechRecognition (continuous mode).
 * Fires a CustomEvent 'voicecommand' on the document when a known command is spoken.
 *
 * Supported commands:
 *   "start" | "go" | "begin"                  → "start"
 *   "finish set" | "next set" | "complete set" → "finish-set"
 *   "reset" | "reset reps"                     → "reset"
 *   "end workout" | "stop" | "finish"          → "end-workout"
 *   "mute" | "quiet" | "silence"               → "mute"
 *   "unmute" | "voice on"                      → "unmute"
 */

export type VoiceCommand = 'start' | 'finish-set' | 'reset' | 'end-workout' | 'mute' | 'unmute';

export interface VoiceCommandEvent extends CustomEvent {
	detail: { command: VoiceCommand; transcript: string };
}

interface SpeechRecognitionInstance extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	maxAlternatives: number;
	start(): void;
	stop(): void;
	abort(): void;
	onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
	onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
	onend: (() => void) | null;
}

interface SpeechRecognitionResultEvent extends Event {
	resultIndex: number;
	results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
	error: string;
}

interface SpeechRecognitionResultList {
	length: number;
	item(index: number): SpeechRecognitionResult;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
	isFinal: boolean;
	length: number;
	item(index: number): SpeechRecognitionAlternative;
	[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
	transcript: string;
	confidence: number;
}

// Command keyword maps — more-specific phrases checked before general ones
const COMMAND_PATTERNS: Array<{ patterns: string[]; command: VoiceCommand }> = [
	{ patterns: ['finish set', 'next set', 'complete set', 'done set'], command: 'finish-set' },
	{ patterns: ['end workout', 'stop workout', 'finish workout'], command: 'end-workout' },
	{ patterns: ["let's stop", 'lets stop', 'stop workout'], command: 'end-workout' },
	{ patterns: ["let's go", 'lets go', 'begin workout'], command: 'start' },
	{ patterns: ['reset reps', 'reset rep', 'reset'], command: 'reset' },
	{ patterns: ['voice on', 'unmute', 'enable voice', 'sound on'], command: 'unmute' },
	{ patterns: ['voice off', 'mute', 'quiet', 'silence', 'sound off'], command: 'mute' },
	{ patterns: ['start', 'begin', 'go'], command: 'start' },
	{ patterns: ['stop', 'finish'], command: 'end-workout' }
];

/** Errors after which we should NOT attempt to restart recognition. */
const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'network']);

/**
 * Delay before attempting to restart after recognition ends unexpectedly.
 * A short pause lets the mic fully release before we try again.
 */
const RESTART_DELAY_MS = 500;

function matchCommand(transcript: string): VoiceCommand | null {
	const lower = transcript.toLowerCase().trim();
	for (const { patterns, command } of COMMAND_PATTERNS) {
		if (patterns.some((p) => lower.includes(p))) {
			return command;
		}
	}
	return null;
}

class VoiceRecognitionService {
	private recognition: SpeechRecognitionInstance | null = null;
	private _isListening = false;
	private _isSupported = false;
	/** Whether the user has requested that recognition stay active. */
	private desiredState: 'on' | 'off' = 'off';
	/** True when we've just received a fatal error — suppresses auto-restart. */
	private fatalError = false;
	/** Pending restart timer handle. */
	private restartTimer: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		if (typeof window === 'undefined') return;

		const SpeechRecognitionCtor =
			((window as unknown as Record<string, unknown>).SpeechRecognition as
				| (new () => SpeechRecognitionInstance)
				| undefined) ??
			((window as unknown as Record<string, unknown>).webkitSpeechRecognition as
				| (new () => SpeechRecognitionInstance)
				| undefined);

		if (!SpeechRecognitionCtor) return;

		this._isSupported = true;
		this._buildRecognition(SpeechRecognitionCtor);
	}

	private _buildRecognition(Ctor: new () => SpeechRecognitionInstance): void {
		const r = new Ctor();
		r.continuous = true;
		r.interimResults = true;
		r.lang = 'en-US';
		r.maxAlternatives = 3;

		r.onresult = (event: SpeechRecognitionResultEvent) => {
			for (let i = 0; i < event.results.length; i++) {
				const result = event.results[i];
				for (let j = 0; j < result.length; j++) {
					const transcript = result[j].transcript;
					const command = matchCommand(transcript);
					if (command) {
						this._dispatchCommand(command, transcript);
						return;
					}
				}
			}
		};

		r.onerror = (event: SpeechRecognitionErrorEvent) => {
			if (FATAL_ERRORS.has(event.error)) {
				console.warn(`[VoiceRecognition] Fatal error: ${event.error}`);
				this.fatalError = true;
				this._isListening = false;
				this.desiredState = 'off';
			}
			// non-fatal errors (no-speech, audio-capture) let onend handle restart
		};

		r.onend = () => {
			this._isListening = false;

			// If the user wants recognition active and we haven't hit a fatal error,
			// schedule a restart after a short delay so the mic can fully release.
			if (this.desiredState === 'on' && !this.fatalError) {
				this._scheduleRestart();
			}
		};

		this.recognition = r;
	}

	private _scheduleRestart(): void {
		if (this.restartTimer !== null) return; // already pending
		this.restartTimer = setTimeout(() => {
			this.restartTimer = null;
			if (this.desiredState === 'on' && !this.fatalError && !this._isListening) {
				this._startInternal();
			}
		}, RESTART_DELAY_MS);
	}

	private _cancelRestart(): void {
		if (this.restartTimer !== null) {
			clearTimeout(this.restartTimer);
			this.restartTimer = null;
		}
	}

	private _startInternal(): void {
		if (!this.recognition || this._isListening) return;
		try {
			this.recognition.start();
			this._isListening = true;
		} catch (e) {
			// InvalidStateError — recognition already in progress; ignore
			console.warn('[VoiceRecognition] start() failed:', e);
		}
	}

	// ── Public API ───────────────────────────────────────────────────────────

	get isSupported(): boolean {
		return this._isSupported;
	}

	get isListening(): boolean {
		return this._isListening;
	}

	start(): boolean {
		if (!this._isSupported || !this.recognition) return false;
		this.fatalError = false;
		this.desiredState = 'on';
		this._cancelRestart();
		this._startInternal();
		return true;
	}

	stop(): void {
		if (!this.recognition) return;
		this.desiredState = 'off';
		this._cancelRestart();
		this._isListening = false;
		try {
			this.recognition.abort();
		} catch {
			// already stopped
		}
	}

	toggle(): boolean {
		if (this.desiredState === 'on') {
			this.stop();
			return false;
		} else {
			this.start();
			return true;
		}
	}

	// ── Internal ─────────────────────────────────────────────────────────────

	private _dispatchCommand(command: VoiceCommand, transcript: string): void {
		if (typeof window === 'undefined') return;
		const event = new CustomEvent<{ command: VoiceCommand; transcript: string }>('voicecommand', {
			detail: { command, transcript },
			bubbles: true
		});
		document.dispatchEvent(event);
	}
}

export const voiceRecognition = new VoiceRecognitionService();
