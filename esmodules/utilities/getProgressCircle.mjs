export const getProgressCircle = function({ current = 100, max = 100, radius = 16 }) {
  let circumference = radius * 2 * Math.PI;
  let percent = current < max ? current / max : 1;
  let percentNumber = percent * 100;
  let offset = circumference - (percent * circumference);
  let strokeWidth = 4;
  let diameter = (radius * 2) + strokeWidth;
  let colorClass = Math.round((percent * 100) / 10) * 10;

  return {
    radius: radius,
    diameter: diameter,
    strokeWidth: strokeWidth,
    circumference: circumference,
    offset: offset,
    position: diameter / 2,
    color: 'red',
    class: colorClass,
  };
};