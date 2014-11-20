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
  applied = rule.applyRule(world);
  ok(applied, 'applied');
  equal(world.a, 0, 'removed requirement symbol');
  equal(world.b, 1, 'added output symbol');
  equal(world.c, 5, 'other untouched');

  rule = new Rule({
    type: Rule.Type.EVOLVE,
    requirements:{'a':1, 'b': 1},
    output:{'c':1},
  });
  world = {a:1};
  applied = rule.applyRule(world);
  ok(!applied, 'not applied');
  equal(world.a, 1, 'doesn\'t apply without all requirements');
  world = {a:1, b:1};
  applied = rule.applyRule(world);
  ok(applied, 'applied');
  ok(world.a === 0 && world.b === 0 && world.c === 1, 'applies multiple requirements');

  rule = new Rule({
    type: Rule.Type.EVOLVE,
    requirements:{'a':1},
    output:{'c':1, 'b': 1},
  });
  world = {a:1};
  applied = rule.applyRule(world);
  ok(applied, 'applied');
  ok(world.a === 0 && world.b === 1 && world.c === 1, 'applies multiple outputs');
});
