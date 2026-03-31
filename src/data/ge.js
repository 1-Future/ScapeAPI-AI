// ── Grand Exchange (8.3) ──────────────────────────────────────────────────────
// Automated marketplace. Buy/sell offers matched by price.

const persistence = require('../engine/persistence');

const offers = []; // { id, type, playerId, playerName, itemId, itemName, quantity, remaining, price, timestamp }
let nextOfferId = 1;
const MAX_OFFERS_PER_PLAYER = 8;

function createOffer(type, playerId, playerName, itemId, itemName, quantity, price) {
  const playerOffers = offers.filter(o => o.playerId === playerId && o.remaining > 0);
  if (playerOffers.length >= MAX_OFFERS_PER_PLAYER) return null;

  const offer = {
    id: nextOfferId++,
    type, // 'buy' or 'sell'
    playerId, playerName,
    itemId, itemName,
    quantity, remaining: quantity,
    price,
    collected: 0, // coins (for sell) or items (for buy) ready to collect
    collectedCoins: 0,
    timestamp: Date.now(),
  };
  offers.push(offer);
  matchOffers(offer);
  return offer;
}

function matchOffers(newOffer) {
  const opposing = offers.filter(o =>
    o.itemId === newOffer.itemId &&
    o.type !== newOffer.type &&
    o.remaining > 0 &&
    o.playerId !== newOffer.playerId &&
    (newOffer.type === 'buy' ? o.price <= newOffer.price : o.price >= newOffer.price)
  );

  // Sort: buyers want cheapest first, sellers want highest first
  if (newOffer.type === 'buy') opposing.sort((a, b) => a.price - b.price);
  else opposing.sort((a, b) => b.price - a.price);

  for (const match of opposing) {
    if (newOffer.remaining <= 0) break;
    const tradeQty = Math.min(newOffer.remaining, match.remaining);
    const tradePrice = match.price; // Older offer sets price

    newOffer.remaining -= tradeQty;
    match.remaining -= tradeQty;

    if (newOffer.type === 'buy') {
      // Buyer gets items, refund price diff
      newOffer.collected += tradeQty;
      newOffer.collectedCoins += (newOffer.price - tradePrice) * tradeQty; // Refund overpay
      // Seller gets coins (minus 1% tax)
      const sellerCoins = Math.floor(tradePrice * tradeQty * 0.99);
      match.collectedCoins += sellerCoins;
    } else {
      // Seller gets coins
      const sellerCoins = Math.floor(tradePrice * tradeQty * 0.99);
      newOffer.collectedCoins += sellerCoins;
      // Buyer gets items
      match.collected += tradeQty;
      match.collectedCoins += (match.price - tradePrice) * tradeQty;
    }
  }
}

function getPlayerOffers(playerId) {
  return offers.filter(o => o.playerId === playerId);
}

function collectOffer(offerId) {
  const offer = offers.find(o => o.id === offerId);
  if (!offer) return null;
  const collected = { items: offer.collected, coins: offer.collectedCoins };
  offer.collected = 0;
  offer.collectedCoins = 0;
  // Remove if fully traded and collected
  if (offer.remaining <= 0) {
    const idx = offers.indexOf(offer);
    if (idx >= 0) offers.splice(idx, 1);
  }
  return collected;
}

function cancelOffer(offerId) {
  const idx = offers.findIndex(o => o.id === offerId);
  if (idx < 0) return null;
  const offer = offers[idx];
  const refund = {
    items: offer.type === 'sell' ? offer.remaining : offer.collected,
    coins: offer.type === 'buy' ? offer.remaining * offer.price : offer.collectedCoins,
  };
  // Add any uncollected
  refund.items += offer.collected;
  refund.coins += offer.collectedCoins;
  offers.splice(idx, 1);
  return { offer, refund };
}

function getPrice(itemId) {
  // Average of recent trades or last sell price
  const sellOffers = offers.filter(o => o.itemId === itemId && o.type === 'sell' && o.remaining < o.quantity);
  if (sellOffers.length) return sellOffers[sellOffers.length - 1].price;
  return null;
}

function saveGE() {
  persistence.save('ge.json', { offers, nextOfferId });
}

function loadGE() {
  const data = persistence.load('ge.json', { offers: [], nextOfferId: 1 });
  offers.length = 0;
  offers.push(...(data.offers || []));
  nextOfferId = data.nextOfferId || 1;
}

module.exports = { createOffer, getPlayerOffers, collectOffer, cancelOffer, getPrice, saveGE, loadGE, offers };
