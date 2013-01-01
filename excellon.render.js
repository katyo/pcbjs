define(['./fsm'], function(FSM){
  var pi = Math.PI,
  dual_pi = 2 * pi,
  context = function(w, h){
    var canvas = document.createElement('canvas'),
    ctx = self.ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    return ctx;
  }, Plot = FSM('init', {
    init: {
      $enter: function(opt, box, ppi, col){
        var self = this;

        col = col || 'black';

        self.opt = opt;
        self.ppi = ppi;

        self.bx = box.x[0];
        self.by = box.y[0];

        var ctx = self.ctx = context(self.i2x(box.x[1]), self.i2y(box.y[1]));

        self.coord = {
          x: 0,
          y: 0
        };

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = col;
        ctx.fillStyle = col;

        self.$dive('work');
      }
    },
    work: {
      tool: function(cmd){
        var self = this,
        tool = self.opt.tools[cmd._];

        if(tool){
          self.radius = 0.5 * self.i2p(tool);
        }
      },
      hole: function(cmd){
        var self = this,
        coord = self.coord,
        ctx = self.ctx;

        self.to(cmd);

        ctx.beginPath();
        ctx.arc(coord.x, coord.y, self.radius, 0, dual_pi, false);
        ctx.fill();
      }
    }
  }, {
    i2p: function(val){ /* inch to pixel */
      return (this.ppi * val) ^ 0;
    },
    i2x: function(val){
      return this.i2p(val - this.bx);
    },
    i2y: function(val){
      return this.i2p(val - this.by);
    },
    to: function(cmd){ /* drag head to */
      var self = this,
      coord = self.coord,
      height = self.ctx.canvas.height;
      coord.x = ('x' in cmd ? self.i2x(cmd.x) : coord.x) + ('i' in cmd ? self.i2p(cmd.i) : 0);
      coord.y = height - ('y' in cmd ? self.i2y(cmd.y) : height - coord.y) + ('j' in cmd ? self.i2p(cmd.j) : 0);
    },
    im: function(){
      return this.ctx.canvas.toDataURL('png');
    }
  });

  return {
    render: function(data, ppi, color){
      var i,
      seq = data.ctl,
      cmd,
      plot = new Plot(data.opt, data.box, ppi, color);

      for(i in seq){
        cmd = seq[i];
        plot.$fire(cmd.$, [cmd]);
      }

      return plot.im();
    }
  };
});
