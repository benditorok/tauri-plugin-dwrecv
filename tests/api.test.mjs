import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { afterEach, test } from "node:test";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { checkStatus, onScan } from "../dist-js/index.js";

globalThis.window = { crypto: webcrypto };
afterEach(clearMocks);

test("unsupported platforms report status before subscribing", async () => {
  const calls = [];
  mockIPC((command) => {
    calls.push(command);
    assert.equal(command, "plugin:dwrecv|status");
    return { isAvailable: false, reason: "unsupportedPlatform" };
  });
  assert.deepEqual(await checkStatus(), { isAvailable: false, reason: "unsupportedPlatform" });
  await assert.rejects(onScan(() => {}), { message: "Scanning is not supported on this platform." });
  assert.deepEqual(calls, ["plugin:dwrecv|status", "plugin:dwrecv|status"]);
});

for (const message of ["status permission denied", "plugin dwrecv not found"]) {
  test(`${message} remains an error rather than an availability result`, async () => {
    const failure = new Error(message);
    mockIPC(() => { throw failure; });
    await assert.rejects(checkStatus(), (error) => error === failure);
    await assert.rejects(onScan(() => {}), (error) => error === failure);
  });
}

test("available platforms deliver scan events and support cleanup", async () => {
  const calls = [];
  let handler;
  mockIPC((command, args) => {
    calls.push(command);
    if (command === "plugin:dwrecv|status") return { isAvailable: true };
    assert.equal(args.event, "dw-scan");
    if (command === "plugin:dwrecv|register_listener") {
      handler = args.handler;
      return;
    }
    assert.equal(command, "plugin:dwrecv|remove_listener");
    assert.equal(args.channelId, handler.id);
  });
  const barcodes = [];
  const errors = [];
  const unlisten = await onScan(
    (barcode) => barcodes.push(barcode),
    (error) => errors.push(error),
  );
  const barcode = { data: "123456", labelType: "EAN13", source: "scanner" };
  handler.onmessage(barcode);
  handler.onmessage({ errorMessage: "scan failed" });
  assert.deepEqual(barcodes, [barcode]);
  assert.deepEqual(errors, ["scan failed"]);
  await unlisten();
  assert.deepEqual(calls, [
    "plugin:dwrecv|status",
    "plugin:dwrecv|register_listener",
    "plugin:dwrecv|remove_listener",
  ]);
});

test("listener registration failures remain errors", async () => {
  const failure = new Error("listener permission denied");
  mockIPC((command) => {
    if (command === "plugin:dwrecv|status") return { isAvailable: true };
    throw failure;
  });
  await assert.rejects(onScan(() => {}), (error) => error === failure);
});

test("listener cleanup failures remain errors", async () => {
  const failure = new Error("remove_listener permission denied");
  mockIPC((command) => {
    if (command === "plugin:dwrecv|status") return { isAvailable: true };
    if (command === "plugin:dwrecv|register_listener") return;
    if (command === "plugin:dwrecv|remove_listener") throw failure;
    throw new Error(`Unexpected command: ${command}`);
  });
  const unlisten = await onScan(() => {});
  await assert.rejects(unlisten(), (error) => error === failure);
});

test("available platforms return an availability result", async () => {
  mockIPC((command) => {
    assert.equal(command, "plugin:dwrecv|status");
    return { isAvailable: true };
  });
  assert.deepEqual(await checkStatus(), { isAvailable: true });
});
