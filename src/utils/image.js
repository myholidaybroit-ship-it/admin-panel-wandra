/* Read an image file → downscaled JPEG data-URL (persists in localStorage) */
export function fileToDataUrl(file, maxW = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('no file'))
    const reader = new FileReader()
    reader.onload = () => {
      // PDFs / non-images: keep as-is
      if (!file.type.startsWith('image/')) return resolve({ url: reader.result, kind: 'file' })
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        c.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve({ url: c.toDataURL('image/jpeg', quality), kind: 'image' })
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
