// Prepares REVERE's drawn SVGs for animation: tags each line, colour fill and
// ink shape so the motion code can draw lines on and lay colour in.
import turntableRaw from '../assets/svg/turntable.svg?raw';
import walkhomeRaw from '../assets/svg/walkhome.svg?raw';
import wordmarkRaw from '../assets/svg/revere-wordmark.svg?raw';

const ELEM = /<(path|circle)\b([^>]*?)(?:\/>|>\s*<\/\1>)/gs;
const COLOUR = new Set(['#7E93A6', '#9A6A43']);

type El = { kind: string; attrs: string };
const elems = (svg: string): El[] => [...svg.matchAll(ELEM)].map(m => ({ kind: m[1], attrs: m[2] }));
const fillOf = (a: string) => a.match(/\bfill="([^"]*)"/)?.[1] ?? null;
const tag = (e: El, cls?: string) => `<${e.kind}${cls ? ` class="${cls}"` : ''}${e.attrs}></${e.kind}>`;

function lineOrFill(e: El) {
  const f = fillOf(e.attrs);
  if (e.kind === 'path' && f === 'none') return 'ln';
  if (f && COLOUR.has(f)) return 'cf';
  return 'ink';
}

/** Turntable with the record and tonearm grouped so they can rotate. */
export function turntable(plain = false) {
  const out: string[] = [], rec: string[] = [], arm: string[] = [];
  elems(turntableRaw).forEach((e, i) => {
    const t = tag(e, plain ? undefined : lineOrFill(e));
    if (i === 1 || (i >= 6 && i <= 18)) rec.push(t);
    else if (i >= 19 && i <= 25) arm.push(t);
    else out.push(t);
  });
  return out.slice(0, 3).join('') + `<g class="rec">${rec.join('')}</g>` + out.slice(3).join('') + `<g class="arm">${arm.join('')}</g>`;
}

/** Walking figure: paper sheet, then lines, colour and ink. */
export function walkhome() {
  return elems(walkhomeRaw).map((e, i) => tag(e, i === 0 ? 'sheet' : lineOrFill(e))).join('');
}

export function wordmark(color = '#222526') {
  return wordmarkRaw
    .replace(/fill="#222526"/g, `fill="${color}"`)
    .replace('width="3580" height="746"', '')
    .replace('<svg ', '<svg role="img" aria-label="REVERE" ');
}
