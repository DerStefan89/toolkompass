export const PAGE_SIZE = 25

export function parsePageParams(
  searchParams: Record<string, string | string[] | undefined>
): { page: number; pageSize: number; skip: number; take: number } {
  const page = Math.max(1, parseInt((searchParams.page as string) ?? '1', 10) || 1)
  const pageSize = PAGE_SIZE
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}
