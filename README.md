# CPU Instruction Cycle Simulator

A live, interactive simulator that shows how a CPU runs a program using the **Fetch → Decode → Execute** instruction cycle. It is built with HTML, CSS and JavaScript.

## Live Demo

https://sharonpeter669966-bit.github.io/instruction-cycle-stimulatorr/

## Features

- Step through the cycle one micro-step at a time, or run it automatically
- Run, Step, Pause and Reset controls, with a speed slider
- Live registers: PC, MAR, MDR, IR and ACC, which flash when they change
- 16-cell memory view that highlights the PC and MAR addresses
- Execution log that records every step
- Cycle counter and a colored Fetch / Decode / Execute phase indicator

## Instruction Set

| Instruction | What it does |
|-------------|--------------|
| LOAD addr   | Copies the value at the address into ACC |
| ADD addr    | Adds the value at the address to ACC |
| SUB addr    | Subtracts the value at the address from ACC |
| STORE addr  | Saves ACC into the memory address |
| JMP addr    | Jumps to the given address |
| HALT        | Stops the program |

## Sample Program

The simulator runs this program: `ACC = 5 + 7 - 3`, then stores the result (9) at address 10.

| Address | Content |
|---------|---------|
| 0 | LOAD 8 |
| 1 | ADD 9 |
| 2 | SUB 11 |
| 3 | STORE 10 |
| 4 | HALT |
| 8 | 5 |
| 9 | 7 |
| 11 | 3 |

## How the Instruction Cycle Works

1. **Fetch:** the address in PC is copied to MAR, the instruction is read from memory into MDR, then copied into IR, and PC is increased by 1.
2. **Decode:** the instruction in IR is split into an opcode and an operand address.
3. **Execute:** the CPU performs the operation, such as loading, adding or storing a value.

## How to Run

1. Download or clone this repository.
2. Open `index.html` in a browser (or use the Live Server extension in VS Code).
3. Click **Run** or **Step** to start the simulation.

## Files

- `index.html`: page structure
- `style.css`: colors and layout
- `script.js`: CPU logic and simulation

## Author

Sharon Peter
