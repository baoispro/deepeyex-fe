export const loadStringeeSdk = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).StringeeClient) {
      resolve(window.StringeeClient);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.stringee.com/sdk/web/latest/stringee-web-sdk.min.js";
    script.async = true;
    script.onload = () => resolve(window.StringeeClient);
    script.onerror = () => reject("❌ Không thể tải Stringee SDK");
    document.head.appendChild(script);
  });
};
