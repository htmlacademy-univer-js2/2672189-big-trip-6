export const getDestination = (point, destinations) => (
  destinations.find((destination) => destination.id === point.destination)
);
