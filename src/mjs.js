
/**
 * membrane.js global object
 */
var MJS = {};

MJS.log = function(msg) {
  if (console)
    console.log(msg);
  if (typeof $ !== 'undefined')
    $('.log').prepend(msg+'<br>');
};

/**
 * @param {[type]} set {symbol:count,...}
 */
MJS.setToString = function(set) {
  var chars = ['['];
  _.forEach(set, function(count, symbol) {
    _.times(count, function(){
      chars.push(symbol);
    });
  });
  chars.push(']');
  return chars.join(' ');
};

MJS.selectRandomIn = function(xs) {
  return xs[Math.floor(Math.random()*xs.length)];
};

MJS.cloneObjectArray = function(xs) {
  return _.map(xs, function(x) {return x.clone;});
};

export default MJS;
