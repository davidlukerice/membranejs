import MJS from 'MJS/mjs';

var MSystem = function(params) {
  _.assign(this, {
    membrane: null,
    world: {}
  }, params);
};

MSystem.prototype.clone = function() {
  return new MSystem({
    membrane: this.membrane.clone(),
    world: _.cloneDeep(this.world)
  });
};

MSystem.prototype.simulate = function(stepLimit) {
  var outCome = true;
  stepLimit = stepLimit || 100;
  MJS.log('simulating');
  for (var i=0; i<stepLimit && outCome; ++i) {
    MJS.log('- step: '+(i+1));
    MJS.log('system world before: '+this.toString());
    outCome = this.membrane.step(this.world);
    if (outCome.dissolved)
      throw 'Error: Outermost membrane dissolved';
    MJS.log('system world after: '+this.toString());
  }
  if (i === stepLimit)
    MJS.log('step limit('+stepLimit+') reached');
  MJS.log('finished');
};
MSystem.prototype.toString = function() {
  return this.worldToString() +' '+ this.membrane.toString();
};
MSystem.prototype.worldToString = function () {
  return MJS.setToString(this.world);
};

MJS.MSystem = MSystem;
export default MSystem;
