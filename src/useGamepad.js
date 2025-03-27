import { useState, useEffect, useRef } from "react";

/**
 * React hook for gamepad/controller input
 * @param {Object} options - Configuration options
 * @param {number} [options.deadzone=0.1] - Minimum threshold for axis movement
 * @param {number} [options.pollInterval=16] - How often to check for updates (ms)
 * @returns {Object} Gamepad state and utilities
 */
export const useGamepad = (options = {}) => {
  const { deadzone = 0.1, pollInterval = 16 } = options;

  // State for connected gamepads and button/axis values
  const [gamepads, setGamepads] = useState({});
  const [buttonStates, setButtonStates] = useState({});
  const [axisStates, setAxisStates] = useState({});
  const [isGamepadConnected, setIsGamepadConnected] = useState(false);

  // Refs to store previous state for comparison
  const prevTimestamps = useRef({});
  const intervalRef = useRef(null);

  // Handle gamepad connection
  const handleGamepadConnected = (event) => {
    const { gamepad } = event;
    console.log(`Gamepad connected at index ${gamepad.index}: ${gamepad.id}`);

    setGamepads((prev) => ({
      ...prev,
      [gamepad.index]: gamepad,
    }));

    prevTimestamps.current[gamepad.index] = 0;
    setIsGamepadConnected(true);
  };

  // Handle gamepad disconnection
  const handleGamepadDisconnected = (event) => {
    const { gamepad } = event;
    console.log(
      `Gamepad disconnected from index ${gamepad.index}: ${gamepad.id}`
    );

    setGamepads((prev) => {
      const updated = { ...prev };
      delete updated[gamepad.index];
      return updated;
    });

    setButtonStates((prev) => {
      const updated = { ...prev };
      delete updated[gamepad.index];
      return updated;
    });

    setAxisStates((prev) => {
      const updated = { ...prev };
      delete updated[gamepad.index];
      return updated;
    });

    delete prevTimestamps.current[gamepad.index];

    // Check if any gamepads are still connected
    const remaining = navigator.getGamepads ? navigator.getGamepads() : [];
    const hasConnected = Array.from(remaining).some((gp) => gp !== null);
    setIsGamepadConnected(hasConnected);
  };

  // Function to check gamepad inputs
  const checkGamepadInputs = () => {
    // Get the list of currently connected gamepads
    const currentGamepads = navigator.getGamepads
      ? navigator.getGamepads()
      : [];

    for (let i = 0; i < currentGamepads.length; i++) {
      const gamepad = currentGamepads[i];

      // Skip if the gamepad is null or undefined
      if (!gamepad) continue;

      // Check if the gamepad state has been updated
      if (
        gamepad.timestamp &&
        gamepad.timestamp !== prevTimestamps.current[gamepad.index]
      ) {
        prevTimestamps.current[gamepad.index] = gamepad.timestamp;

        // Update button states
        const padButtons = {};
        gamepad.buttons.forEach((button, index) => {
          padButtons[index] = {
            pressed: button.pressed,
            value: button.value,
            touched: button.touched,
          };
        });

        setButtonStates((prev) => ({
          ...prev,
          [gamepad.index]: padButtons,
        }));

        // Update axis states (filter by deadzone)
        const padAxes = {};
        gamepad.axes.forEach((axisValue, index) => {
          // Only track if value exceeds deadzone
          if (Math.abs(axisValue) > deadzone) {
            padAxes[index] = parseFloat(axisValue.toFixed(4));
          } else {
            padAxes[index] = 0; // Zero out small values
          }
        });

        setAxisStates((prev) => ({
          ...prev,
          [gamepad.index]: padAxes,
        }));
      }
    }
  };

  // Set up event listeners on mount
  useEffect(() => {
    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    // Check for already connected gamepads (browser might have them cached)
    const initialGamepads = navigator.getGamepads
      ? navigator.getGamepads()
      : [];
    const connectedPads = {};
    let hasConnected = false;

    for (let i = 0; i < initialGamepads.length; i++) {
      const gamepad = initialGamepads[i];
      if (gamepad) {
        connectedPads[gamepad.index] = gamepad;
        prevTimestamps.current[gamepad.index] = 0;
        hasConnected = true;
      }
    }

    if (hasConnected) {
      setGamepads(connectedPads);
      setIsGamepadConnected(true);
    }

    // Start polling for updates
    intervalRef.current = setInterval(checkGamepadInputs, pollInterval);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected
      );
      clearInterval(intervalRef.current);
    };
  }, [deadzone, pollInterval]);

  /**
   * Checks if a specific button is pressed on any connected gamepad
   * @param {number} buttonIndex - The button index to check
   * @returns {boolean} True if the button is pressed on any gamepad
   */
  const isButtonPressed = (buttonIndex) => {
    return Object.values(buttonStates).some(
      (padButtons) => padButtons[buttonIndex]?.pressed
    );
  };

  /**
   * Checks if a specific button is pressed on a specific gamepad
   * @param {number} gamepadIndex - The gamepad index
   * @param {number} buttonIndex - The button index to check
   * @returns {boolean} True if the button is pressed
   */
  const isButtonPressedOnGamepad = (gamepadIndex, buttonIndex) => {
    return buttonStates[gamepadIndex]?.[buttonIndex]?.pressed || false;
  };

  /**
   * Gets the value of a specific axis on any gamepad
   * @param {number} axisIndex - The axis index to check
   * @returns {number} The axis value (-1 to 1) or 0 if not found
   */
  const getAxisValue = (axisIndex) => {
    for (const padIndex in axisStates) {
      const value = axisStates[padIndex][axisIndex];
      if (value && Math.abs(value) > deadzone) {
        return value;
      }
    }
    return 0;
  };

  /**
   * Gets the value of a specific axis on a specific gamepad
   * @param {number} gamepadIndex - The gamepad index
   * @param {number} axisIndex - The axis index to check
   * @returns {number} The axis value (-1 to 1) or 0 if not found
   */
  const getAxisValueForGamepad = (gamepadIndex, axisIndex) => {
    return axisStates[gamepadIndex]?.[axisIndex] || 0;
  };

  return {
    isGamepadConnected,
    gamepads,
    buttonStates,
    axisStates,
    isButtonPressed,
    isButtonPressedOnGamepad,
    getAxisValue,
    getAxisValueForGamepad,
  };
};
