{
  "build": { ... },
  "tauri": { ... },
  "plugins": {
    "tauri-plugin-dwrecv": {
      "pingValue": "ping",
      "intentAction": "com.symbol.datawedge.api.RESULT_ACTION"
    }
  }
}


adb shell am broadcast \
  -a com.symbol.datawedge.api.RESULT_ACTION \
  -n com.bendi.tauri-blazor-with-env/.MainActivity \
  --es 'com.symbol.datawedge.label_type' 'EAN13' \
  --es 'com.symbol.datawedge.data_string' '1234567890123' \
  --es 'com.symbol.datawedge.source' 'scanner'
  
  # show Kotlin compilation errors
cd src-tauri/gen/android/
  ./gradlew compileDebugKotlin --scan

>>> THIS
  .\adb.exe shell am broadcast `
  -a com.symbol.datawedge.api.RESULT_ACTION `
  --es 'com.symbol.datawedge.label_type' 'EAN13' `
  --es 'com.symbol.datawedge.data_string' '1234567890123' `
  --es 'com.symbol.datawedge.source' 'scanner'

adb shell am broadcast \
  -a com.symbol.datawedge.api.RESULT_ACTION \
  --es 'com.symbol.datawedge.label_type' 'EAN13' \
  --es 'com.symbol.datawedge.data_string' '1234567890123' \
  --es 'com.symbol.datawedge.source' 'scanner'