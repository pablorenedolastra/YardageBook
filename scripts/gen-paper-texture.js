// Genera assets/paper-texture.png: motas marrón finas y dispersas sobre fondo
// transparente, tileable (160x160). PNG RGBA en Node puro, sin dependencias.
const fs = require('fs');
const zlib = require('zlib');

const W = 160;
const H = 160;
const R = 0x5c;
const G = 0x40;
const B = 0x22;

// PRNG determinista (mulberry32) para que el asset sea reproducible.
let s = 7 >>> 0;
function rnd() {
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Imagen cruda: cada fila lleva un byte de filtro (0 = none) + W píxeles RGBA.
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  const rowStart = y * (1 + W * 4);
  raw[rowStart] = 0;
  for (let x = 0; x < W; x++) {
    const o = rowStart + 1 + x * 4;
    const v = rnd();
    let a = 0;
    if (v > 0.965)
      a = 255; // mota nítida (dispersa, ~3.5% de píxeles)
    else if (v > 0.9) a = 90; // grano tenue
    raw[o] = R;
    raw[o + 1] = G;
    raw[o + 2] = B;
    raw[o + 3] = a;
  }
}

const idat = zlib.deflateSync(raw, { level: 9 });

const crcTable = (() => {
  const tbl = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tbl[n] = c >>> 0;
  }
  return tbl;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // profundidad de bits
ihdr[9] = 6; // color type RGBA
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.writeFileSync('assets/paper-texture.png', png);
console.log('Escrito assets/paper-texture.png:', png.length, 'bytes');
