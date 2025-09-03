import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/auth'

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const userId = await getUserFromRequest(request)

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return handler(request, userId)
}