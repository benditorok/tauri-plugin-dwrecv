# Blazor Integration Guide

## API for IDisposable Pattern

The plugin now provides a perfect API for Blazor's IDisposable pattern. Here's how the enhanced API supports your use case:

### Enhanced TypeScript API

#### Core Functions (existing)
- `subscribeToDataWedge(options?)` - Subscribe to DataWedge intents
- `unsubscribeFromDataWedge()` - Unsubscribe from DataWedge intents  
- `onDataWedgeScan(callback)` - Listen for scan events
- `onDataWedgeError(callback)` - Listen for error events

#### New: IDisposable-Compatible API
- `createDataWedgeSubscription(onScan, onError?, options?)` - Creates a disposable subscription

### DataWedgeSubscription Interface

```typescript
interface DataWedgeSubscription {
  readonly isActive: boolean;
  dispose(): Promise<void>;
}
```

### Usage Pattern for Blazor

The `createDataWedgeSubscription` function is designed specifically for your Blazor scenario:

```typescript
// In your Blazor component/page
const subscription = await createDataWedgeSubscription(
  (data) => {
    // Handle barcode scan
    console.log(`Scanned: ${data.barcode}`);
  },
  (error) => {
    // Handle errors
    console.error(`Error: ${error.error}`);
  },
  {
    // Optional configuration
    intentAction: "com.symbol.datawedge.api.RESULT_ACTION"
  }
);

// When leaving the page (in Dispose() method)
await subscription.dispose();
```

### What happens during `createDataWedgeSubscription`:

1. **Subscribes** to DataWedge via native Android plugin
2. **Sets up event listeners** for scan and error events
3. **Returns a subscription object** with `dispose()` method
4. **Tracks state** via `isActive` property

### What happens during `dispose()`:

1. **Unlistens** from all event handlers
2. **Unsubscribes** from DataWedge native plugin
3. **Cleans up** all resources
4. **Sets state** to inactive

### Benefits for Blazor:

- ✅ **Perfect IDisposable pattern** - Single object to dispose
- ✅ **Automatic cleanup** - No memory leaks when leaving pages
- ✅ **State tracking** - Know if subscription is active
- ✅ **Error handling** - Built-in error event handling
- ✅ **Simple API** - One call to subscribe, one call to dispose

### Alternative Usage (Manual Control)

If you prefer manual control, you can still use the individual functions:

```typescript
// Manual subscription
const subscribeResult = await subscribeToDataWedge();
const unlistenScan = await onDataWedgeScan(handleScan);
const unlistenError = await onDataWedgeError(handleError);

// Manual cleanup
unlistenScan();
unlistenError();
await unsubscribeFromDataWedge();
```

### Rust Backend Support

The Rust backend fully supports both patterns with these commands:
- `subscribe_to_datawedge` - Native subscription
- `unsubscribe_from_datawedge` - Native unsubscription
- Event emission via `datawedge-scan` and `datawedge-error` events

The API is now perfectly suited for Blazor's component lifecycle and IDisposable pattern!
