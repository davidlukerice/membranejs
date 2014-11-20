
function log(msg) {
  $('.log').prepend(msg+'<br>');
}

var topMembrane = new Membrane({
  world: {'a':3, 'b':2},
  rules: [
    new Rule({
      type: Rule.Type.EVOLVE,
      requirements:{'a':1},
      output:{'b':1},
    }),
    new Rule({
      type: Rule.Type.EVOLVE,
      requirements:{'b':2},
      output:{'c':1}
    })
  ]
});
var system = new System({
  membrane: topMembrane
});

system.simulate();
