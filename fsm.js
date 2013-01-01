define(function(){
  function FSMBase(){}
  FSMBase.prototype = {
    $init: function(){
      this.$dive(this.$seed);
    },
    $dive: function(state, args){ /* change state */
      var self = this,
      handler;
      if(self.$state){
        self.$fire('$leave', args);
      }
      self.$state = state;
      self.$fire('$enter', args);
    },
    $fire: function(event, args){
      args = args || [];
      var self = this,
      events = self.$spec[self.$state],
      handler = events[event] || events.$other;
      if(handler){
        if(handler == events.$other){
          args.unshift(event);
        }
        return handler.apply(self, args);
      }
    }
  };
  /*
   * {
   *   state: {
   *     event: function
   *   }
   * }
   *
   */
  return function(seed, spec, prot){
    function FSM(){
      this.$dive.call(this, this.$seed, arguments);
    }
    var proto = FSM.prototype = new FSMBase();
    for(var i in prot){
      (i in proto) || (proto[i] = prot[i]);
    }
    proto.$seed = seed;
    proto.$spec = spec;
    return FSM;
  };
});
