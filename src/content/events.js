// Order, side and map query of every ceremony. Words live in en.js / bn.js / hi.js.
const HAMRAY = "Hotel De'Hamray, New Kalimati Road, Sakchi, Jamshedpur"
const TELCO = 'Telco Club, Telco Colony, Jamshedpur'

export const EVENTS = [
  { id: 'briddhi', side: 'bride' },
  { id: 'tilak', side: 'groom', map: HAMRAY },
  { id: 'mehendi', side: 'bride' },
  { id: 'aiburobhaat', side: 'bride' },
  { id: 'haldi', side: 'groom', map: HAMRAY },
  { id: 'sangeet', side: 'both', map: TELCO },
  { id: 'wedding', side: 'both', map: TELCO },
  { id: 'reception', side: 'groom', map: HAMRAY },
]

export const mapUrl = (q) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q)

// 27 January 2027, 5:30 PM in India
export const WEDDING_AT = new Date('2027-01-27T17:30:00+05:30').getTime()
