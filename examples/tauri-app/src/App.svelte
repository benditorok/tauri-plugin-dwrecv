<script>
  import Greet from './lib/Greet.svelte'
  import { ping, subscribeToDataWedge, onDataWedgeScan, onDataWedgeError } from 'tauri-plugin-dwrecv-api'
  import { onMount } from 'svelte'

	let response = ''
	let scanData = []
	let isSubscribed = false
	let unlistenScan = null
	let unlistenError = null

	function updateResponse(returnValue) {
		response += `[${new Date().toLocaleTimeString()}] ` + (typeof returnValue === 'string' ? returnValue : JSON.stringify(returnValue)) + '<br>'
	}

	function _ping() {
		ping("Pong!").then(updateResponse).catch(updateResponse)
	}

	async function subscribeToDataWedgeIntents() {
		try {
			const result = await subscribeToDataWedge({
				// Optional: customize the intent action and category
				// intentAction: "com.symbol.datawedge.api.RESULT_ACTION",
				// intentCategory: "android.intent.category.DEFAULT"
			})
			
			updateResponse(`Subscribe result: ${JSON.stringify(result)}`)
			
			if (result.success) {
				isSubscribed = true
				
				// Listen for scan events
				unlistenScan = await onDataWedgeScan((data) => {
					console.log('DataWedge scan received:', data)
					scanData = [data, ...scanData].slice(0, 10) // Keep last 10 scans
					updateResponse(`Scan: ${data.barcode} (${data.symbology || 'unknown'})`)
				})
				
				// Listen for error events
				unlistenError = await onDataWedgeError((error) => {
					console.error('DataWedge error:', error)
					updateResponse(`Error: ${error.error}`)
				})
			}
		} catch (error) {
			updateResponse(`Failed to subscribe: ${error}`)
		}
	}

	function unsubscribeFromDataWedge() {
		if (unlistenScan) {
			unlistenScan()
			unlistenScan = null
		}
		if (unlistenError) {
			unlistenError()
			unlistenError = null
		}
		isSubscribed = false
		updateResponse('Unsubscribed from DataWedge events')
	}

	function clearScans() {
		scanData = []
	}

	onMount(() => {
		// Cleanup on component destroy
		return () => {
			unsubscribeFromDataWedge()
		}
	})
</script>

<main class="container">
  <h1>DataWedge Intent Receiver</h1>

  <div class="row">
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo vite" alt="Vite Logo" />
    </a>
    <a href="https://tauri.app" target="_blank">
      <img src="/tauri.svg" class="logo tauri" alt="Tauri Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank">
      <img src="/svelte.svg" class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>

  <div class="row">
    <Greet />
  </div>

  <div class="datawedge-controls">
    <h2>DataWedge Controls</h2>
    <div class="button-group">
      <button on:click="{_ping}">Test Ping</button>
      {#if !isSubscribed}
        <button on:click="{subscribeToDataWedgeIntents}">Subscribe to DataWedge</button>
      {:else}
        <button on:click="{unsubscribeFromDataWedge}">Unsubscribe</button>
      {/if}
      <button on:click="{clearScans}">Clear Scans</button>
    </div>
    
    <div class="status">
      Status: {isSubscribed ? 'Subscribed' : 'Not subscribed'}
    </div>
  </div>

  <div class="scan-history">
    <h2>Recent Scans ({scanData.length})</h2>
    {#if scanData.length === 0}
      <p>No scans yet. Use your Zebra device scanner to scan a barcode.</p>
    {:else}
      <div class="scan-list">
        {#each scanData as scan, i}
          <div class="scan-item">
            <div class="scan-barcode">{scan.barcode}</div>
            <div class="scan-details">
              {#if scan.symbology}
                <span class="symbology">{scan.symbology}</span>
              {/if}
              {#if scan.timestamp}
                <span class="timestamp">{scan.timestamp}</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="log">
    <h2>Log</h2>
    <div class="log-content">{@html response}</div>
  </div>

</main>

<style>
  .logo.vite:hover {
    filter: drop-shadow(0 0 2em #747bff);
  }

  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00);
  }

  .datawedge-controls {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .button-group button {
    padding: 10px 15px;
    background: #0078d7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .button-group button:hover {
    background: #106ebe;
  }

  .status {
    font-weight: bold;
    color: #0078d7;
  }

  .scan-history {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .scan-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .scan-item {
    padding: 10px;
    margin: 5px 0;
    background: #f5f5f5;
    border-radius: 4px;
    border-left: 4px solid #0078d7;
  }

  .scan-barcode {
    font-family: monospace;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  .scan-details {
    margin-top: 5px;
    display: flex;
    gap: 15px;
  }

  .symbology {
    background: #e3f2fd;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
    color: #1976d2;
  }

  .timestamp {
    color: #666;
    font-size: 12px;
  }

  .log {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .log-content {
    max-height: 200px;
    overflow-y: auto;
    background: #f8f8f8;
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
</style>
