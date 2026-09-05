const RESTAURANT_TIME_ZONE = "Asia/Ho_Chi_Minh";

const getRestaurantWallClockNow = (instant = new Date()) => {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone: RESTAURANT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant).reduce((parts, part) => {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
    return parts;
  }, {});

  return new Date(Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  ));
};

const getRestaurantDateInputValue = (daysToAdd = 0) => {
  const date = getRestaurantWallClockNow();
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
};

const formatReservationDate = (value, options = {}) => new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  ...options,
}).format(new Date(value));

const formatReservationTime = (value) => new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(new Date(value));

const formatReservationDateTime = (value) => `${formatReservationDate(value)} · ${formatReservationTime(value)}`;
const isReservationPast = (value) => new Date(value) < getRestaurantWallClockNow();

export {
  formatReservationDate,
  formatReservationDateTime,
  formatReservationTime,
  getRestaurantDateInputValue,
  getRestaurantWallClockNow,
  isReservationPast,
};
