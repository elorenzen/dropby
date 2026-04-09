/**
 * Strip rich menu fields when the vendor is on Free (or otherwise lacks menuRichContent).
 * Used client-side; DB trigger enforces the same rules server-side.
 */
export function sanitizeMenuItemWrite(
  data: Record<string, unknown>,
  allowRichContent: boolean
): Record<string, unknown> {
  if (allowRichContent) {
    return { ...data }
  }
  const out = { ...data }
  out.description = null
  out.image_url = null
  out.image_name = null
  out.special = false
  return out
}
