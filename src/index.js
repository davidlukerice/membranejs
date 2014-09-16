
function log(msg) {
  $('.log').prepend(msg+'<br>');
}

var PSystem = function(params) {
  _.assign(this, {
    membrane: null,
    externalWorld: ''
  }, params);
};
PSystem.prototype.simulate = function(stepLimit) {
  var solutionFound = false;
  stepLimit = stepLimit || 100;
  log('simulating');
  for (var i=0; i<stepLimit && !solutionFound; ++i) {
    log('- step: '+(i+1));
    solutionFound = this.membrane.step(this.externalWorld);
    log('world: '+JSON.stringify(this.externalWorld));
  }
  log('finished');
}

var PMembrane = function(params) {
  _.assign(this, {
    // Rules:
    // in
    // out
    // dissolve
    // other1
    // other2
    rules: [],
    world: '',
    childrenMembranes: []
  }, params);
};
PMembrane.prototype.step = function(externalWorld) {
  _.forEach(this.childrenMembranes, function(membrane) {
    membrane.step(this.world);
  });

  _.forEach(this.world, function(symbol, i, world) {
    var possibleActions = this.getActionsForSymbol(symbol);
    if (possibleActions.length === 0)
      return false;

    var action = possibleActions[
      Math.floor(Math.random()*possibleActions.length)
    ];
    return action();
  });

  // TODO: Simulate current brane

  // TODO: Return if a solution is found or dissolved?
  return false;
};
PMembrane.prototype.getActionsForSymbol = function(symbol) {
  // TODO
  return [];
};


//main
var topMembrane = new PMembrane({

});
var system = new PSystem({
  membrane: topMembrane
});

system.simulate();
