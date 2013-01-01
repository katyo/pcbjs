define(['peg!./gerber', './gerber.render'], function(Gerber, GerberRender){
  function Board(){
    this.layers = {};
  }
  function Layer(data){
    if(data){
      this.load(data);
    }
  }

  Layer.prototype = {
    load: function(data){
      try{
        this.data = Gerber.parse(data);
        this.fmt = 'gerber';
      }catch(e){
        this.error = e.message;
        return false;
      }
      return true;
    },
    draw: function(){
      return GerberRender.render(this.data, 600, 'brown', true);
    }
  };

  Board.prototype = {

  };

  return {
    Board: Board,
    Layer: Layer
  };
});
