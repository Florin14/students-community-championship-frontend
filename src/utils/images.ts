export const imageSrc = (
  base64: string | null | undefined
): string | undefined => {
  if (!base64) return undefined;
  if (base64.startsWith("data:")) return base64;
  return `data:image/png;base64,${base64}`;
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
