import { NextRequest } from 'next/server'
import { authenticateRequest, apiError, validateRequired } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { integrations, integrationSecrets, organizationRoles, leads } from '@/lib/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { salvarIntegracaoCloud } from '@/lib/whatsappIntegracao'
import { exigirGestaoDeIntegracoes } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    await exigirGestaoDeIntegracoes(auth)
    const body = await req.json().catch(() => ({}))
    const missing = validateRequired(body ?? {}, ['waba_id', 'phone_number_id', 'system_token'])
    if (missing) return apiError(400, missing)

    const { waba_id, phone_number_id, system_token, graph_api_version } = body
    const integrationId = await salvarIntegracaoCloud(auth.organizationId, { waba_id, phone_number_id, graph_api_version, origem: 'manual' }, system_token)

    return Response.json({ integration_id: integrationId })
  } catch (err: any) {
    return apiError(err.status || 500, err.message || 'Erro interno.')
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    const [integration] = await db.select({ id: integrations.id, status: integrations.status, config: integrations.config })
      .from(integrations)
      .where(and(eq(integrations.organizationId, auth.organizationId), eq(integrations.type, 'whatsapp_cloud_official')))
      .limit(1)

    if (!integration) return Response.json(null)

    // Passo 2 do onboarding ("confirmar conexão"): um lead só nasce dessa integração
    // depois que uma mensagem de verdade chegou pelo webhook — não precisa de coluna
    // nova, só checar se já existe algum lead apontando pra essa integração.
    const [leadRow] = await db.select({ id: leads.id }).from(leads)
      .where(eq(leads.integrationId, integration.id)).limit(1)

    return Response.json({ ...integration, hasInboundMessage: !!leadRow })
  } catch (err: any) {
    return apiError(err.status || 500, err.message || 'Erro interno.')
  }
}
