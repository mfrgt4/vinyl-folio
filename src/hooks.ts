import { useEffect, useState } from 'react'
/** useState persisté dans le localStorage (démo sans backend). */
export function useLS<T>(key: string, init: T) {
  const [v, s] = useState<T>(() => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : init } catch { return init } })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, s] as const
}
