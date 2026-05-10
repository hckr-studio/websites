import {auditTime, bufferTime, map, tap, switchMap, Subject} from "rxjs";
import initShazamio, {recognizeBytes} from "./shazamio-core.js";

function downsampleBuffer(buffer, sampleRate, exportSampleRate) {
  if (exportSampleRate === sampleRate) {
    return buffer;
  }
  const sampleRateRatio = sampleRate / exportSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0,
      count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function mergeBuffers(bufferArray) {
  const recLength = 128 * bufferArray.length;
  const result = new Float32Array(recLength);
  let offset = 0;
  for (let i = 0; i < bufferArray.length; i++) {
    result.set(bufferArray[i], offset);
    offset += bufferArray[i].length;
  }
  return result;
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 32 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return new Uint8Array(buffer);
}

async function fetchShazamData(signature) {
  const resp = await fetch("/api/v1/shazam", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({signature}),
  });
  return resp.json();
}

function withDispose(signature) {
  return Object.defineProperty(signature, Symbol.dispose, {
    get() {
      return function () {
        return this.free();
      };
    }
  });
}

/**
 *
 * @param bytes {Uint8Array}
 * @param [offset] {number}
 * @param [seconds] {number}
 */
async function* getTrackInfo(bytes, offset, seconds) {
  const signatures = recognizeBytes(bytes, offset, seconds);
  for (using signature of signatures.map(withDispose)) {
    const shazamData = await fetchShazamData({samplems: signature.samplems, uri: signature.uri});
    if (shazamData.matches.length) yield shazamData.track;
  }
}

/**
 *
 * @param init {Object}
 * @param init.port {MessagePort} AudioWorklet message port
 * @param init.sampleRate {number} AudioContext sample rate in ms
 * @param init.targetSampleRate {number} target sample rate for fingerprinting. Default 16kHz
 * @param init.sampleSec {number} length of the sample to fingerprint in seconds. Default 5s
 * @param init.refreshSec {number} refresh rate in seconds - how often to sample the stream. Default 30s
 * @param init.nowPlaying {Element} target element to show results
 * @returns {Promise<void>}
 */
export async function main(init) {
  const {port, sampleRate, targetSampleRate = 16_000, sampleSec = 5, refreshSec = 30, nowPlaying} = init;
  await initShazamio();
  const audioStream = new Subject();
  const samples = audioStream.pipe(
    bufferTime(sampleSec * 1_000),
    auditTime(refreshSec * 1_000),
    map(x => mergeBuffers(x)),
    map(x => downsampleBuffer(x, sampleRate, targetSampleRate)),
    map(x => encodeWAV(x, targetSampleRate)),
    switchMap(x => getTrackInfo(x, 0, sampleSec)),
  );
  samples.subscribe(x => nowPlaying.innerText = `${x.subtitle} - ${x.title}`);
  port.onmessage = e => audioStream.next(e.data);
}
