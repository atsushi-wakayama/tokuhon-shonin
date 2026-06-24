export function parseLocationCoords(location: unknown): { latitude: number | null; longitude: number | null } {
  if (!location) return { latitude: null, longitude: null }
  if (typeof location === 'object' && location !== null && Array.isArray((location as any).coordinates)) {
    const [lng, lat] = (location as any).coordinates
    return { latitude: lat, longitude: lng }
  }
  if (typeof location === 'string' && location.length > 10) {
    try {
      const bytes = new Uint8Array(location.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
      const view = new DataView(bytes.buffer)
      const le = bytes[0] === 1
      const wkbType = view.getUint32(1, le)
      const hasSrid = (wkbType & 0x20000000) !== 0
      const offset = 1 + 4 + (hasSrid ? 4 : 0)
      const x = view.getFloat64(offset, le)
      const y = view.getFloat64(offset + 8, le)
      if (!isFinite(x) || !isFinite(y)) return { latitude: null, longitude: null }
      return { latitude: y, longitude: x }
    } catch { return { latitude: null, longitude: null } }
  }
  return { latitude: null, longitude: null }
}
