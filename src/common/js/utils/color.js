export const randomColor = function () {
  return (
    '#' +
    ('00000' + Math.floor(Math.random() * 16777216).toString(16)).slice(-6)
  );
};

export const getSaturatedColor = function (v) {
  var i = Math.floor(v * 6);
  var f = (v * 6 - i + 1) % 1;
  var q = ('0' + Math.round(255 * (1 - f)).toString(16)).slice(-2);
  var t = ('0' + Math.round(255 * f).toString(16)).slice(-2);
  switch ((i + 6) % 6) {
    case 0:
      return '#FF' + t + '00';
    case 1:
      return '#' + q + 'FF00';
    case 2:
      return '#00FF' + t;
    case 3:
      return '#00' + q + 'FF';
    case 4:
      return '#' + t + '00FF';
    case 5:
      return '#FF00' + q;
  }
};

export const RGBToHex = function (r, g, b) {
  return (
    '#' +
    ('0' + Math.floor(r).toString(16)).slice(-2) +
    ('0' + Math.floor(g).toString(16)).slice(-2) +
    ('0' + Math.floor(b).toString(16)).slice(-2)
  );
};
