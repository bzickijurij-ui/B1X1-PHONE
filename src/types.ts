export type ThemeMode = 'dark' | 'light';
export type AnimationStyle = 'oneui7' | 'ios18';

export interface SystemSettings {
  theme: ThemeMode;
  iconTintColor: string; // Hex or tailwind color class
  iconTintStyle: 'original' | 'tinted';
  animationSpeed: number; // 0.5 to 2.0
  animationStyle: AnimationStyle;
  transitionSoundsEnabled?: boolean;
}

export interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'sysinfo' | 'shortcuts' | 'calendar' | 'player';
  title: string;
  x: number;
  y: number;
  w: number; // grid sizes
  h: number;
}

export interface AppIcon {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // original color
  category: string;
}

export interface CapturedPhoto {
  id: string;
  url: string;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface UserNote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}
