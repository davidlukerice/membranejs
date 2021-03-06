import MJS from 'MJS/mjs';

var Rule = function(params) {
  _.assign(this, {
    type: Rule.Type.EVOLVE,
    // symbols consumed by the rule
    reactants: {},
    // symbols generated by the rule
    products: {},
    charge: null,
    label: null
  }, params);

  if (typeof this.type === 'undefined')
    throw 'Unsupported Rule Type('+this.type+')';
};

Rule.prototype.clone = function() {
  return new Rule({
    type: this.type,
    reactants: _.cloneDeep(this.reactants),
    products: _.cloneDeep(this.products),
    charge: this.charge,
    label: this.label
  });
};

/**
 * Gets how many times a rule can be applied on the given world and membrane children
 * @param {Object} world             Multiset of world objects
 * @param {Array} childrenMembranes  List of the current membrane's children
 * @return Number of times this rule can be applied
 */
Rule.prototype.numberApplications = function(world, childrenMembranes) {
  var self = this,
      num = 0,
      tempWorld = _.cloneDeep(world),
      applied;
  do {
    applied = this.applyRule(tempWorld, MJS.cloneObjectArray(childrenMembranes));
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
 * @param {Array} childrenMembranes  (optional) List of the current membrane's children
 * @return {bool/object} Whether the rule was applied or not, or world set object if sending out
 */
Rule.prototype.applyRule = function(oldWorld, world, childrenMembranes) {
  var self = this,
      applied = true,
      sendOutSet = {};

  if (_.isArray(world)) {
    childrenMembranes = world;
    world = null;
  }

  // First preprocess to check if all reactants exist and the rule can be applied
  _.forEach(self.reactants, function(count, symbol) {
    if (typeof oldWorld[symbol] === 'undefined' || oldWorld[symbol] < count) {
      applied = false;
      return false;
    }
  });

  // Send in rules require some children membrane to send in to
  if (this.type === Rule.Type.SEND_IN && (!childrenMembranes || childrenMembranes.length===0)) {
    applied = false;
  }

  // Then apply if possible
  if (applied) {
    _.forEach(self.reactants, function(count, symbol) {
      oldWorld[symbol]-= count;
      if (world)
        world[symbol]-= count;
    });

    if (world)
      MJS.log('apply rule: '+this.toString());

    _.forEach(self.products, function(count, symbol) {
      var w = world;
      if (self.type === Rule.Type.SEND_OUT ||
          self.type === Rule.Type.DISSOLVE)
      {
        w = sendOutSet;
      }
      else if (self.type === Rule.Type.SEND_IN) {
        w = MJS.selectRandomIn(childrenMembranes).world;
      }

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
  return "Rule("+this.type+") react"+MJS.setToString(this.reactants)+' prod'+MJS.setToString(this.products);
};

Rule.Type = {
  EVOLVE: 'evolve',
  SEND_OUT: 'sendOut',
  DISSOLVE: 'dissolve',
  SEND_IN: 'sendIn'
  // TODO other rule types
  //ELEMENTARY_DIVISION: 'elementaryDivision',
  //NONELEMENTARY_DIVIONS: 'nonelementaryDivision'
};

MJS.Rule = Rule;
export default Rule;
