import MJS from 'MJS/mjs';
import Rule from 'MJS/rule';

var idCounter = 0;

var Membrane = function(params) {
  _.assign(this, {
    // array of Rules
    rules: [],
    // set of object definitions symbol:count
    world: {},
    // children Membranes
    membranes: [],
    label: null,
    charge: null
  }, params);
  this.id = ++idCounter;
};
/**
 * Simulates a single step for the membrane and its inner membranes
 * @param  {object} externalWorld A world object set
 * @return {bool/object} true if a rule was applied, false otherwise, {dissolved: true} if dissolved
 */
Membrane.prototype.step = function(externalWorld) {
  var self = this,
      anyRulesApplied = false,
      hasDissolved = false;

  // Step inner membranes first
  for (var i = 0; i < this.membranes.length; ++i) {
    var membrane = this.membranes[i];
    var result = membrane.step(self.world);
    if (result.dissolved) {
      MJS.log('dissolving '+membrane.id);
      this.membranes.splice(i--, 1);
    }
    if (result) {
      anyRulesApplied = true;
    }
  }

  // Get all the rules that can apply
  var applicableRules = [];
  _.forEach(this.rules, function(rule) {
    _.times(rule.numberApplications(self.world), function() {
      applicableRules.push(rule);
    });
  });

  MJS.log('membrane before: '+this.toString());

  // Apply rules in random order and skip those that no longer apply
  shuffle(applicableRules);
  var oldWorld = _.cloneDeep(this.world);
  _.forEach(applicableRules, function(rule) {
    var result = rule.applyRule(oldWorld, self.world);
    if (_.isObject(result)) {
      _.forEach(result, function(count, symbol) {
        if (typeof externalWorld[symbol] === 'undefined')
          externalWorld[symbol] = 0;
        externalWorld[symbol]+=count;
      });
    }
    if (result) {
      anyRulesApplied = true;
      if (rule.type === Rule.Type.DISSOLVE) {
        hasDissolved = true;
        return false;
      }
    }
  });

  MJS.log('membrane after: '+this.toString());

  if (hasDissolved)
    return {dissolved: true};
  return anyRulesApplied;
};
Membrane.prototype.toString = function() {
  var world = this.worldToString();
  var children = '';
  _.forEach(this.membranes, function(membrane) {
    children+=membrane.toString();
  });
  return '('+this.id+')['+(world.slice(1,world.length-1))+children+']';
};
Membrane.prototype.worldToString = function () {
  return MJS.setToString(this.world);
};

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

MJS.Membrane = Membrane;
export default Membrane;
