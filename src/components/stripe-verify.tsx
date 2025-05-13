import { Button, Link } from "@payloadcms/ui";
import Stripe from 'stripe';

export const StripeVerify = () => {
  return (
    <Link href="/stripe-verify">
      <Button>
        Verify your account
      </Button>
    </Link>
  )
}


