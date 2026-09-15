import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { checkStatus, onScan, type Barcode } from "tauri-plugin-dwrecv-api";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [barcodeContent, setBarcodeContent] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState("Checking scanner support…");

  useEffect(() => {
    let unlisten: (() => Promise<void>) | undefined;
    let disposed = false;

    const setupListener = async () => {
      try {
        const status = await checkStatus();
        if (disposed) return;
        if (!status.isAvailable) {
          setScanStatus("Scanning is unavailable on this platform. Use an Android device.");
          return;
        }
        unlisten = await onScan(
          (barcode: Barcode) => {
            setBarcodeContent(barcode.data);

            // Clear barcode after 2 seconds
            setTimeout(() => {
              setBarcodeContent(null);
            }, 2000);
          },
          (error: string) => console.error("Scan error:", error),
        );
        if (disposed) {
          await unlisten();
          return;
        }
        setScanStatus("Ready to receive scans.");
        console.log("Scan listener registered successfully");
      } catch (e) {
        if (!disposed) setScanStatus("Could not initialize scanning.");
        console.error("Failed to register scan listener:", e);
      }
    };

    setupListener();

    return () => {
      disposed = true;
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row brand-row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row greet-form"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input id="greet-input" onChange={(e) => setName(e.currentTarget.value)} placeholder="Enter a name..." />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
      <p role="status">{scanStatus}</p>

      {barcodeContent && (
        <div className="scan-result">
          <p>{barcodeContent}</p>
        </div>
      )}
    </main>
  );
}

export default App;
