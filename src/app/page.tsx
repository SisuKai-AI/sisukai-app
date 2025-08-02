export default function MinimalTestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          🚀 SisuKai Test
        </h1>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          Minimal deployment test - If you see this, Vercel is working!
        </p>
        <div style={{
          fontSize: '1rem',
          opacity: 0.8
        }}>
          <p>✅ Next.js 15 App Router</p>
          <p>✅ Vercel Deployment</p>
          <p>✅ Basic Functionality</p>
        </div>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <strong>Deployment Time:</strong> {new Date().toISOString()}
        </div>
      </div>
    </div>
  )
}

