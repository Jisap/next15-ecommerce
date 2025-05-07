import Stripe from "stripe";
import { metadata } from '../../app/(app)/layout';



export type ProductMetadata = {
  stripeAccountId: string;
  id: string;
  name: string;
  price: number;
}

export type CheckoutMetadata = {
  userId: string;
}

export type ExpandedLineItem = Stripe.LineItem & {
  price: Stripe.Price & {
    product: Stripe.Product & {
      metadata: ProductMetadata
    }
  }
}