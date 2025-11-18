import { invoke } from "@tauri-apps/api/core";

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
