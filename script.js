// Program: ACC = mem[8] + mem[9] - mem[11]; mem[10] = ACC
const PROGRAM = [
  "LOAD 8", "ADD 9", "SUB 11", "STORE 10", "HALT",
  0, 0, 0,
  5, 7, 0, 3,
  0, 0, 0, 0
];

let mem, pc, mar, mdr, ir, acc, decoded, step, halted, cycles, timer;

const $ = (id) => document.getElementById(id);
const regEls = { pc: $("reg-pc"), mar: $("reg-mar"), mdr: $("reg-mdr"), ir: $("reg-ir"), acc: $("reg-acc") };

const pad = (n) => (typeof n === "number" ? (n < 0 ? "-" : "") + String(Math.abs(n)).padStart(2, "0") : String(n));

function setReg(name, value) {
  const el = regEls[name];
  const text = pad(value);
  if (el.textContent !== text) {
    el.textContent = text;
    const box = el.parentElement;
    box.classList.remove("flash");
    void box.offsetWidth;
    box.classList.add("flash");
  }
}

function showPhase(phase, label, desc) {
  ["fetch", "decode", "execute"].forEach((p) => $("ph-" + p).classList.toggle("active", p === phase));
  const st = $("stateText");
  st.textContent = label;
  st.className = "state " + (phase || "");
  $("descText").textContent = desc;
}

function renderMemory() {
  const box = $("memory");
  box.innerHTML = "";
  mem.forEach((v, i) => {
    const cell = document.createElement("div");
    cell.className = "cell " + (typeof v === "string" ? "code" : "data");
    if (i === pc) cell.classList.add("pc");
    if (i === mar) cell.classList.add("mar");
    cell.innerHTML = `<small>Addr ${pad(i)}</small>${typeof v === "number" ? pad(v) : v}`;
    box.appendChild(cell);
  });
}

function log(text, kind) {
  const li = document.createElement("li");
  li.className = kind;
  li.textContent = text;
  const list = $("log");
  list.appendChild(li);
  list.scrollTop = list.scrollHeight;
}

function say(phase, text) {
  showPhase(phase, phase.toUpperCase(), text);
  log(text, phase);
}

function updateButtons() {
  $("btnRun").disabled = halted || !!timer;
  $("btnStep").disabled = halted;
  $("btnPause").disabled = !timer;
}

function stopHalted(message) {
  halted = true;
  stopRun();
  showPhase("halt", "HALTED", message);
  log(message, "halt");
  updateButtons();
}

const MICRO = [
  () => { mar = pc; setReg("mar", mar); say("fetch", `MAR ← PC  (MAR = ${pad(mar)})`); },
  () => { mdr = mem[mar]; setReg("mdr", mdr); say("fetch", `MDR ← Memory[${pad(mar)}]  (MDR = ${pad(mdr)})`); },
  () => {
    ir = mdr; pc = pc + 1;
    setReg("ir", ir); setReg("pc", pc);
    say("fetch", `IR ← MDR, PC ← PC + 1  (IR = ${ir}, PC = ${pad(pc)})`);
  },
  () => {
    if (typeof ir !== "string") {
      say("decode", `IR holds data (${ir}), not an instruction`);
      stopHalted("Error: tried to execute data. Simulation stopped.");
      return false;
    }
    const [op, operand] = ir.split(" ");
    decoded = { op, addr: operand === undefined ? null : Number(operand) };
    say("decode", `Decode: opcode = ${op}` + (decoded.addr === null ? "" : `, operand address = ${pad(decoded.addr)}`));
  },
  () => {
    const { op, addr } = decoded;
    if (op === "HALT") {
      say("execute", "Execute HALT: stop the CPU");
      cycles++;
      $("cycles").textContent = cycles;
      stopHalted("Program finished (HALT).");
      return false;
    }
    if (op === "JMP") { pc = addr; setReg("pc", pc); say("execute", `Execute JMP: PC ← ${pad(addr)}`); return; }
    if (op === "STORE") {
      mar = addr; setReg("mar", mar);
      mdr = acc; setReg("mdr", mdr);
      mem[addr] = acc;
      say("execute", `Execute STORE: Memory[${pad(addr)}] ← ACC (${pad(acc)})`);
      return;
    }
    mar = addr; setReg("mar", mar);
    mdr = mem[addr]; setReg("mdr", mdr);
    if (typeof mdr !== "number") { stopHalted(`Error: address ${pad(addr)} holds an instruction, not data.`); return false; }
    if (op === "LOAD") { acc = mdr; say("execute", `Execute LOAD: ACC ← Memory[${pad(addr)}] (${pad(mdr)})`); }
    else if (op === "ADD") { acc = acc + mdr; say("execute", `Execute ADD: ACC ← ACC + ${pad(mdr)}  (ACC = ${pad(acc)})`); }
    else if (op === "SUB") { acc = acc - mdr; say("execute", `Execute SUB: ACC ← ACC - ${pad(mdr)}  (ACC = ${pad(acc)})`); }
    else { stopHalted(`Error: unknown opcode "${op}".`); return false; }
    setReg("acc", acc);
  }
];

function doStep() {
  if (halted) return;
  const result = MICRO[step]();
  if (result === false) { renderMemory(); return; }
  if (step === MICRO.length - 1) { cycles++; $("cycles").textContent = cycles; }
  step = (step + 1) % MICRO.length;
  renderMemory();
}

function startRun() {
  if (timer || halted) return;
  timer = setInterval(doStep, Number($("speed").value));
  updateButtons();
}

function stopRun() {
  clearInterval(timer);
  timer = null;
  updateButtons();
}

function reset() {
  clearInterval(timer);
  timer = null;
  mem = PROGRAM.slice();
  pc = 0; mar = 0; mdr = 0; ir = "---"; acc = 0;
  decoded = null; step = 0; halted = false; cycles = 0;
  setReg("pc", pc); setReg("mar", mar); setReg("mdr", mdr); setReg("acc", acc);
  regEls.ir.textContent = "---";
  document.querySelectorAll(".reg").forEach((r) => r.classList.remove("flash"));
  $("cycles").textContent = "0";
  $("log").innerHTML = "";
  showPhase(null, "READY", "Press Step or Run to begin the instruction cycle.");
  renderMemory();
  updateButtons();
}

$("btnRun").addEventListener("click", startRun);
$("btnStep").addEventListener("click", () => { stopRun(); doStep(); });
$("btnPause").addEventListener("click", stopRun);
$("btnReset").addEventListener("click", reset);
$("speed").addEventListener("input", () => { if (timer) { stopRun(); startRun(); } });

reset();