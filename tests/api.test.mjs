import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { afterEach, test } from "node:test";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { checkStatus, onScan } from "../dist-js/index.js";

globalThis.window = { crypto: webcrypto };
afterEach(clearMocks);

test("unsupported platforms report status and never register a listener", async () => {
  const calls = [];
  mockIPC((command) => {
    calls.push(command);
    assert.equal(command, "plugin:dwrecv|status");
    return { isAvailable: false, reason: "unsupportedPlatform" };
  });
  assert.deepEqual(await checkStatus(), { isAvailable: false, reason: "unsupportedPlatform" });
  await assert.rejects(onScan(() => {}), /only supported on Android/);
  assert.equal(calls.length, 2);
});

test("IPC failures remain errors instead of reporting unsupported platform", async () => {
  const failure = new Error("status permission denied");
  mockIPC(() => { throw failure; });
  await assert.rejects(checkStatus(), (error) => error === failure);
  await assert.rejects(onScan(() => {}), (error) => error === failure);
});

test("Android support permits subscription and cleanup", async () => {
  const calls = [];
  mockIPC((command) => {
    calls.push(command);
    if (command === "plugin:dwrecv|status") return { isAvailable: true };
    if (command === "plugin:dwrecv|register_listener") return;
    if (command === "plugin:dwrecv|remove_listener") return;
    throw new Error(`Unexpected command: ${command}`);
  });
  const unlisten = await onScan(() => {});
  await unlisten();
  assert.deepEqual(calls, [
    "plugin:dwrecv|status",
    "plugin:dwrecv|register_listener",
    "plugin:dwrecv|remove_listener",
  ]);
});
