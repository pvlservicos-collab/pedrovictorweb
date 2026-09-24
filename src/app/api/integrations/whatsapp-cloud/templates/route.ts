/**
 * GET /api/integrations/whatsapp-cloud/templates
 * Templates aprovados da API Oficial que dá pra enviar pelo chat.
 * Ver src/lib/whatsappTemplates.ts.
 */
import { NextRequest } from 'next/server'
import { authenticateRequest, apiError } from '@/lib/api-auth'
import { listarTemplates } from '@/lib/whatsappTemplates'

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    const templates = await listarTemplates(auth.organizationId)
    return Response.json({ templates })
  } catch (err: any) {
    return apiError(err.status || 500, err.message || 'Erro interno.')
  }
}
