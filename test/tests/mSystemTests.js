var MJS = require('MJS/mjs')['default'],
    Rule = require('MJS/rule')['default'],
    Membrane = require('MJS/membrane')['default'],
    MSystem = require('MJS/mSystem')['default'];

module("MSystem Tests");
test('clone', function() {
  var membrane = new Membrane({
    world: {'a':4},
    rules: [
      new Rule({
        type: Rule.Type.EVOLVE,
        reactants:{'a':1},
        products:{'b':1},
      })
    ]
  });
  var system = new MSystem({
    membrane: membrane,
    world: {'b':1}
  });
  var cloneSystem = system.clone();
  equal(system.membrane.id, cloneSystem.membrane.id, 'membrane ids are the same');
  notEqual(system.membrane, cloneSystem.membrane, 'but membranes aren\'t the same');
  equal(system.world.b, cloneSystem.world.b, 'same world amounts');
  notEqual(system.world, cloneSystem.world, 'but different worlds');
});
