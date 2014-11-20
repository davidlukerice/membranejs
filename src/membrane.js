
// Placeholder global
var MJS = {};

var System = function(params) {
  _.assign(this, {
    membrane: null,
    externalWorld: ''
  }, params);
};
System.prototype.simulate = function(stepLimit) {
  var outCome = true;
  stepLimit = stepLimit || 100;
  log('simulating');
  for (var i=0; i<stepLimit && outCome; ++i) {
    log('- step: '+(i+1));
    outCome = this.membrane.step(this.externalWorld);
    log('world: '+JSON.stringify(this.externalWorld));
  }
  log('finished');
}

var Membrane = function(params) {
  _.assign(this, {
    // Rules:
    // TODO evolve
    // TODO send-in
    // TODO send-out
    // TODO dissolve
    // TODO elementary-division
    // TODO nonelementary-division
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
  var self = this;
  _.forEach(this.childrenMembranes, function(membrane) {
    membrane.step(this.world);
  });

  // Get all the rules that can apply
  var applicableRules = [];
  _.forEach(this.rules, function(rule) {
    _.times(rule.numberApplications(self.world), function() {
      applicableRules.push(rule);
    });
  });

  log('membrane: '+this.toString());

  // Simulate current brane
  shuffle(applicableRules);
  var anyRulesApplied = false;
  _.forEach(applicableRules, function(rule) {
    var applied = rule.applyRule(self.world);
    if (applied)
      anyRulesApplied = true;
  });

  // TODO: Return {symbol:count} set if anything is sent out
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
  var chars = ['['];
  _.forEach(this.world, function(count, symbol) {
    _.times(count, function(){
      chars.push(symbol);
    });
  });
  chars.push(']');
  return chars.join(' ');
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
      tempWorld = _.cloneDeep(world);
  do {
    var applied = this.applyRule(tempWorld, false);
    if (applied) {
      num+=1;
    }
  } while(applied);
  return num;
};
/**
 * Apply the rule to the given world. Only updates the world
 * if it can actually apply the rule
 * @param  {object} world {symbol:count,...}
 * @param  {bool} Should the output of the rule be added to the rule (default: true)
 * @return {bool} Whether the rule was applied or not
 */
Rule.prototype.applyRule = function(world, addOutput) {
  var self = this,
      applied = true;
  if (typeof addOutput === 'undefined') {
    addOutput = true;
  }

  // First preprocess to check if all rules can apply
  _.forEach(self.requirements, function(count, symbol) {
    if (world[symbol] < count) {
      applied = false;
      return false;
    }
  });

  // Then apply them all if possible
  if (applied) {
    _.forEach(self.requirements, function(count, symbol) {
      world[symbol]-= count;
    });

    if (addOutput) {
      _.forEach(self.output, function(count, symbol) {
        if (typeof world[symbol] === 'undefined')
          world[symbol] = 0;
        world[symbol]+=count;
      });
    }
  }

  return applied;
};

Rule.Type = {
  EVOLVE: 'evolve',
  //DISOLVE: 'disolve'.
  //SEND_IN: 'send-in',
  //SEND_OUT: 'send-out'
};

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}
