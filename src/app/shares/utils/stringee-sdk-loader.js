export async function loadStringeeSDK() {
  if (typeof window === "undefined") return null;

  if (window.StringeeSDK) return window.StringeeSDK; // đã load trước đó

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.stringee.com/sdk/web/latest/stringee-sdk.min.js";
    script.async = true;

    script.onload = () => {
      if (window.StringeeSDK) {
        console.log("✅ Stringee SDK loaded");
        resolve(window.StringeeSDK);
      } else {
        reject(new Error("Stringee SDK not found after load"));
      }
    };

    script.onerror = () => reject(new Error("Failed to load Stringee SDK"));
    document.body.appendChild(script);
  });
}
