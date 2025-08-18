import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export interface DataWedgeData {
  barcode: string;
  timestamp?: string;
  symbology?: string;
}

export interface SubscribeOptions {
  intentAction?: string;
  intentCategory?: string;
}

export interface SubscribeResponse {
  success: boolean;
  message?: string;
}

export async function ping(value: string): Promise<string | null> {
  return await invoke<{ value?: string }>('plugin:dwrecv|ping', {
    payload: {
      value,
    },
  }).then((r) => (r.value ? r.value : null));
}

export async function subscribeToDataWedge(options?: SubscribeOptions): Promise<SubscribeResponse> {
  return await invoke<SubscribeResponse>('plugin:dwrecv|subscribe_to_datawedge', {
    payload: {
      intentAction: options?.intentAction,
      intentCategory: options?.intentCategory,
    },
  });
}

export async function unsubscribeFromDataWedge(): Promise<SubscribeResponse> {
  return await invoke<SubscribeResponse>('plugin:dwrecv|unsubscribe_from_datawedge', {
    payload: {},
  });
}

/**
 * Listen for DataWedge scan events
 * @param callback Function to handle the scan data
 * @returns A function to unlisten
 */
export async function onDataWedgeScan(callback: (data: DataWedgeData) => void) {
  return await listen<DataWedgeData>('datawedge-scan', (event) => {
    callback(event.payload);
  });
}

/**
 * Listen for DataWedge error events
 * @param callback Function to handle the error
 * @returns A function to unlisten
 */
export async function onDataWedgeError(callback: (error: { error: string }) => void) {
  return await listen<{ error: string }>('datawedge-error', (event) => {
    callback(event.payload);
  });
}
