/**
 * SoundCN (https://www.soundcn.xyz/)
 * Curated UI Sound Effects encoded as clean audio data URIs for zero-dependency playback.
 */

// Synthesized short sine/square/triangle wave base64 sounds for instant playback without external network calls
export const SOUNDS = {
  // Crisp click sound
  click: "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...",
  // Soft pop sound
  pop: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACBhYq...",
  // Switch toggle sound
  switch: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACA...",
  // Success notification
  success: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACA...",
  // Gentle tap
  tap: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACA...",
};

export type SoundType = keyof typeof SOUNDS;
