
// Placeholder global
var MJS = {};

MJS.log = function(msg) {
  if (console)
    console.log(msg);
  if (typeof $ !== 'undefined')
    $('.log').prepend(msg+'<br>');
}

var System = function(params) {
  _.assign(this, {
    membrane: null,
    world: {}
  }, params);
};
System.prototype.simulate = function(stepLimit) {
  var outCome = true;
  stepLimit = stepLimit || 100;
  MJS.log('simulating');
  for (var i=0; i<stepLimit && outCome; ++i) {
    MJS.log('- step: '+(i+1));
    MJS.log('system world before: '+this.worldToString());
    outCome = this.membrane.step(this.world);
    MJS.log('system world after: '+this.worldToString());
  }
  MJS.log('finished');
};
System.prototype.worldToString = function () {
  return setToString(this.world);
};

var Rule = function(params) {
  _.assign(this, {
    type: Rule.Type.EVOLVE,
    requirements: {},
    output: {},
    charge: null,
    label: null
  }, params);
};

var Membrane = function(params) {
  _.assign(this, {
    // array of Rules
    rules: [],
    // set of object definitions symbol:count
    world: {},
    // children Membranes
    childrenMembranes: [],
    label: null,
    charge: null
  }, params);
};
Membrane.prototype.step = function(externalWorld) {
  var self = this,
      anyRulesApplied = false;
  _.forEach(this.childrenMembranes, function(membrane) {
    // TODO: Handle sendOut returns
    // TODO: Handle if anything was applied
    var result = membrane.step(this.world);
  });

  // Get all the rules that can apply
  var applicableRules = [];
  _.forEach(this.rules, function(rule) {
    _.times(rule.numberApplications(self.world), function() {
      applicableRules.push(rule);
    });
  });

  MJS.log('membrane before: '+this.toString());

  // Simulate applicable rules
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
    if (result)
      anyRulesApplied = true;
  });

  MJS.log('membrane after: '+this.toString());

  // TODO: Return {dissolve: true} if membrane is disolved
  // TODO: Return true if had rules applied
  // otherwise return false
  return anyRulesApplied;
};
Membrane.prototype.getActionsForSymbol = function(symbol) {
  // TODO
  return [];
};
Membrane.prototype.toString = function() {
  return this.worldToString();
};
Membrane.prototype.worldToString = function () {
  return setToString(this.world);
};

var Rule = function(params) {
  _.assign(this, {
    type: Rule.Type.EVOLVE,
    requirements: {},
    output: {},
    charge: null,
    label: null
  }, params);
};
Rule.prototype.numberApplications = function(world) {
  var self = this,
      num = 0,
      tempWorld = _.cloneDeep(world),
      applied;
  do {
    applied = this.applyRule(tempWorld);
    if (applied) {
      num+=1;
    }
  } while(applied);
  return num;
};
/**
 * Apply the rule to the given world. Only updates the world
 * if it can actually apply the rule
 * @param  {object} oldWorld {symbol:count,...} world to decrement but not add to
 * @param  {object} world {symbol:count,...} (optional) world to both decrement and add to
 * @return {bool/object} Whether the rule was applied or not, or world set object if sending out
 */
Rule.prototype.applyRule = function(oldWorld, world) {
  var self = this,
      applied = true,
      sendOutSet = {};

  // First preprocess to check if all rules can apply
  _.forEach(self.requirements, function(count, symbol) {
    if (typeof oldWorld[symbol] === 'undefined' || oldWorld[symbol] < count) {
      applied = false;
      return false;
    }
  });

  // Then apply them all if possible
  if (applied) {
    _.forEach(self.requirements, function(count, symbol) {
      oldWorld[symbol]-= count;
      if (world)
        world[symbol]-= count;
    });

    if (world)
      MJS.log('apply rule: '+this.toString());

    _.forEach(self.output, function(count, symbol) {
      var w = world;
      if (self.type === Rule.Type.SEND_OUT)
        w = sendOutSet;

      if (w && typeof w[symbol] === 'undefined')
        w[symbol] = 0;
      if (w)
        w[symbol]+=count;
    });
  }

  if (_.keys(sendOutSet).length) {
    return sendOutSet;
  }
  return applied;
};
Rule.prototype.toString = function() {
  return "Rule("+this.type+") req"+setToString(this.requirements)+' out'+setToString(this.output);
};

Rule.Type = {
  EVOLVE: 'evolve',
  SEND_OUT: 'sendOut'
  // TODO other rule types
  //SEND_IN: 'sendIn',
  //DISOLVE: 'disolve',
  //ELEMENTARY_DIVISION: 'elementaryDivision',
  //NONELEMENTARY_DIVIONS: 'nonelementaryDivision'
};

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

/**
 * @param {[type]} set {symbol:count,...}
 */
function setToString(set) {
  var chars = ['['];
  _.forEach(set, function(count, symbol) {
    _.times(count, function(){
      chars.push(symbol);
    });
  });
  chars.push(']');
  return chars.join(' ');
}
