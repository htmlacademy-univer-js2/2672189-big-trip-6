export function adaptPointToClient(point) {
  const {
    base_price: basePrice,
    date_from: dateFrom,
    date_to: dateTo,
    is_favorite: isFavorite,
    ...restPoint
  } = point;

  return {
    ...restPoint,
    basePrice,
    dateFrom: new Date(dateFrom),
    dateTo: new Date(dateTo),
    isFavorite,
  };
}

export function adaptPointToServer(point, { includeId = true } = {}) {
  const serverPoint = {
    destination: point.destination,
    offers: [...point.offers],
    type: point.type,
  };

  if (includeId) {
    serverPoint.id = point.id;
  }

  serverPoint['base_price'] = Number(point.basePrice);
  serverPoint['date_from'] = point.dateFrom.toISOString();
  serverPoint['date_to'] = point.dateTo.toISOString();
  serverPoint['is_favorite'] = point.isFavorite;

  return serverPoint;
}
