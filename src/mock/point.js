import dayjs from 'dayjs';

export const DESTINATIONS = [
  {
    id: 1,
    name: 'Amsterdam',
    description: 'Amsterdam — famous for its crowded street markets',
    pictures: []
  },
  {
    id: 2,
    name: 'Geneva',
    description: 'Geneva — with an old town, museums and parks',
    pictures: []
  },
  {
    id: 3,
    name: 'Chamonix',
    description: 'Chamonix — with beautiful mountain views',
    pictures: []
  }
];

export const OFFERS = [
  {
    type: 'train',
    offers: [
      { id: 1, title: 'Order a breakfast', price: 50 },
      { id: 2, title: 'Wake up at a certain time', price: 30 }
    ]
  },
  {
    type: 'flight',
    offers: [
      { id: 3, title: 'Add luggage', price: 30 },
      { id: 4, title: 'Switch to comfort class', price: 100 }
    ]
  },
  {
    type: 'drive',
    offers: [
      { id: 5, title: 'With automatic transmission', price: 40 },
      { id: 6, title: 'With air conditioning', price: 20 }
    ]
  }
];

export const POINTS = [
  {
    id: '1',
    type: 'train',
    basePrice: 2684,
    dateFrom: dayjs('2026-03-28T11:00').toDate(),
    dateTo: dayjs('2026-03-29T10:10').toDate(),
    destination: 1,
    offers: [1, 2]
  },
  {
    id: '2',
    type: 'drive',
    basePrice: 5003,
    dateFrom: dayjs('2026-03-21T13:12').toDate(),
    dateTo: dayjs('2026-03-23T09:32').toDate(),
    destination: 2,
    offers: [5, 6]
  },
  {
    id: '3',
    type: 'flight',
    basePrice: 697,
    dateFrom: dayjs('2026-03-24T03:14').toDate(),
    dateTo: dayjs('2026-03-26T03:20').toDate(),
    destination: 3,
    offers: [3, 4]
  }
];
