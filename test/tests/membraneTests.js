module("Membrane Tests");
test('step', function() {
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
  equal(membrane.worldToString(), '[ a a a a ]', 'counts world correctly');
  var ruleApplied = membrane.step([]);
  equal(membrane.worldToString(), '[ b b b b ]', 'applies all possible rules');
  ok(ruleApplied === true, 'rule applied');

  var membrane = new Membrane({
    world: {'a':4},
    rules: [
    new Rule({
      type: Rule.Type.EVOLVE,
      reactants:{'b':1},
      products:{'c':1},
    })
    ]
  });
  ruleApplied = membrane.step([]);
  equal(membrane.worldToString(), '[ a a a a ]', 'same when no rules applied');
  ok(ruleApplied === false, 'no rule applied');

  membrane = new Membrane({
    world: {'a':4},
    rules: [
    new Rule({
      type: Rule.Type.EVOLVE,
      reactants:{'a':1},
      products:{'b':1},
    }),
    new Rule({
      type: Rule.Type.EVOLVE,
      reactants:{'b':2},
      products:{'c':1},
    })
    ]
  });
  membrane.step([]);
  membrane.step([]);
  equal(membrane.worldToString(), '[ c c ]', 'handles multiple single symbol requirement');
});

test('embedded membranes', function() {
  var inner = new Membrane({
    world: {'a':4},
    rules: [
    new Rule({
      type: Rule.Type.SEND_OUT,
      reactants:{'a':1},
      products:{'b':1},
    })
    ]
  });
  var outer = new Membrane({
    world: {},
    membranes: [inner],
    rules: []
  });
  equal(outer.worldToString(), '[ ]', 'empty initial outer membrane');
  var ruleApplied = outer.step([]);
  equal(outer.worldToString(), '[ b b b b ]', 'inner membrane applies all possible output rules');
  ok(ruleApplied === true, 'rule applied');

  inner = new Membrane({
    world: {'a':1},
    rules: [
    new Rule({
      type: Rule.Type.DISSOLVE,
      reactants:{'a':1},
      products:{'b':1},
    })
    ]
  });
  outer = new Membrane({
    membranes: [inner]
  });
  equal(outer.membranes.length, 1, 'has membrane before dissolve');
  var result = outer.step([]);
  equal(outer.membranes.length, 0, 'doesn\'t have membrane after dissolve');
  ok(outer.world.a === undefined && outer.world.b === 1, 'correct products from inner dissolved membrane');
});
