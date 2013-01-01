define(['peg!./gerber', 'peg!./excellon', './gerber.render', './excellon.render'], function(Gerber, Excellon, GerberRender, ExcellonRender){
  function Board(){
    this.layers = {};
  }
  function Layer(data){
    if(data){
      this.load(data);
    }
  }

  var excellon_cookie_re = /FMAT,/;

  function parseError(e){
    return e.message + (e.line ? ' (' + e.line + ':' + e.column + ')' : '');
  }

  Layer.prototype = {
    load: function(data){
      if(excellon_cookie_re.test(data)){
        try{
          this.data = Excellon.parse(data);
          this.type = 'excellon';
        }catch(e){
          this.error = parseError(e);
          return false;
        }
      }else{
        try{
          this.data = Gerber.parse(data);
          this.type = 'gerber';
        }catch(e){
          this.error = parseError(e);
          return false;
        }
      }
      return true;
    },
    draw: function(ppi, color, hatch){
      ppi = ppi || 600;
      color = color || 'black';
      if(this.type == 'gerber'){
        if(typeof hatch != 'boolean') hatch = true;
        return GerberRender.render(this.data, ppi, color, hatch);
      }else if(this.type == 'excellon'){
        return ExcellonRender.render(this.data, ppi, color);
      }
    }
  };

  Board.prototype = {
    layer: function(name, type, layer){ /* set layer */

    }
  };

  return {
    Board: Board,
    Layer: Layer
  };
});
