import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

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

export interface DataWedgeSubscription {
  readonly isActive: boolean;
  dispose(): Promise<void>;
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
export async function onDataWedgeScan(callback: (data: DataWedgeData) => void): Promise<UnlistenFn> {
  return await listen<DataWedgeData>('datawedge-scan', (event: any) => {
    callback(event.payload);
  });
}

/**
 * Listen for DataWedge error events
 * @param callback Function to handle the error
 * @returns A function to unlisten
 */
export async function onDataWedgeError(callback: (error: { error: string }) => void): Promise<UnlistenFn> {
  return await listen<{ error: string }>('datawedge-error', (event: any) => {
    callback(event.payload);
  });
}

/**
 * Creates a DataWedge subscription that can be disposed (perfect for Blazor IDisposable pattern)
 * @param onScan Callback for barcode scan events
 * @param onError Optional callback for error events
 * @param options Optional subscription configuration
 * @returns A DataWedgeSubscription that can be disposed
 */
export async function createDataWedgeSubscription(
  onScan: (data: DataWedgeData) => void,
  onError?: (error: { error: string }) => void,
  options?: SubscribeOptions
): Promise<DataWedgeSubscription> {

  let isActive = false;
  let unlistenScan: UnlistenFn | null = null;
  let unlistenError: UnlistenFn | null = null;

  // Subscribe to DataWedge
  const subscribeResult = await subscribeToDataWedge(options);

  if (subscribeResult.success) {
    // Set up event listeners
    unlistenScan = await onDataWedgeScan(onScan);

    if (onError) {
      unlistenError = await onDataWedgeError(onError);
    }

    isActive = true;
  } else {
    throw new Error(`Failed to subscribe to DataWedge: ${subscribeResult.message}`);
  }

  return {
    get isActive() {
      return isActive;
    },

    async dispose() {
      if (!isActive) return;

      // Unlisten from events
      if (unlistenScan) {
        unlistenScan();
        unlistenScan = null;
      }

      if (unlistenError) {
        unlistenError();
        unlistenError = null;
      }

      // Unsubscribe from DataWedge
      await unsubscribeFromDataWedge();

      isActive = false;
    }
  };
}
