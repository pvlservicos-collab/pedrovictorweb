/**
 * O CRM roda em pedrovictorweb.com.br/crm (basePath do Next, ver next.config.ts).
 *
 * O Next so prefixa sozinho o que passa por <Link>, useRouter e redirect().
 * Todo o resto -- fetch('/api/...'), <img src>, window.location, signOut,
 * service worker, links montados no servidor -- precisa do prefixo na mao.
 * Esquecer isso da 404 so em producao, entao todo caminho interno sai daqui.
 */
export const BASE_PATH = '/crm'

/** Prefixa um caminho interno ('/chat' -> '/crm/chat'). Idempotente. */
export function comBase(caminho: string): string {
  if (!caminho.startsWith('/') || caminho.startsWith('//')) return caminho
  if (caminho === BASE_PATH || caminho.startsWith(BASE_PATH + '/') || caminho.startsWith(BASE_PATH + '?')) return caminho
  return BASE_PATH + caminho
}
