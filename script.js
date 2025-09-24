"use strict";

// Global state for binary operations
let storedOperand = null;
let storedOperator = null; // 'suma' | 'multiplicacion'

// Error logs storage
const errorLogs = [];

// Helpers
const $ = (sel) => document.querySelector(sel);
const setInfo = (message) => { $("#info").textContent = message; };
const showLoader = (show) => { const el = $("#loader"); el.setAttribute("aria-hidden", show ? "false" : "true"); };

// Validation
const validar = (raw) => {
  if (raw == null) {
    return { ok: false, type: "empty", message: "Entrada vacía" };
  }
  const s = String(raw).trim();
  if (s.length === 0) {
    return { ok: false, type: "empty", message: "Entrada vacía" };
  }
  // Accept decimal with sign
  const num = Number(s.replace(",", "."));
  if (!Number.isNaN(num)) {
    return { ok: true, kind: "number", value: num };
  }
  // CSV list: numbers separated by commas
  if (s.includes(",")) {
    const parts = s.split(",").map((x) => x.trim()).filter((x) => x.length > 0);
    if (parts.length === 0) {
      return { ok: false, type: "csv-empty", message: "Lista CSV vacía" };
    }
    const values = parts.map((p) => Number(p.replace(",", ".")));
    if (values.some((v) => Number.isNaN(v))) {
      return { ok: false, type: "csv-invalid", message: "CSV contiene valores no numéricos" };
    }
    return { ok: true, kind: "csv", value: values };
  }
  return { ok: false, type: "invalid", message: "Entrada no válida" };
};

// Info field updater
const rellenar_info = (result, context = "calculo") => {
  if (typeof result === "number") {
    if (result < 100) {
      setInfo(`Operación: ${context}. Info: El resultado es menor que 100`);
    } else if (result <= 200) {
      setInfo(`Operación: ${context}. Info: El resultado está entre 100 y 200`);
    } else {
      setInfo(`Operación: ${context}. Info: El resultado es superior a 200`);
    }
  } else if (Array.isArray(result)) {
    setInfo(`Operación: ${context}. Lista de valores procesada (${result.length})`);
  } else {
    setInfo(`Operación: ${context}. Resultado listo`);
  }
};

// Error handling
const logError = (where, message, detail) => {
  const entry = { time: new Date().toISOString(), where, message, detail };
  errorLogs.push(entry);
  $("#info").textContent = `Error: ${message}`;
};

const downloadLogs = () => {
  const blob = new Blob([JSON.stringify(errorLogs, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `calculadora-logs-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Unary operations (arrow functions)
const writeDisplay = (value) => { $("#display").value = String(value); };
const readDisplayNumber = () => {
  const res = validar($("#display").value);
  if (!res.ok || res.kind !== "number") { throw new Error(res.message || "Entrada no válida"); }
  return res.value;
};

const cuadrado = () => { try { const x = readDisplayNumber(); const y = x * x; writeDisplay(y); rellenar_info(y, "Cuadrado"); } catch (e) { logError("cuadrado", e.message); } };
const cubo = () => { try { const x = readDisplayNumber(); const y = x * x * x; writeDisplay(y); rellenar_info(y, "Cubo"); } catch (e) { logError("cubo", e.message); } };
const sqrt = () => { try { const x = readDisplayNumber(); if (x < 0) { setInfo("Operación: Raíz. Número negativo"); }
  const y = Math.sqrt(x); writeDisplay(y); rellenar_info(y, "Raíz cuadrada"); } catch (e) { logError("sqrt", e.message); } };
const powN = () => { try { const x = readDisplayNumber(); const nRes = validar($("#exp-input").value); if (!nRes.ok || nRes.kind !== "number") throw new Error("Exponente inválido"); const y = Math.pow(x, nRes.value); writeDisplay(y); rellenar_info(y, "Potencia n"); } catch (e) { logError("pow-n", e.message); } };
const mod = () => { try { const x = readDisplayNumber(); const y = x < 0 ? -x : x; writeDisplay(y); rellenar_info(y, "Módulo"); } catch (e) { logError("modulo", e.message); } };

// Factorial with validation for non-negative integers and range
const fact = () => {
  try {
    const x = readDisplayNumber();
    if (!Number.isInteger(x) || x < 0) throw new Error("Factorial solo para enteros no negativos");
    let acc = 1;
    for (let i = 2; i <= x; i += 1) acc *= i;
    writeDisplay(acc);
    rellenar_info(acc, "Factorial");
  } catch (e) { logError("factorial", e.message); }
};

// Binary operations
const setOperator = (op) => {
  try {
    const x = readDisplayNumber();
    storedOperand = x;
    storedOperator = op; // 'suma' | 'multiplicacion'
    setInfo(`Operación pendiente: ${op}`);
    $("#display").value = "";
  } catch (e) { logError("setOperator", e.message); }
};

const eq = () => {
  try {
    if (storedOperator == null || storedOperand == null) return;
    const y = readDisplayNumber();
    let result = null;
    if (storedOperator === "suma") result = storedOperand + y;
    if (storedOperator === "multiplicacion") result = storedOperand * y;
    writeDisplay(result);
    rellenar_info(result, storedOperator === "suma" ? "Suma" : "Multiplicación");
    storedOperand = null; storedOperator = null;
  } catch (e) { logError("igual", e.message); }
};

// CSV helpers
const readCSV = () => {
  const res = validar($("#csv-input").value);
  if (!res.ok || res.kind !== "csv") { throw new Error(res.message || "CSV inválido"); }
  return res.value;
};

const sumatorio = async () => {
  showLoader(true);
  try {
    const arr = readCSV();
    const s = arr.reduce((a, b) => a + b, 0);
    writeDisplay(s);
    rellenar_info(s, "Sumatorio CSV");
  } catch (e) { logError("sumatorio", e.message); }
  finally { showLoader(false); }
};

const ordenar = async () => {
  showLoader(true);
  try {
    const arr = readCSV();
    const sorted = [...arr].sort((a, b) => a - b);
    $("#csv-input").value = sorted.join(", ");
    rellenar_info(sorted, "Ordenar CSV");
  } catch (e) { logError("ordenar", e.message); }
  finally { showLoader(false); }
};

const revertir = async () => {
  showLoader(true);
  try {
    const arr = readCSV();
    const rev = [...arr].reverse();
    $("#csv-input").value = rev.join(", ");
    rellenar_info(rev, "Revertir CSV");
  } catch (e) { logError("revertir", e.message); }
  finally { showLoader(false); }
};

const quitar = async () => {
  showLoader(true);
  try {
    const arr = readCSV();
    if (arr.length === 0) throw new Error("Lista CSV vacía");
    arr.pop();
    $("#csv-input").value = arr.join(", ");
    rellenar_info(arr, "Quitar último CSV");
  } catch (e) { logError("quitar", e.message); }
  finally { showLoader(false); }
};

const media = async () => {
  showLoader(true);
  try {
    const arr = readCSV();
    if (arr.length === 0) throw new Error("Lista CSV vacía");
    const s = arr.reduce((a, b) => a + b, 0);
    const m = s / arr.length;
    writeDisplay(m);
    rellenar_info(m, "Media CSV");
  } catch (e) { logError("media", e.message); }
  finally { showLoader(false); }
};

const quitarEspecifico = async () => {
  showLoader(true);
  try {
    const arr = readCSV();
    const valRes = validar($("#remove-value").value);
    if (!valRes.ok || valRes.kind !== "number") throw new Error("Valor a quitar inválido");
    const target = valRes.value;
    const idx = arr.findIndex((v) => Object.is(v, target));
    if (idx === -1) throw new Error("Valor no encontrado en CSV");
    arr.splice(idx, 1);
    $("#csv-input").value = arr.join(", ");
    rellenar_info(arr, "Quitar específico CSV");
  } catch (e) { logError("quitar-especifico", e.message); }
  finally { showLoader(false); }
};

// Plotting
const clearCanvas = (ctx, w, h) => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#0f142e"; ctx.fillRect(0, 0, w, h); };
const drawAxes = (ctx, w, h) => {
  ctx.strokeStyle = "#445"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, h - 30); ctx.lineTo(w - 10, h - 30); // X axis
  ctx.moveTo(40, 10); ctx.lineTo(40, h - 30); // Y axis
  ctx.stroke();
};

const plotCSV = (ctx, w, h, data) => {
  if (data.length === 0) return;
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const padLeft = 40; const padBottom = 30;
  const plotW = w - padLeft - 10; const plotH = h - padBottom - 10;
  const scaleY = (v) => {
    if (maxV === minV) return plotH / 2;
    return plotH - ((v - minV) / (maxV - minV)) * plotH;
  };
  const stepX = plotW / Math.max(1, data.length - 1);
  ctx.strokeStyle = "#4aa3ff"; ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = padLeft + i * stepX;
    const y = 10 + scaleY(v);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
};

const plotFunction = (ctx, w, h, fn) => {
  const padLeft = 40; const padBottom = 30;
  const plotW = w - padLeft - 10; const plotH = h - padBottom - 10;
  const samples = 200;
  const xMin = -10; const xMax = 10;
  ctx.strokeStyle = "#3ddc97"; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const x = xMin + t * (xMax - xMin);
    const y = fn(x);
    const sx = padLeft + (t * plotW);
    const sy = 10 + (plotH - ((y + 10) / 20) * plotH); // map y from [-10,10]
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
};

const handlePlot = () => {
  const canvas = $("#chart");
  const ctx = canvas.getContext("2d");
  const w = canvas.width; const h = canvas.height;
  clearCanvas(ctx, w, h);
  drawAxes(ctx, w, h);
  const mode = $("#plot-select").value;
  if (mode === "csv") {
    try { const arr = readCSV(); plotCSV(ctx, w, h, arr); setInfo("Operación: Gráfico CSV"); } catch (e) { logError("plot-csv", e.message); }
  } else if (mode === "sin") {
    plotFunction(ctx, w, h, (x) => Math.sin(x)); setInfo("Operación: Gráfico sin(x)");
  } else if (mode === "cos") {
    plotFunction(ctx, w, h, (x) => Math.cos(x)); setInfo("Operación: Gráfico cos(x)");
  } else if (mode === "x2") {
    plotFunction(ctx, w, h, (x) => x * x / 5); setInfo("Operación: Gráfico x^2");
  }
};

// UI wiring
const highlight = (el) => { el.classList.add("active"); window.setTimeout(() => el.classList.remove("active"), 100); };

const onReady = () => {
  // Digits and dot
  document.querySelectorAll('.key[data-digit]').forEach((btn) => {
    btn.addEventListener('click', () => { const d = btn.getAttribute('data-digit'); $("#display").value += d; highlight(btn); });
  });

  // Functions
  $("#clear").addEventListener('click', (e) => { $("#display").value = ""; highlight(e.currentTarget); });
  $("#backspace").addEventListener('click', (e) => { const s = $("#display").value; $("#display").value = s.slice(0, -1); highlight(e.currentTarget); });
  $("#cuadrado").addEventListener('click', (e) => { cuadrado(); highlight(e.currentTarget); });
  $("#cubo").addEventListener('click', (e) => { cubo(); highlight(e.currentTarget); });
  $("#sqrt").addEventListener('click', (e) => { sqrt(); highlight(e.currentTarget); });
  $("#pow-n").addEventListener('click', (e) => { powN(); highlight(e.currentTarget); });
  $("#modulo").addEventListener('click', (e) => { mod(); highlight(e.currentTarget); });
  $("#factorial").addEventListener('click', (e) => { fact(); highlight(e.currentTarget); });

  // Binary ops
  $("#suma").addEventListener('click', (e) => { setOperator('suma'); highlight(e.currentTarget); });
  $("#multiplicacion").addEventListener('click', (e) => { setOperator('multiplicacion'); highlight(e.currentTarget); });
  $("#igual").addEventListener('click', (e) => { eq(); highlight(e.currentTarget); });

  // CSV
  $("#sumatorio").addEventListener('click', (e) => { sumatorio(); highlight(e.currentTarget); });
  $("#ordenar").addEventListener('click', (e) => { ordenar(); highlight(e.currentTarget); });
  $("#revertir").addEventListener('click', (e) => { revertir(); highlight(e.currentTarget); });
  $("#quitar").addEventListener('click', (e) => { quitar(); highlight(e.currentTarget); });
  $("#media").addEventListener('click', (e) => { media(); highlight(e.currentTarget); });
  $("#quitar-especifico").addEventListener('click', (e) => { quitarEspecifico(); highlight(e.currentTarget); });

  // Plot
  $("#plot-btn").addEventListener('click', handlePlot);

  // Logs
  $("#download-logs").addEventListener('click', downloadLogs);

  // Keyboard shortcuts
  window.addEventListener('keydown', (ev) => {
    const k = ev.key;
    if (/^[0-9]$/.test(k)) { $("#display").value += k; }
    else if (k === "." || k === ",") { $("#display").value += "."; }
    else if (k === "Backspace") { const s = $("#display").value; $("#display").value = s.slice(0, -1); }
    else if (k === "Escape") { $("#display").value = ""; }
    else if (k === "+") { setOperator('suma'); }
    else if (k === "*") { setOperator('multiplicacion'); }
    else if (k === "Enter" || k === "=") { eq(); }
    else if (k.toLowerCase() === "s") { sqrt(); }
    else if (k.toLowerCase() === "m") { mod(); }
    else if (k.toLowerCase() === "f") { fact(); }
  });
};

document.addEventListener('DOMContentLoaded', onReady);


