define(['peg!./gerber', 'peg!./excellon', './gerber.render', './excellon.render', './pcbjs.layout'], function(Gerber, Excellon, GerberRender, ExcellonRender, layout){
  function Board(){
    this.box = {
      x: [null, null],
      y: [null, null]
    };
    this.layers = [];
  }
  function Layer(data){
    var self = this;
    self.show = true;
    self.type = null;
    self.data = null;
    if(data){
      self.load(data);
    }
  }

  var und, M = Math, min = M.min, max = M.max,
  excellon_cookie_re = /FMAT,/;

  function parseError(e){
    return e.message + (e.line ? ' (' + e.line + ':' + e.column + ')' : '');
  }

  function detect(name){
    var type, spec;

    for(type in layout){
      spec = layout[type];
      if(spec.files.test(name)){
        return type;
      }
    }

    return null;
  }

  Layer.prototype = {
    load: function(data){
      var self = this;
      self.text = data;
      if(data){
        if(excellon_cookie_re.test(data)){
          try{
            self.data = Excellon.parse(data);
          self.form = 'excellon';
          }catch(e){
            self.error = parseError(e);
            return false;
          }
        }else{
          try{
            self.data = Gerber.parse(data);
            self.form = 'gerber';
          }catch(e){
            self.error = parseError(e);
            return false;
          }
        }
        self.box = self.data.box;
      }
      return true;
    },
    draw: function(ppi, box, color, hatch){
      var self = this,
      spec = self.type && layout[self.type] || {},
      opts = {
        ppi: ppi || 600,
        box: box || self.box,
        color: color || spec.color || 'black',
        hatch: hatch !== und ? hatch : spec.hatch
      };
      if(self.form == 'gerber'){
        if(typeof hatch != 'boolean') hatch = true;
        return GerberRender.render(self.data, opts);
      }else if(self.form == 'excellon'){
        return ExcellonRender.render(self.data, opts);
      }
      return null;
    }
  };

  Board.prototype = {
    bound: function(){ /* recalc bound */
      var name,
      lay,
      box = this.box,
      i = 0,
      layers = this.layers,
      once = false;

      for(; i < layers.length; ){
        lay = layers[i++].box;
        if(lay){
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
      }
    },
    layer: function(name, data){
      var self = this,
      layer = new Layer(data);

      layer.type = detect(name);

      if(!layer.error){
        self.add(layer);
        return layer;
      }
      return false;
    },
    add: function(layer){
      var self = this,
      layers = self.layers;
      layers.push(layer);
      self.bound();
    },
    del: function(layer){
      var self = this,
      i = 0,
      layers = self.layers;
      for(; i < layers.length; i++){
        if(layers[i] === layer || layers[i].type === layer){
          layers.splice(i--, 1);
        }
      }
      self.bound();
    },
    render: function(ppi){
      var self = this,
      i = 0,
      layers = self.layers,
      image,
      images = {},
      type, spec, layer;
      for(; i < layers.length; i++){
        layer = layers[i];
        if(layer.type && layer.show){
          spec = layout[layer.type];
          if(layer.type){
            image = layer.draw(ppi, self.box, spec.color, spec.hatch);
            if(image){
              images[spec.index] = image;
            }
          }
        }
      }
      return images;
    }
  };

  return {
    Board: Board,
    Layer: Layer,
    layout: layout,
    detect: detect
  };
});
