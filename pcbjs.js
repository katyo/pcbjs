define(['peg!./gerber', 'peg!./excellon', './gerber.render', './excellon.render'], function(Gerber, Excellon, GerberRender, ExcellonRender){
  function Board(layout){
    this.box = {
      x: [null, null],
      y: [null, null]
    };
    this.layout = layout;
    this.layers = {};
  }
  function Layer(data){
    this.enable = true;
    if(data){
      this.load(data);
    }
  }

  var und, M = Math, min = M.min, max = M.max,
  excellon_cookie_re = /FMAT,/;

  function parseError(e){
    return e.message + (e.line ? ' (' + e.line + ':' + e.column + ')' : '');
  }

  Layer.prototype = {
    load: function(data){
      var self = this;
      if(excellon_cookie_re.test(data)){
        try{
          self.data = Excellon.parse(data);
          self.type = 'excellon';
        }catch(e){
          self.error = parseError(e);
          return false;
        }
      }else{
        try{
          self.data = Gerber.parse(data);
          self.type = 'gerber';
        }catch(e){
          self.error = parseError(e);
          return false;
        }
      }
      self.box = self.data.box;
      if(self.board){ /* recalc bound */
        self.board.bound();
      }
      return true;
    },
    draw: function(ppi, color, hatch){
      var self = this,
      layout = self.board && self.board.layout && self.board.layout[self.name] || {},
      opts = {
        box: self.board ? self.board.box : self.box,
        ppi: ppi || 600,
        color: color || layout.color || 'black',
        hatch: hatch !== undefined ? hatch : layout.hatch
      };
      if(self.type == 'gerber'){
        if(typeof hatch != 'boolean') hatch = true;
        return GerberRender.render(self.data, opts);
      }else if(self.type == 'excellon'){
        return ExcellonRender.render(self.data, opts);
      }
    }
  };

  Board.prototype = {
    bound: function(){ /* recalc bound */
      var name,
      lay,
      box = this.box,
      layers = this.layers,
      once = false;

      for(name in layers){
        lay = layers[name].box;
        if(once){
          box.x[0] = min(box.x[0], lay.x[0]);
          box.x[1] = max(box.x[1], lay.x[1]);
          box.y[0] = min(box.y[0], lay.y[0]);
          box.y[1] = max(box.y[1], lay.y[1]);
        }else{
          once = true;
          box.x[0] = lay.x[0];
          box.x[1] = lay.x[1];
          box.y[0] = lay.y[0];
          box.y[1] = lay.y[1];
        }
      }
    },
    layer: function(name, layer){ /* attach/detach/access layer */
      var self = this,
      layers = self.layers;
      if(layer === und){
        return layers[name];
      }else{
        if(layer === null){
          layer = layers[name];
          if(layer){
            delete layer.board;
            delete layer.name;
            delete layers[name];
          }
        }else{
          layer.board = self;
          layer.name = name;
          layers[name] = layer;
        }
        self.bound();
      }
    }
  };

  return {
    Board: Board,
    Layer: Layer
  };
});
