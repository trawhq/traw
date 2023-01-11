export const getFormattedTime = (time: number) => {
  let delta = Math.abs(time) / 1000;

  const hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;
  const minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;
  const seconds = Math.floor(delta % 60);

  let timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  timeString = hours > 0 ? `${hours.toString().padStart(2, '0')}:${timeString}` : timeString;

  return timeString;
};
