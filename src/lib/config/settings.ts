export type SettingType = 'boolean' | 'string' | 'select';

export interface SettingDefinition {
	key: string;
	label: string;
	type: SettingType;
	default: boolean | string;
	category: string;
	icon: string;
	options?: readonly string[];
}

export const settingsConfig: SettingDefinition[] = [
	{
		key: 'realTimeVoiceAlerts',
		label: 'Real-Time Voice Alerts',
		type: 'boolean',
		default: true,
		category: 'Virtual Coach Settings',
		icon: 'Volume2'
	},
	{
		key: 'realTimeFormCorrection',
		label: 'Real-Time Form Correction',
		type: 'boolean',
		default: true,
		category: 'Virtual Coach Settings',
		icon: 'ShieldCheck'
	},
	{
		key: 'gestureAutoCounting',
		label: 'Gesture Auto-Counting',
		type: 'boolean',
		default: true,
		category: 'Virtual Coach Settings',
		icon: 'Activity'
	},
	{
		key: 'darkmode',
		label: 'Dark Mode',
		type: 'boolean',
		default: false,
		category: 'UI Settings',
		icon: 'Moon'
	},
	{
		key: 'defaultCamera',
		label: 'Default Camera',
		type: 'select',
		default: 'Front Camera',
		category: 'Hardware & Camera',
		icon: 'Camera',
		options: ['Front Camera', 'Back Camera']
	}
];
