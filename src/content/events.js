// Order and side of every ceremony. Words live in en.js / bn.js / hi.js.

export const EVENTS = [
  { id: 'briddhi', side: 'bride' },
  { id: 'tilak', side: 'groom' },
  { id: 'mehendi', side: 'bride' },
  { id: 'aiburobhaat', side: 'bride' },
  { id: 'haldi', side: 'groom' },
  { id: 'sangeet', side: 'both' },
  { id: 'wedding', side: 'both' },
  { id: 'reception', side: 'groom' },
]

// 27 January 2027, 5:30 PM in India
export const WEDDING_AT = new Date('2027-01-27T17:30:00+05:30').getTime()
