"use server";

import {
  countPlacesPrises,
  getPlacesRestantes,
} from "@/lib/places";

export { countPlacesPrises, getPlacesRestantes };

/**
 * Ancien flux « demande à valider » retiré :
 * la place est confirmée automatiquement au paiement Stripe (`status: payee`).
 */
