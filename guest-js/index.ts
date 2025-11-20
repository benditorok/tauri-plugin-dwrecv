import { invoke, addPluginListener, type PluginListener } from "@tauri-apps/api/core";

export interface Barcode {
  data: string;
  labelType: string;
  source: string;
}

export interface ScanError {
  errorMessage: string;
}

export type ScanPayload = Barcode | ScanError;

export interface DataWedgeData {
  label_type: string;
  data: string;
  source: string;
}

export interface DataWedgeError {
  error_message: string;
}

export async function ping(value: string): Promise<string | null> {
  return await invoke<{ value?: string }>("plugin:dwrecv|ping", {
    payload: {
      value,
    },
  }).then((r) => (r.value ? r.value : null));
}

/**
 * Register a listener for barcode scan events from DataWedge.
 *
 * @param onBarcode - Callback function that receives barcode data when a scan is successful
 * @param onError - Optional callback function that receives error messages when a scan fails
 * @returns A promise that resolves to an unregister function to clean up the listener
 *
 * @example
 * ```typescript
 * const unlisten = await onScan(
 *   (barcode) => console.log("Scanned:", barcode.data),
 *   (error) => console.error("Scan error:", error)
 * );
 *
 * // Later, when you want to stop listening:
 * await unlisten();
 * ```
 */
export async function onScan(
  onBarcode: (barcode: Barcode) => void,
  onError?: (errorMessage: string) => void,
): Promise<() => Promise<void>> {
  const listener: PluginListener = await addPluginListener("dwrecv", "dw-scan", (payload: ScanPayload) => {
    if ("data" in payload) {
      onBarcode(payload);
    } else if ("errorMessage" in payload) {
      if (onError) {
        onError(payload.errorMessage);
      } else {
        console.error("Scan error:", payload.errorMessage);
      }
    }
  });

  return async () => {
    await listener.unregister();
  };
}
