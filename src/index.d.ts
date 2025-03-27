export interface GamepadHookOptions {
    /** Minimum threshold for axis movement (0.0 to 1.0) */
    deadzone?: number;
    /** How often to check for updates in milliseconds */
    pollInterval?: number;
  }
  
  export interface ButtonState {
    /** Whether the button is currently pressed */
    pressed: boolean;
    /** Pressure value (0.0 to 1.0) */
    value: number;
    /** Whether the button is being touched (not all controllers support this) */
    touched?: boolean;
  }
  
  export interface GamepadHookReturn {
    /** Whether at least one gamepad is connected */
    isGamepadConnected: boolean;
    /** Object containing all connected gamepads, keyed by index */
    gamepads: Record<number, Gamepad>;
    /** Object containing all button states for all gamepads */
    buttonStates: Record<number, Record<number, ButtonState>>;
    /** Object containing all axis values for all gamepads */
    axisStates: Record<number, Record<number, number>>;
    
    /** Check if a specific button is pressed on any gamepad */
    isButtonPressed: (buttonIndex: number) => boolean;
    
    /** Check if a specific button is pressed on a specific gamepad */
    isButtonPressedOnGamepad: (gamepadIndex: number, buttonIndex: number) => boolean;
    
    /** Get the value of a specific axis on any gamepad */
    getAxisValue: (axisIndex: number) => number;
    
    /** Get the value of a specific axis on a specific gamepad */
    getAxisValueForGamepad: (gamepadIndex: number, axisIndex: number) => number;
  }
  
  /** React hook for gamepad/controller input */
  export function useGamepad(options?: GamepadHookOptions): GamepadHookReturn;
  
  /** Common button mappings (may vary by controller/browser) */
  export const BUTTON_LABELS: Record<number, string>;
  
  /** Common axis mappings (may vary by controller/browser) */
  export const AXIS_LABELS: Record<number, string>;