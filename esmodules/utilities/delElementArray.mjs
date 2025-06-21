export const delElementArray = function(arr, val) {
  return arr.filter(function(el){ 
    return el != val; 
  });
}