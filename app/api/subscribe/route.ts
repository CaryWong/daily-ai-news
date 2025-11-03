import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from('subscribers')
          .update({ is_active: true })
          .eq('id', existing.id);

        return NextResponse.json({ message: 'Subscription reactivated' });
      }
    }

    // Create new subscription
    const subscriberId = crypto.randomUUID();
    const { error } = await supabase.from('subscribers').insert({
      id: subscriberId,
      email: email.toLowerCase(),
      is_active: true,
      subscribed_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Successfully subscribed' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
