import Stripe from "stripe";
import { getAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-04-10" as any,
  });

  const adminClient = getAdminClient();
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const supabaseUserId = session.metadata?.supabase_user_id;

      if (supabaseUserId) {
        await adminClient
          .from("profiles")
          .update({ 
            is_pro: true, 
            stripe_customer_id: customerId,
            subscription_status: 'active'
          })
          .eq("id", supabaseUserId);
          
        console.log(`User ${supabaseUserId} is now PRO`);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await adminClient
        .from("profiles")
        .update({ 
          is_pro: false, 
          subscription_status: 'canceled'
        })
        .eq("stripe_customer_id", customerId);
        
      console.log(`Customer ${customerId} subscription ended`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
