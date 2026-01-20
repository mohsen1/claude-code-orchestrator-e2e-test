import { NextRequest, NextResponse } from 'next/server';
import { calculateBalances } from '@/lib/balances';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    const balances = calculateBalances(groupId);

    return NextResponse.json(balances);
  } catch (error) {
    console.error('Error calculating balances:', error);
    return NextResponse.json(
      { error: 'Failed to calculate balances' },
      { status: 500 }
    );
  }
}
