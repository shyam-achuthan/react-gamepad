# React Gamepad Hook

[![npm version](https://img.shields.io/npm/v/react-gamepad-tl.svg)](https://www.npmjs.com/package/react-gamepad-tl)
[![npm downloads](https://img.shields.io/npm/dm/react-gamepad-tl.svg)](https://www.npmjs.com/package/react-gamepad-tl)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A lightweight, easy-to-use React hook for integrating gamepad/controller support in your React applications. This hook makes it simple to use gamepads in React without complex setup or external dependencies.

## Features

- 🎮 Easy integration with React components
- 🕹️ Support for multiple controllers
- 📊 Analog stick values with customizable deadzone
- 🔄 Real-time updates with configurable polling
- 🔌 Automatic connection/disconnection handling
- 📱 Support for pressure-sensitive buttons
- 📝 TypeScript support
- 🪶 Lightweight with zero dependencies

## Installation

```bash
# npm
npm install react-gamepad-tl

# yarn
yarn add react-gamepad-tl

# pnpm
pnpm add react-gamepad-tl
```

## Basic Usage

```jsx
import React from "react";
import { useGamepad } from "react-gamepad-tl";

function GameControls() {
  const { isGamepadConnected, isButtonPressed, getAxisValue } = useGamepad();

  // Check if the "A" button (index 0) is pressed
  const isJumping = isButtonPressed(0);

  // Get left stick horizontal movement (-1.0 to 1.0)
  const moveX = getAxisValue(0);

  // Get left stick vertical movement (-1.0 to 1.0)
  const moveY = getAxisValue(1);

  return (
    <div>
      <p>Controller: {isGamepadConnected ? "Connected" : "Disconnected"}</p>
      <p>
        Movement: X: {moveX.toFixed(2)}, Y: {moveY.toFixed(2)}
      </p>
      <p>Jump: {isJumping ? "Yes" : "No"}</p>
    </div>
  );
}
```

## Complete Example

This example shows how to create a more complete gamepad visualization:

```jsx
import React, { useState, useEffect } from "react";
import { useGamepad, BUTTON_LABELS, AXIS_LABELS } from "react-gamepad-tl";

function GamepadVisualizer() {
  const [log, setLog] = useState([]);
  const { isGamepadConnected, gamepads, buttonStates, axisStates } = useGamepad(
    { deadzone: 0.1 }
  );

  // Update log when inputs change
  useEffect(() => {
    if (!isGamepadConnected) return;

    const messages = [];

    // Log button presses
    Object.entries(buttonStates).forEach(([padIndex, buttons]) => {
      Object.entries(buttons).forEach(([buttonIndex, state]) => {
        if (state.pressed) {
          const label = BUTTON_LABELS[buttonIndex] || `Button ${buttonIndex}`;
          messages.push(
            `Gamepad ${padIndex}: ${label} (${state.value.toFixed(2)})`
          );
        }
      });
    });

    // Log stick movements
    Object.entries(axisStates).forEach(([padIndex, axes]) => {
      Object.entries(axes).forEach(([axisIndex, value]) => {
        if (value !== 0) {
          const label = AXIS_LABELS[axisIndex] || `Axis ${axisIndex}`;
          messages.push(`Gamepad ${padIndex}: ${label} (${value.toFixed(2)})`);
        }
      });
    });

    if (messages.length > 0) {
      setLog((prev) => [...messages, ...prev].slice(0, 10));
    }
  }, [buttonStates, axisStates, isGamepadConnected]);

  return (
    <div>
      <h1>Gamepad Visualizer</h1>

      {!isGamepadConnected ? (
        <div>No gamepad detected. Please connect a controller.</div>
      ) : (
        <div>
          <h2>Connected Controllers:</h2>
          {Object.values(gamepads).map((gamepad) => (
            <div key={gamepad.index}>
              {gamepad.id} (Index: {gamepad.index})
            </div>
          ))}
        </div>
      )}

      <h2>Input Log:</h2>
      <ul>
        {log.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
```

## API Reference

### `useGamepad(options?)`

The main hook for accessing gamepad functionality.

#### Options

| Option         | Type     | Default | Description                                    |
| -------------- | -------- | ------- | ---------------------------------------------- |
| `deadzone`     | `number` | `0.1`   | Minimum threshold for axis movements (0.0-1.0) |
| `pollInterval` | `number` | `16`    | How often to check for updates (milliseconds)  |

#### Return Value

| Property                   | Type                                                     | Description                                        |
| -------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| `isGamepadConnected`       | `boolean`                                                | Whether at least one gamepad is connected          |
| `gamepads`                 | `Record<number, Gamepad>`                                | Object containing all connected gamepads           |
| `buttonStates`             | `Record<number, Record<number, ButtonState>>`            | Object containing all button states                |
| `axisStates`               | `Record<number, Record<number, number>>`                 | Object containing all axis values                  |
| `isButtonPressed`          | `(buttonIndex: number) => boolean`                       | Check if a button is pressed on any gamepad        |
| `isButtonPressedOnGamepad` | `(gamepadIndex: number, buttonIndex: number) => boolean` | Check if a button is pressed on a specific gamepad |
| `getAxisValue`             | `(axisIndex: number) => number`                          | Get the value of an axis from any gamepad          |
| `getAxisValueForGamepad`   | `(gamepadIndex: number, axisIndex: number) => number`    | Get the value of an axis from a specific gamepad   |

### Constants

The package exports common mappings to help identify buttons and axes:

```jsx
import { BUTTON_LABELS, AXIS_LABELS } from "react-gamepad-tl";

console.log(BUTTON_LABELS[0]); // "A / Cross"
console.log(AXIS_LABELS[0]); // "Left Stick Horizontal"
```

## Advanced Usage

### Game Character Controller

```jsx
import React, { useRef, useEffect } from "react";
import { useGamepad } from "react-gamepad-tl";

function GameCharacter() {
  const characterRef = useRef(null);
  const { isGamepadConnected, isButtonPressed, getAxisValue } = useGamepad();

  useEffect(() => {
    if (!isGamepadConnected) return;

    const gameLoop = () => {
      const character = characterRef.current;
      if (!character) return;

      // Get movement from left stick
      const moveX = getAxisValue(0);
      const moveY = getAxisValue(1);

      // Get current position
      const currentX = parseFloat(character.style.left || "0");
      const currentY = parseFloat(character.style.top || "0");

      // Update position based on stick input
      character.style.left = `${currentX + moveX * 5}px`;
      character.style.top = `${currentY + moveY * 5}px`;

      // Handle jumping with A button
      if (isButtonPressed(0)) {
        character.classList.add("jumping");
        setTimeout(() => {
          character.classList.remove("jumping");
        }, 500);
      }

      requestAnimationFrame(gameLoop);
    };

    const frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [isGamepadConnected, isButtonPressed, getAxisValue]);

  return (
    <div className="game-container">
      <div
        ref={characterRef}
        className="character"
        style={{ position: "absolute", left: "50%", top: "50%" }}
      />

      {!isGamepadConnected && (
        <div className="warning">Please connect a controller to play</div>
      )}
    </div>
  );
}
```

### Multiple Controllers Support

```jsx
import React from "react";
import { useGamepad } from "react-gamepad-tl";

function MultiplayerGame() {
  const { gamepads, isButtonPressedOnGamepad, getAxisValueForGamepad } =
    useGamepad();

  // Process player 1 (gamepad 0) inputs
  const player1 = {
    moveX: getAxisValueForGamepad(0, 0),
    moveY: getAxisValueForGamepad(0, 1),
    isJumping: isButtonPressedOnGamepad(0, 0),
    isFiring: isButtonPressedOnGamepad(0, 2),
  };

  // Process player 2 (gamepad 1) inputs
  const player2 = {
    moveX: getAxisValueForGamepad(1, 0),
    moveY: getAxisValueForGamepad(1, 1),
    isJumping: isButtonPressedOnGamepad(1, 0),
    isFiring: isButtonPressedOnGamepad(1, 2),
  };

  return (
    <div>
      <h1>Multiplayer Game</h1>
      <div>Connected controllers: {Object.keys(gamepads).length}</div>

      <div className="player">
        <h2>Player 1</h2>
        <p>
          Movement: X: {player1.moveX.toFixed(2)}, Y: {player1.moveY.toFixed(2)}
        </p>
        <p>
          Actions: Jump: {player1.isJumping ? "Yes" : "No"}, Fire:{" "}
          {player1.isFiring ? "Yes" : "No"}
        </p>
      </div>

      <div className="player">
        <h2>Player 2</h2>
        <p>
          Movement: X: {player2.moveX.toFixed(2)}, Y: {player2.moveY.toFixed(2)}
        </p>
        <p>
          Actions: Jump: {player2.isJumping ? "Yes" : "No"}, Fire:{" "}
          {player2.isFiring ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
}
```

## Common Controller Mappings

Different controllers may have slightly different button/axis mappings. Here are some common ones:

### Standard Button Mapping

| Button Index | Xbox Controller   | PlayStation Controller |
| ------------ | ----------------- | ---------------------- |
| 0            | A                 | Cross (X)              |
| 1            | B                 | Circle (O)             |
| 2            | X                 | Square (□)             |
| 3            | Y                 | Triangle (△)           |
| 4            | LB                | L1                     |
| 5            | RB                | R1                     |
| 6            | LT                | L2                     |
| 7            | RT                | R2                     |
| 8            | Back/View         | Share                  |
| 9            | Start/Menu        | Options                |
| 10           | Left Stick Press  | L3                     |
| 11           | Right Stick Press | R3                     |
| 12           | D-pad Up          | D-pad Up               |
| 13           | D-pad Down        | D-pad Down             |
| 14           | D-pad Left        | D-pad Left             |
| 15           | D-pad Right       | D-pad Right            |
| 16           | Xbox/Guide        | PS Button              |

### Standard Axis Mapping

| Axis Index | Control                                     |
| ---------- | ------------------------------------------- |
| 0          | Left Stick Horizontal (left: -1, right: 1)  |
| 1          | Left Stick Vertical (up: -1, down: 1)       |
| 2          | Right Stick Horizontal (left: -1, right: 1) |
| 3          | Right Stick Vertical (up: -1, down: 1)      |

## Browser Compatibility

This hook uses the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API), which is supported in:

- Chrome 35+
- Firefox 29+
- Edge 12+
- Safari 10.1+
- Opera 22+

Note that browser support for specific controllers may vary.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
