import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PWAUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 'auto 1rem 1rem auto',
        padding: '0.75rem 1rem', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.2)',
        background: '#111', color: '#fff', zIndex: 9999
      }}
      role="status" aria-live="polite"
    >
      {offlineReady && <span>Appen är redo att användas offline.</span>}
      {needRefresh && <span>Ny version finns.</span>}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
        {needRefresh && (
          <button onClick={() => updateServiceWorker(true)} style={{ padding: '6px 10px' }}>
            Uppdatera
          </button>
        )}
        <button onClick={() => { setOfflineReady(false); setNeedRefresh(false) }} style={{ padding: '6px 10px' }}>
          Stäng
        </button>
      </div>
    </div>
  )
}
