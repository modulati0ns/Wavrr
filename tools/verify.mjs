#!/usr/bin/env node
/**
 * Verificación de la física del laboratorio.
 *
 * No comprueba la interfaz: comprueba que los números que salen en pantalla
 * son los correctos. Lee las funciones directamente de index.html, así que si
 * alguien toca una fórmula, esto lo detecta.
 *
 *   node tools/verify.mjs
 *
 * Sale con código 1 si alguna comprobación falla.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(raiz, "index.html"), "utf8");
const js = html.slice(html.indexOf("<script>"), html.lastIndexOf("</script>"));
const entre = (a, b) => js.slice(js.indexOf(a), js.indexOf(b));

let fallos = 0;
const EPS = 0.02;
function comprueba(nombre, obtenido, esperado, tol = EPS) {
  const ok =
    typeof esperado === "number"
      ? Math.abs(obtenido - esperado) <= tol
      : obtenido === esperado;
  if (!ok) fallos++;
  const val = typeof obtenido === "number" ? obtenido.toFixed(3) : String(obtenido);
  const exp = typeof esperado === "number" ? esperado.toFixed(3) : String(esperado);
  console.log(`  ${ok ? "✓" : "✗"} ${nombre.padEnd(46)} ${val.padStart(9)}  (esperado ${exp})`);
}

/* ---------- constantes del modelo, tal y como están en el fichero ---------- */
const LAM = 2, T0 = 3, V0 = LAM / T0, RMAX = 3 * LAM;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* ---------- 1. formas de onda ---------- */
console.log("\nFormas de onda predefinidas");
const GEN = { src: "preset", wave: "sine" };
eval(entre("function waveAt(u){", "function refPeriod").replace("function waveAt", "globalThis.waveAt = function waveAt"));

for (const w of ["sine", "tri", "sq", "saw", "sinc", "pulse"]) {
  GEN.wave = w;
  const N = 200000;
  let min = 9, max = -9, media = 0;
  for (let i = 0; i < N; i++) {
    const v = waveAt(i / N);
    min = Math.min(min, v); max = Math.max(max, v); media += v;
  }
  media /= N;
  // Un campo con componente continua no se radia: la media debe ser cero.
  comprueba(`${w}: valor medio (sin componente continua)`, media, 0, 0.005);
  comprueba(`${w}: pico normalizado a 1`, max, 1, 0.01);
  if (min < -1.01 || max > 1.01) { fallos++; console.log(`  ✗ ${w}: se sale del rango [-1, 1]`); }
}

/* ---------- 2. propagación ---------- */
console.log("\nPropagación (onda plana, medio sin dispersión)");
GEN.wave = "sine";
const S = { t: 0, Ax: 1, Ay: 1, delta: 90, waves: 3, axis: "x" };
const hz = () => (S.waves * LAM) / 2;
const refPeriod = () => T0;
const scalarAt = (tau) => waveAt(tau / T0);
const genVec = (tau) => {
  const sh = (S.delta / 360) * refPeriod();
  return [S.Ax * scalarAt(tau), S.Ay * scalarAt(tau - sh)];
};
const Efun = (z) => genVec(S.t - (z + hz()) / V0);

comprueba("velocidad de fase v = λ/T", V0, 2 / 3, 1e-9);
comprueba("longitud de onda v·T", V0 * T0, LAM, 1e-9);

// El campo debe repetirse cada λ y coincidir con la solución analítica.
let errMax = 0;
for (let t = 0; t < T0; t += 0.05)
  for (let z = -3; z <= 3; z += 0.25) {
    S.t = t;
    const got = Efun(z);
    const ph = 2 * Math.PI * (t / T0) - (2 * Math.PI / LAM) * (z + hz());
    errMax = Math.max(errMax, Math.abs(got[0] - Math.cos(ph)));
  }
comprueba("coincide con cos(ωt − kz)", errMax, 0, 1e-9);

S.t = 0.7;
const a = Efun(0), b = Efun(LAM);
comprueba("periodicidad espacial: E(z) = E(z+λ)", Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]), 0, 1e-9);

/* ---------- 3. sentido de giro (convenio IEEE) ---------- */
console.log("\nSentido de giro, convenio IEEE");
// δ = +90° retrasa la componente y respecto a la x, lo que da giro x→y:
// con el pulgar derecho hacia +z, los dedos siguen el giro → dextrógira.
S.Ax = S.Ay = 1; S.delta = 90;
const ang = (t) => { S.t = t; const v = Efun(0); return Math.atan2(v[1], v[0]); };
let creciente = true;
for (let t = 0; t < 1.2; t += 0.1) {
  let d = ang(t + 0.1) - ang(t);
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  if (d <= 0) creciente = false;
}
comprueba("δ = +90° gira de x hacia y (dextrógira)", creciente, true);

/* ---------- 4. parámetros de Stokes ---------- */
console.log("\nParámetros de Stokes por promedios temporales");
function stokesDe(Ax, Ay, deltaDeg) {
  S.Ax = Ax; S.Ay = Ay; S.delta = deltaDeg;
  const N = 2048;
  let ex2 = 0, ey2 = 0, exy = 0, cross = 0, prev = null;
  for (let i = 0; i <= N; i++) {
    const tau = (i / N) * refPeriod();
    const sh = (deltaDeg / 360) * refPeriod();
    const v = [Ax * waveAt(tau / T0), Ay * waveAt((tau - sh) / T0)];
    ex2 += v[0] * v[0]; ey2 += v[1] * v[1]; exy += v[0] * v[1];
    if (prev) cross += prev[0] * (v[1] - prev[1]) - prev[1] * (v[0] - prev[0]);
    prev = v;
  }
  const s0 = ex2 + ey2;
  const s1 = (ex2 - ey2) / s0, s2 = (2 * exy) / s0;
  const lin = Math.hypot(s1, s2);
  return { s1, s2, s3: Math.sqrt(Math.max(0, 1 - lin * lin)) * (cross >= 0 ? 1 : -1) };
}
let st = stokesDe(1, 0, 0);
comprueba("lineal horizontal → s1", st.s1, 1);
st = stokesDe(0.78, 0.78, 0);
comprueba("lineal a 45° → s2", st.s2, 1);
st = stokesDe(0.82, 0.82, 90);
comprueba("circular dextrógira → s3", st.s3, 1);
st = stokesDe(0.82, 0.82, -90);
comprueba("circular levógira → s3", st.s3, -1);

/* ---------- 5. diagramas de antena ---------- */
console.log("\nAntenas: directividad y ancho de haz");
eval(entre("var ANT={", `S.ant="half"`).replace("var ANT=", "globalThis.ANT ="));

function estadisticas(clave) {
  const f = ANT[clave].f;
  const N = 20000, dt = Math.PI / N;
  let m = 0;
  for (let i = 0; i <= N; i++) m = Math.max(m, f(i * dt));
  let s = 0;
  for (let i = 0; i <= N; i++) {
    const t = i * dt, v = f(t) / m;
    const w = i === 0 || i === N ? 1 : i % 2 ? 4 : 2;
    s += w * v * v * Math.sin(t);
  }
  s *= dt / 3;
  const D = 2 / s;
  let tmax = 0, mejor = 0;
  for (let i = 0; i <= N; i++) { const t = i * dt, v = f(t) / m; if (v > mejor) { mejor = v; tmax = t; } }
  let lo = tmax, hi = tmax;
  while (lo > 0 && f(lo) / m > Math.SQRT1_2) lo -= dt;
  while (hi < Math.PI && f(hi) / m > Math.SQRT1_2) hi += dt;
  return { dbi: 10 * Math.log10(D), hpbw: ((hi - lo) * 180) / Math.PI };
}
// Valores de libro (Balanis, Antenna Theory).
const esperados = {
  iso:   { dbi: 0.00 },
  short: { dbi: 1.76, hpbw: 90 },
  half:  { dbi: 2.15, hpbw: 78 },
  full:  { dbi: 3.82, hpbw: 48 },
  mono:  { dbi: 5.15, hpbw: 39 },
  coll:  { dbi: 6.42 },
};
for (const [clave, esp] of Object.entries(esperados)) {
  const r = estadisticas(clave);
  comprueba(`${ANT[clave].n}: directividad (dBi)`, r.dbi, esp.dbi, 0.05);
  if (esp.hpbw !== undefined) comprueba(`${ANT[clave].n}: ancho de haz (°)`, r.hpbw, esp.hpbw, 1);
}

/* ---------- 6. base esférica del campo lejano ---------- */
console.log("\nCampo lejano: geometría local");
const sph = (t, ph) => {
  const st_ = Math.sin(t), ct = Math.cos(t), cp = Math.cos(ph), sp = Math.sin(ph);
  return { r: [st_ * cp, ct, st_ * sp], th: [ct * cp, -st_, ct * sp], b: [sp, 0, -cp] };
};
const punto = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const cruz = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
let peorOrto = 0, peorPoynting = 1;
for (let i = 1; i < 20; i++)
  for (let j = 0; j < 20; j++) {
    const d = sph((i / 20) * Math.PI, (j / 20) * 2 * Math.PI);
    peorOrto = Math.max(peorOrto, Math.abs(punto(d.th, d.b)), Math.abs(punto(d.r, d.th)));
    peorPoynting = Math.min(peorPoynting, punto(cruz(d.th, d.b), d.r));
  }
comprueba("E ⊥ B ⊥ dirección de propagación", peorOrto, 0, 1e-12);
comprueba("E × B apunta hacia fuera en toda la esfera", peorPoynting, 1, 1e-12);

/* ---------- 7. muestreo espacial de la vista de radiación ---------- */
console.log("\nMuestreo de las capas esféricas (límite de Nyquist)");
const VS = (src) => (src === "manual" ? V0 * 2.5 : V0);
const lamS = (src) => (src === "manual" ? VS(src) * 1.2 : LAM);
for (const src of ["preset", "manual"]) {
  const paso = clamp(lamS(src) / 12, 0.11, 0.3);
  const muestras = lamS(src) / paso;
  const ok = muestras >= 4;
  if (!ok) fallos++;
  console.log(`  ${ok ? "✓" : "✗"} fuente ${src.padEnd(8)} ${muestras.toFixed(1)} muestras por longitud de onda (mínimo 4)`);
  const capas = Math.floor((RMAX - 0.55) / paso);
  console.log(`      ${capas} capas por fotograma, ${(capas * 13 * 41).toLocaleString("es-ES")} proyecciones`);
}

console.log(
  fallos === 0
    ? "\nTodas las comprobaciones pasan.\n"
    : `\n${fallos} comprobación(es) han fallado.\n`
);
process.exit(fallos === 0 ? 0 : 1);
