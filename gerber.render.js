define(['./fsm'], function(FSM){
  var M = Math,
  pi = M.PI,
  dual_pi = 2 * pi,
  half_pi = 0.5 * pi,
  quad_pi = 0.5 * half_pi,
  sin = M.sin,
  cos = M.cos,
  max = M.max,
  min = M.min,
  avg = function(){
    var a = arguments,
    l = a.length,
    c = 0,
    i = 0;
    for(; i < l; c += a[i++]);
    return c / l;
  },
  context = function(w, h){
    var canvas = document.createElement('canvas'),
    ctx = self.ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    return ctx;
  },
  hatch = function(c, s, d, a){
    c = c || 'black';
    if(typeof s == 'object'){
      d = s.dist;
      a = s.angle;
      s = s.size;
    }
    if(typeof s != 'number'){
      s = 0;
    }
    s = s || 1;
    d = d || 4;
    a = a || quad_pi;

    d = s * (d + 1);

    var w = d / sin(a),
    h = d / cos(a),
    ctx = context(w, h);

    ctx.lineWidth = s;
    ctx.strokeStyle = c;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, h);
    ctx.stroke();

    return ctx.canvas;
  },
  Plot = FSM('init', {
    init: {
      $enter: function(opt, box, ppi, col, hat){
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

        if(hat){
          self.hatch = ctx.createPattern(hatch(col, hat), 'repeat');
        }

        self.$dive('stay');
      }
    },
    stay: { /* default state */
      inter: function(cmd){
        this.it(cmd._);
      },
      apert: function(cmd){
        this.ap(cmd._);
      },
      region: function(cmd){
        if(cmd._){
          this.$dive('fill');
        }
      },
      burn: function(cmd){
        this.to(cmd);
        this.$dive('lite');
      },
      move: function(cmd){
        this.to(cmd);
        this.$dive('path');
      },
      draw: function(cmd){
        this.$dive('path');
        this.$fire('draw', cmd);
      }
    },
    path: { /* routing paths */
      $enter: function(){
        var self = this,
        coord = self.coord;

        self.ctx.beginPath();
        self.ctx.moveTo(coord.x, coord.y);
      },
      draw: function(cmd){
        var self = this,
        coord = self.coord;

        self.to(cmd);
        self.ctx.lineTo(coord.x, coord.y);
      },
      $other: function(evt, cmd){
        this.$dive('stay');
        this.$fire(evt, [cmd]);
      },
      $leave: function(){
        var self = this,
        ctx = self.ctx,
        apert = self.apert;

        ctx.lineWidth = apert.d || avg(apert.w, apert.h);
        ctx.stroke();
      }
    },
    lite: { /* flashing pads */
      $enter: function(){
        var self = this,
        ctx = self.ctx,
        coord = self.coord,
        apert = self.apert,
        $ = apert.$,
        _ = apert._,
        x = coord.x,
        y = coord.y,
        d = apert.d,
        w = apert.w,
        h = apert.h,
        _d = (0.5 * d),
        _w = (0.5 * w),
        _h = (0.5 * h);

        ctx.beginPath();
        if($ == 'circ'){
          ctx.arc(x, y, _d, 0, dual_pi, false);
        }else if($ == 'rect'){
          ctx.rect(x - _w, y - _h, w, h);
        }else if($ == 'oval'){
          var r = min(_w, _h),
          c_x = _w - r,
          c_y = _h - r;
          ctx.arc(x - c_x, y - c_y, r, 0, dual_pi, false);
          ctx.arc(x + c_x, y + c_y, r, 0, dual_pi, false);
          ctx.fill();
          ctx.beginPath();
          ctx.rect(x - (c_x || _w), y - (c_y || _h), c_x ? 2 * c_x : w, c_y ? 2 * c_y : h);
        }else if($ == 'poly'){
          /* TODO */
        }else{
          /* TODO (render aperture macros) */
        }
        ctx.fill();

        self.$dive('stay');
      }
    },
    fill: { /* filling region */
      $enter: function(){
        var self = this;
        self.ctx.beginPath();
        self.ctx.save();
      },
      $leave: function(){
        var self = this,
        ctx = self.ctx;
        ctx.closePath();
        if(self.hatch){
          //ctx.lineWidth = 1;
          //ctx.stroke();
          ctx.fillStyle = self.hatch;
        }
        ctx.fill();
        ctx.restore();
      },
      region: function(cmd){
        if(!cmd._){
          this.$dive('stay');
        }
      },
      move: function(cmd){
        var self = this,
        coord = self.coord;

        self.to(cmd);
        self.ctx.moveTo(coord.x, coord.y);
      },
      draw: function(cmd){
        var self = this,
        coord = self.coord;

        self.to(cmd);
        self.ctx.lineTo(coord.x, coord.y);
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
    ap: function(id){ /* select aperture */
      var self = this,
      apert = self.opt.apert[id];
      self.apert = {
        $: apert.$,
        w: self.i2p(apert.w),
        h: self.i2p(apert.h),
        d: self.i2p(apert.d)
      };
    },
    it: function(im){ /* set interpolation mode */
      this.inter = im;
    },
    im: function(){
      return this.ctx.canvas.toDataURL('png');
    }
  });

  return {
    render: function(data, ppi, color, hatch){
      var i,
      seq = data.ctl,
      cmd,
      plot = new Plot(data.opt, data.box, ppi, color, hatch);

      for(i in seq){
        cmd = seq[i];
        plot.$fire(cmd.$, [cmd]);
      }
      plot.$fire('end');

      return plot.im();
    }
  };
});
