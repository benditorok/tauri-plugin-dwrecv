import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

export interface DataWedgeData {
  barcode: string;
  timestamp?: string;
  symbology?: string;
}

export async function ping(value: string): Promise<string | null> {
  return await invoke<{ value?: string }>('plugin:dwrecv|ping', {
    payload: {
      value,
    },
  }).then((r) => (r.value ? r.value : null));
}
