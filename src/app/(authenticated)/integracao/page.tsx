'use client'

import { useState } from 'react'
import WhatsAppEmbeddedSignup from '@/components/Settings/WhatsAppEmbeddedSignup'
import WhatsAppNumerosPanel from '@/components/Settings/WhatsAppNumerosPanel'

export default function IntegracaoConectarPage() {
  // Muda depois de conectar pelo Embedded Signup, pra lista de números recarregar.
  const [conexoes, setConexoes] = useState(0)
  return (
    <div className="max-w-3xl">
      <WhatsAppEmbeddedSignup onConectado={() => setConexoes((n) => n + 1)} />
      <WhatsAppNumerosPanel recarregarQuando={conexoes} />
    </div>
  )
}
