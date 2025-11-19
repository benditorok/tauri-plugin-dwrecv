import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { addPluginListener, type PluginListener } from "@tauri-apps/api/core";
import "./App.css";

interface Barcode {
  data: string;
  labelType: string;
  source: string;
}

interface ScanError {
  errorMessage: string;
}

type ScanPayload = Barcode | ScanError;

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [barcodeContent, setBarcodeContent] = useState<string | null>(null);

  useEffect(() => {
    let unlisten: PluginListener | undefined;

    const setupListener = async () => {
      try {
        unlisten = await addPluginListener("dwrecv", "dw-scan", (payload: ScanPayload) => {
          if ("data" in payload) {
            setBarcodeContent(payload.data);

            // Clear barcode after 2 seconds
            setTimeout(() => {
              setBarcodeContent(null);
            }, 2000);
          } else if ("errorMessage" in payload) {
            console.error("Scan error:", payload.errorMessage);
          }
        });
        console.log("Scan listener registered successfully");
      } catch (e) {
        console.error("Failed to register scan listener:", e);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten.unregister();
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

      <div className="row">
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
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input id="greet-input" onChange={(e) => setName(e.currentTarget.value)} placeholder="Enter a name..." />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      {barcodeContent && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "oklch(81% 0.117 11.638)",
            padding: "1rem",
            marginTop: "1rem",
            borderRadius: "0.5rem",
          }}
        >
          <p>{barcodeContent}</p>
        </div>
      )}
    </main>
  );
}

export default App;
