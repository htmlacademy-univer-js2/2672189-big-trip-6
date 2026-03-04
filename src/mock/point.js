export const POINT_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant',
];

export const DESTINATIONS = [
  {
    id: 1,
    name: 'Bern',
    description: 'Aliquam id orci ut lectus varius viverra',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=1', description: 'Bern photo' },
      { src: 'https://loremflickr.com/248/152?random=2', description: 'Bern photo' },
    ],
  },
  {
    id: 2,
    name: 'Paris',
    description: 'Sed sed nisi sed augue convallis suscipit in sed felis',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=3', description: 'Paris photo' },
    ],
  },
  {
    id: 3,
    name: 'Madrid',
    description: 'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=4', description: 'Madrid photo' },
      { src: 'https://loremflickr.com/248/152?random=5', description: 'Madrid photo' },
    ],
  },
  {
    id: 4,
    name: 'Oslo',
    description: 'Cras aliquet varius magna, non porta ligula feugiat eget',
    pictures: [
      { src: 'https://loremflickr.com/248/152?random=6', description: 'Oslo photo' },
    ],
  },
];

export const OFFERS = [
  { id: 1, title: 'Add luggage', price: 50 },
  { id: 2, title: 'Switch to comfort', price: 80 },
  { id: 3, title: 'Add meal', price: 15 },
  { id: 4, title: 'Choose seats', price: 5 },
];

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRoutePoint() {
  const randomType = POINT_TYPES[generateRandomNumber(0, POINT_TYPES.length - 1)];
  const randomDestination = DESTINATIONS[generateRandomNumber(0, DESTINATIONS.length - 1)].id;
  const randomPrice = generateRandomNumber(10, 500);

  return {
    id: crypto.randomUUID(),
    type: randomType,
    destination: randomDestination,
    dateFrom: '2024-03-18T10:30',
    dateTo: '2024-03-18T11:00',
    basePrice: randomPrice,
    offers: [1, 2],
    isFavorite: Boolean(generateRandomNumber(0, 1)),
  };
}
