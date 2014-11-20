module("Rule Tests");
test('numberApplications', function() {
  var rule = new Rule({
    type: Rule.Type.EVOLVE,
    requirements:{'a':1},
    output:{'b':1},
  });

  equal(rule.numberApplications({}), 0, 'No applications on empty ruleset');
  equal(rule.numberApplications({b:1}), 0, 'No applications on no match');
  equal(rule.numberApplications({a:1}), 1, 'Single match');
  equal(rule.numberApplications({a:2}), 2, 'Multiple match');
  equal(rule.numberApplications({a:2, b:1}), 2, 'Multiple match with set containing others');
});

test('apply', function() {
  var rule = new Rule({
    type: Rule.Type.EVOLVE,
    requirements:{'a':1},
    output:{'b':1},
  });

  var world = {};
  var applied = rule.applyRule(world);
  ok(!applied, 'not applied');

  world = {a:1, c:5};
  oldWorld = _.cloneDeep(world);
  applied = rule.applyRule(oldWorld, world);
  ok(applied, 'applied');
  equal(world.a, 0, 'removed requirement symbol');
  equal(oldWorld.b, undefined, 'didn\'t add output symbol to old world');
  equal(world.b, 1, 'added output symbol to world');
  equal(world.c, 5, 'other untouched');

  rule = new Rule({
    type: Rule.Type.EVOLVE,
    requirements:{'a':1, 'b': 1},
    output:{'c':1},
  });
  world = {a:1};
  oldWorld = _.cloneDeep(world);
  applied = rule.applyRule(oldWorld, world);
  ok(!applied, 'not applied');
  equal(world.a, 1, 'doesn\'t apply without all requirements');

  world = {a:1, b:1};
  oldWorld = _.cloneDeep(world);
  applied = rule.applyRule(oldWorld, world);
  ok(applied, 'applied');
  ok(oldWorld.a === 0 && oldWorld.b === 0 && oldWorld.c === undefined, 'doesn\'t apply multiple requirements to old world');
  ok(world.a === 0 && world.b === 0 && world.c === 1, 'applies multiple requirementsto world');

  rule = new Rule({
    type: Rule.Type.EVOLVE,
    requirements:{'a':1},
    output:{'c':1, 'b': 1},
  });
  world = {a:1};
  oldWorld = _.cloneDeep(world);
  applied = rule.applyRule(oldWorld, world);
  ok(applied, 'applied');
  ok(oldWorld.a === 0 && oldWorld.b === undefined && oldWorld.c === undefined, 'does\'t apply multiple outputs to old world');
  ok(world.a === 0 && world.b === 1 && world.c === 1, 'applies multiple outputs to world');
});
