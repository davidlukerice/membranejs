var MJS = require('MJS/mjs')['default'],
    Rule = require('MJS/rule')['default'];

module("Rule Tests");
test('clone', function() {
  var rule = new Rule({
    type: Rule.Type.EVOLVE,
    reactants:{'a':1},
    products:{'b':1},
  });
  var clonedRule = rule.clone();
  equal(rule.type, clonedRule.type, 'cloned rule types are the same');
  notEqual(rule, clonedRule, 'but rules aren\'t the same');
  equal(rule.products.b, clonedRule.products.b, 'same products amounts');
  notEqual(rule.products, clonedRule.products, 'but different product objects');
});

test('numberApplications', function() {
  var rule = new Rule({
    type: Rule.Type.EVOLVE,
    reactants:{'a':1},
    products:{'b':1},
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
    reactants:{'a':1},
    products:{'b':1},
  });

  var world = {};
  var applied = rule.applyRule(world);
  ok(!applied, 'not applied');

  world = {a:1, c:5};
  var oldWorld = _.cloneDeep(world);
  applied = rule.applyRule(oldWorld, world);
  ok(applied, 'applied');
  equal(world.a, 0, 'removed requirement symbol');
  equal(oldWorld.b, undefined, 'didn\'t add product symbol to old world');
  equal(world.b, 1, 'added product symbol to world');
  equal(world.c, 5, 'other untouched');

  rule = new Rule({
    type: Rule.Type.EVOLVE,
    reactants:{'a':1, 'b': 1},
    products:{'c':1},
  });
  world = {a:1};
  oldWorld = _.cloneDeep(world);
  applied = rule.applyRule(oldWorld, world);
  ok(!applied, 'not applied');
  equal(world.a, 1, 'doesn\'t apply without all reactants');

  world = {a:1, b:1};
  oldWorld = _.cloneDeep(world);
  applied = rule.applyRule(oldWorld, world);
  ok(applied, 'applied');
  ok(oldWorld.a === 0 && oldWorld.b === 0 && oldWorld.c === undefined, 'doesn\'t apply multiple reactants to old world');
  ok(world.a === 0 && world.b === 0 && world.c === 1, 'applies multiple requirementsto world');

  rule = new Rule({
    type: Rule.Type.EVOLVE,
    reactants:{'a':1},
    products:{'c':1, 'b': 1},
  });
  world = {a:1};
  oldWorld = _.cloneDeep(world);
  applied = rule.applyRule(oldWorld, world);
  ok(applied, 'applied');
  ok(oldWorld.a === 0 && oldWorld.b === undefined && oldWorld.c === undefined, 'does\'t apply multiple products to old world');
  ok(world.a === 0 && world.b === 1 && world.c === 1, 'applies multiple products to world');

  rule = new Rule({
    type: Rule.Type.DISSOLVE,
    reactants:{'a':1},
    products:{'b':1},
  });
  world = {a:1};
  oldWorld = _.cloneDeep(world);
  var result = rule.applyRule(oldWorld, world);
  ok(result.b === 1, 'applied dissolve rule returns product');
  ok(oldWorld.a === 0 && oldWorld.b === undefined, 'dissolve does\'t apply products to old world');
  ok(world.a === 0 && world.b === undefined, 'dissolve doesn\'t apply dissolve products to world');

  rule = new Rule({
    type: Rule.Type.SEND_IN,
    reactants:{'a':2},
    products:{'b':1},
  });
  world = {a:2};
  oldWorld = _.cloneDeep(world);
  var childMembranes = [{world:{}}];
  result = rule.applyRule(oldWorld, world, []);
  ok(result === false, 'send in rule not applied with no children');
  result = rule.applyRule(oldWorld, world, childMembranes);
  ok(world.a === 0 && world.b === undefined, 'world no longer has send in reactants');
  ok(childMembranes[0].world.a === undefined && childMembranes[0].world.b === 1, 'products sent into world');
  ok(result === true, 'nothing sent out in result');
});
