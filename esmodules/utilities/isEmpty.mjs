export const isEmpty = function(arg) {
  return [null, false, undefined, 0, ''].includes(arg);
};