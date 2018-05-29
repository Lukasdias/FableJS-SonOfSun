var app = angular.module("FablePlayer",['simple-sprite']);

/*
* ------------------ STORAGE ELEMENTS -----------------------------
*
*/
var Elements = (function(){
  /**
  * Arrays que guardam os objetos do Fables
  */
  var Book;
  var animations = new Array();
  var agents = new Array();
  var sounds = new Array();
  var properties = new Array();
  var draggable = new Array();
  var detectable = new Array();
  var alerts = new Array();

  //guarda um objeto Animation
  var getAnimation = function(animation){
    animations.push(animation);    
  }

  //Verifica quando as animações devem ser iniciadas
  var checkAnimation = function(number){
    for(var i = 0; i < animations.length; i++)
      if(animations[i].pageId == number){
        animations[i].start();
      }
  }

  //guarda um objeto Agent
  var addAgent = function(agent){
    agents.push(agent);
  }

  //retorna o agente indicado pelo id
  var getAgent = function(id){
    
    for(var i = 0; i < agents.length; i++){
      if(agents[i].id == id)
        return agents[i];
    }
  }

  var checkAgent = function(id){
   for(var i = 0; i < agents.length; i++){
      if(agents[i].id == id)
        return true;
    }
    return false; 
  }

  //guarda um objeto som
  var addSound = function(sound){
    sounds.push(sound);
  }

  //retorna um objeto som
  var getSound = function(id){
    for(var i = 0; i < sounds.length; i++){
      if(sounds[i].id == id){
        return sounds[i];
      }
    }
  }

  //guarda um objeto property
  var addProperty = function(property){
    properties.push(property);
  }

  //retorna um objeto property
  var getProperty = function(id){
    for(var i = 0; i < properties.length; i++){
      if(properties[i].id == id)
        return properties[i];
    }
  }

  //guarda um objeto drag
  var addDrag = function(drag){
    draggable.push(drag);
  }

  
  //retorna drag
  var getDrag = function(id){
    for(var i = 0; i < draggable.length; i++){
      if(draggable[i].id == id)
        return draggable[i];
    }
  }

  //guarda um objeto detect
  var addDetectable = function(dectect){
    detectable.push(dectect);
  }

  //retorn detect
  var getDetectable = function(id){
    for(var i = 0; i < detectable.length; i++){
      if(detectable[i].id == id)
        return detectable[i];
    }
  }

  var addAlert = function(alert){
    alerts.push(alert);
  }

  var getAlert = function(agentNameState){
   
   for(var i = 0; i < alerts.length; i++){
      if(alerts[i].agentNameState == agentNameState){
        console.log("achei algo");
        return alerts[i];
      }
    } 
  }

  //Procura a tag na qual desejo manipular
  var searchElement = function(elem, type){
    var parent = elem.parent();
      
    while((parent[0].localName != type)){
      parent = parent.parent();
      if(parent == undefined){
        break;
      }
    }
    return parent;
  }

  var setBook = function(book2){
    Book = book2;
  }

  var getBook = function(){
    return Book;
  }

  return{
    getAnimation: getAnimation,
    checkAnimation: checkAnimation,
    addAgent: addAgent,
    getAgent: getAgent,
    checkAgent: checkAgent,
    addSound: addSound,
    getSound: getSound,
    addProperty: addProperty,
    getProperty: getProperty,
    searchElement: searchElement,
    addDrag: addDrag,
    getDrag: getDrag,
    addDetectable: addDetectable,
    getDetectable: getDetectable,
    setBook: setBook,
    getBook: getBook,
    addAlert: addAlert,
    getAlert: getAlert
  }
}());

var UtilsFunction = (function(){

  var getAgentAndChangeState = function(agentName,stateName){
    var agent = Elements.getAgent(agentName);
    agent.changeState(stateName);
  }

  var getTagParent = function(elem, parentName){
    var parent = elem.parent();
    try{
      if(parent[0].localName != parentName){
        while((parent[0].localName != parentName)){
         parent = parent.parent();
        }
      }
    }catch(error){
      console.log("estourou o limite");
    } 
    return parent;
  }

  return{
    getAgentAndChangeState: getAgentAndChangeState,
    getTagParent: getTagParent 
  }

}());

/*
*  ------------- CLASS BOOK -------------------------------
*/
app.factory('Book',function(){
  return function(){
    this.pages = new Array();
    this.currentPage = 1;
    this.sound;
    this.number = 1;

    console.log("Book iniciou");

    this.addPage = function(page){
      this.pages.push(page);
    }

    this.controlSound = function(){
      console.log('som'+this.number);
      try {
        if(this.sound !== undefined)
          this.sound.stopSound();
        this.sound = Elements.getSound("bgSound"+this.number);
        this.sound.start();
      } catch(e) {
        // statements
        console.log(e);
      }
    }

    this.changePage = function(number){
      this.number = number;
      this.controlSound();
      if(number <= this.pages.length){
        this.currentPage = number;
        this.checkPage();
      }else{
        alert("ultima pagina");
      }
    }

    this.checkPage = function(){
      for(var i = 0; i < this.pages.length; i++){
            if(this.currentPage == this.pages[i].id){
                this.pages[i].page.style.display = "block";
            }else{
                this.pages[i].page.style.display = "none";
            }
      }
      Elements.checkAnimation(this.currentPage);
    }

    this.nextPage = function(){
      this.changePage(this.currentPage+1);
    }

    this.previousPage = function(){
      this.changePage(this.currentPage-1);
    }
  }
});

/*
* ------------- DIRETIVA FABLE -------------------------------
*/
app.directive('fable', function(Book,AudioFactory) {
  return {
      restrict: 'E',
      transclude: true,
      scope: {
        width: '@width',
        height: '@height'
      },
      link:function(scope,elem,attr){
        //iniciando o fábulas
        var book = new Book();
        
        var list = elem.find("page");
        //pega todos os elementos page e salva em um array
        for(var i = 0; i < list.length; i++){
          book.addPage({id: list[i].id, page: list[i]});
        }
        book.changePage(1);

        /*Criando audio background para todas as páginas*/
        if(attr.bgSound != undefined){
         try {
           // statements
           var bgSound = new AudioFactory("bgSound"+attr.id,attr.bgSound, elem);
           Elements.addSound(bgSound);

         } catch(e) {
           // statements
           console.log(e);
         }
        }

        Elements.setBook(book);//salvando livro
      },
      template: '<div class="container">'+'<div class="box" style="width:{{width}}; height:{{height}}" ng-transclude>'+'</div>'

  };
});


/*
* ------------- DIRETIVA PAGE -------------------------------
*/
app.directive('page', function(AudioFactory){
  return{
    restrict: 'E',
    link: function(scope, elem, attr, ctrl){

      elem[0].style.position = "relative";
      //pegar a tag fable
      var fable_elem = Elements.searchElement(elem, "fable");
      var fable_atts = fable_elem[0].attributes;//atributos fables
      var fable_width;//largura fable
      var fable_height;//altura fable

      /*garante que o width e height do fable sempre sejam definidos certos*/
      for(var i = 0; i < fable_atts.length; i++){
        if(fable_atts[i].nodeName == "width")
          fable_width = fable_atts[i].value;
        if(fable_atts[i].nodeName == "height")
          fable_height = fable_atts[i].value;
      }
      elem[0].style.width = fable_width + "px";
      elem[0].style.height = fable_height + "px";

      /*criando background*/
      if(attr.bgImage != undefined){
        var img = document.createElement("img");
        img.src = attr.bgImage;
        img.width = parseInt(fable_width);
        img.height = parseInt(fable_height);
        img.style.left = 0;
        img.style.top = 0;
        img.style.position = "absolute";
        img.style.zIndex = -1;
        elem.append(img);
      }else{
        elem[0].style.backgroundColor = "white";
      }

      /*criando audio-background*/
      if(attr.bgSound != undefined){
        var bgSound = new AudioFactory("bgSound"+attr.id,attr.bgSound, elem);
        Elements.addSound(bgSound);
      }
}
  };
});

/* ------------- CLASS ACTION -------------------------------
* - Executa as ações do livro como mudar de página
* - Alterar estado de um elemento
* - atualizar um agente
*/

app.factory('ActionFactory', function() {
    return function(elem) {
        //Contructor
        this.action = "";
        this.agent = "";
        this.stat = "";
        this.elem = elem;
        //

        this.setAgent = function(agentName){
          this.agent = agentName;
        }

        this.setState = function(stateName){
          this.state = stateName;
        }

        this.changeState = function(agentName, stateName){
          console.log("changeState");
          var elements = Elements;
          //se for um state busca o agente 
          //que ele pertence e muda o estado
          var agent = elements.getAgent(this.agent);
          agent.changeState(this.state); 
        }

        this.pageStart = function(Book){
            Book.changePage(parseInt(this.state));
        }
    };
});

/*
* ------------- DIRETIVA AGENT -------------------------------
*/
app.directive('agent', function(AgentFactory){
  return{
    restrict: 'E',
    link: function(scope, elem, attr, ctrl){
      //capturar state
      var states = elem.find("state");

      var agent = new AgentFactory(states, elem, attr.id);
      for(var i=0;i<states.length;i++){
        if(i!=0)
          states[i].remove();
        
        var stateParentName = states[i].id;
        //preparando triggers
        var triggers = angular.element(states[i]).find('trigger');
        console.log(triggers);
        if(triggers != []){
          for(var k=0; k < triggers.length; k++){
            var trigger = angular.element(triggers[k]);
            console.log(triggers[k].attributes[1].nodeValue);
            var agentName = triggers[k].attributes[0].nodeValue;
            var stateName = triggers[k].attributes[1].nodeValue;
            agent.makeTrigger(stateParentName,agentName,stateName);
          }
        }  

      }

      Elements.addAgent(agent);
      // salvar agents em elements e identifica-los pelo id
    }
  }
});

app.factory('AgentFactory',function(){
  return function(states, elem, id){
    //
    this.elem = elem;
    this.array = states;
    this.id = id; 
    this.triggers = [];
    this.currentState = states[0];
    //
    this.changeState = function(id){
      
      currentState = id;   
      for(var i=0; i < this.array.length; i++){
        if(this.array[i].id == id){
          this.elem.after(this.array[i]);//coloca no html o trecho
        }
        else
          this.array[i].remove();//retira os estados não usados      
      }

      for(var i=0; i < this.triggers.length; i++){
        if(id == this.triggers[i].state){
          console.log(this.triggers);
          var agent = this.triggers[i].agentName;
          var state = this.triggers[i].stateName;
          UtilsFunction.getAgentAndChangeState(agent, state);
        }
      }
    }

    this.makeTrigger = function(stateFatherName, agentName,stateName){
     var trigger = {
      state: stateFatherName,
      agentName: agentName,
      stateName: stateName
     }

     this.triggers.push(trigger);
    }
  }
});

/*
* ------------- DIRETIVA ANIMATION -------------------------------
*/
app.factory('AnimationFactory',function(){
  return function(frames, frameCount, speed, pageId, left, top, repeat){
    //
    this.frames = frames;
    this.frameCount = frameCount;
    this.speed = speed;
    this.pageId = pageId;
    this.left = left;
    this.top = top;
    this.repeat = repeat;
    for(var i = 0; i < frames.length; i++)
      this.frames[i % this.frameCount].style.display = "none";
    //

    this.start = function(){
      var i = 0;
      var that = this;
      if (that.speed === 0|| that.speed === null || that.speed === undefined)
              that.speed = 100;

      var interval = setInterval(function () {        
                that.frames[i % that.frameCount].style.display = "none"; 
                that.frames[++i % that.frameCount].style.display = "block";
                that.frames[i % that.frameCount].style.left = that.left+'px';
                that.frames[i % that.frameCount].style.top = that.top+'px';
                that.frames[i % that.frameCount].style.position = 'absolute';

                if(i==(that.frames.length-1) && that.repeat == "no")
                  clearInterval(interval);

            }, that.speed);
    }

    this.setSpeed = function(speed){
      this.speed = speed;
    }
  }
});

app.directive('animation', function(AnimationFactory) {
  return {
       restrict: 'E',
       link:function(scope,elem,attr,ctrl){  
          var frames = elem.children();

          if(attr.width != "" && attr.height != ""){
            for(var i = 0; i < frames.length; i++){
              frames[i].style.width = attr.width+"px";
              frames[i].style.height = attr.height+"px";
              frames[i].style.left = attr.x+"px";
              frames[i].style.top = attr.y+"px";
            }
          }
          var parent = elem.parent();
          while(parent[0].localName != "page"){
            parent = parent.parent();
          }
          var pageId = parent[0].id;
          var anim = new AnimationFactory(frames, frames.length, attr.teste, pageId, attr.left, attr.top, attr.repeat);
          anim.setSpeed(attr.speed);
          Elements.getAnimation(anim);
       }
  };
});


/* ------------- DIRETIVA ONTOUCH -------------------------------
* Contém diretivas: test, target(para troca de página), alert
*                   set, play, audio
*/
app.directive('onTouch', function($animate,$timeout,ActionFactory) {
  return {
       restrict: 'E',
       link:function(scope, elem, attr){
          //
          var agentNameID;
          var alert = false;
          var target = false;
          var changeTo = false;
          var agentTag;
          var stateTag;
          var action;
          var nextState;
          var emit;
          var emitEvent;
          var emitPageValue;
          var stateOnTouch;
          //identificar o tipo do elemento
          var childs = elem.children();
          var functionsTriggeredOnTouch = new Array();
        
          //pegando ontouch do agent
          var stateOnTouch = UtilsFunction.getTagParent(elem,"state");

          //check if existis alert,target exists
          var checkChildsState = function(){
            var getAttribute = function(attributes,attributeName){
              for(var i = 0; i < attributes.length; i++){
                if(attributes[i].name == attributeName)
                  return attributes[i].value;
              }
            }

            for(var i = 0; i < childs.length; i++){
              if(childs[i].localName == "alert")
                alert = true;
              if(childs[i].localName == "target")
                target = true;
              if(childs[i].localName == "change-state"){
                changeTo = true;
                agentTag = UtilsFunction.getTagParent(elem,"agent");
                nextState = getAttribute(childs[i].attributes, "target");
              }
              if(childs[i].localName == "emit"){
                emit = true; 
                emitEvent =  getAttribute(childs[i].attributes, "event");
                emitPageValue =  getAttribute(childs[i].attributes, "number"); 
              }
            }
          }
          checkChildsState();

          

          var changeStateFunction = function(){
            if(changeTo){ 
              UtilsFunction.getAgentAndChangeState(agentTag[0].id,nextState);
            }
          }

          var alertFunction = function(){
            for (var i=0; i < childs.length; i++){
              if(childs[i].localName == "alert"){
                var alert = Elements.getAlert(childs[i].id);
                alert.actionAlert();
              }
            }
          }

          var emitFunction = function(){
            var nextPage = {id:'next_page',
            start: function(){
                var book = Elements.getBook();
                book.nextPage();
              }
            }

            var previousPage = { id: 'previous_page',
              start: function(){
                var book = Elements.getBook();
                book.previousPage();
              }
            }

            var gotoPage = { id: 'goto_page',
              start: function(){
                var book = Elements.getBook();
                book.changePage(emitPageValue);
              }
            }

            var basicFunctions = [nextPage,previousPage,gotoPage];

            console.log("nome do evento: " + emitEvent);  
            for(var i = 0; i < basicFunctions.length; i++){
              if(basicFunctions[i].id == emitEvent)
                basicFunctions[i].start();
            }
          }

          var organizeFunctions = function(){
            if(alert)
              functionsTriggeredOnTouch.push(alertFunction); 
            if(changeTo)
              functionsTriggeredOnTouch.push(changeStateFunction);  
            if(emit)
              functionsTriggeredOnTouch.push(emitFunction);           
          }
          organizeFunctions();
          
          stateOnTouch.on('click',function($event){
            for(var i = 0; i < functionsTriggeredOnTouch.length; i++){
              functionsTriggeredOnTouch[i]();
            }
          });
          
       }
  };
});

/*
* ------------- DIRETIVA AUDIO -------------------------------
*/
app.directive('audio', function(AudioFactory){
  return{
    restrict: 'E',
    link: function(scope, elem, attr, ctrl){
      var sound = undefined;
      //se elemento não existe cria um novo
      sound = Elements.getSound(attr.id);
      if(sound == undefined)
        sound = new AudioFactory(elem[0].id, attr.src, elem);

      var onTouch = Elements.searchElement(elem,"on-touch");
      onTouch.bind('click',function(){
        if(attr.role == "play")
          sound.start();
      });
    }
  }
});

/*
* ------------- CLASS AUDIO -------------------------------
*/
app.factory('AudioFactory', function(){
  return function(id, source, elem){
    this.id = id;
    this.source = source;
    this.elem = elem;
    this.audio = new Audio(source);

    this.start = function(){
      this.audio.load();
      var playPromise = this.audio.play();

        if (playPromise !== undefined) {
          playPromise.then(_ => {
            // Automatic playback started!
            this.audio.play();
            // Show playing UI.
          })
          .catch(error => {
            // Auto-play was prevented
            // Show paused UI.
            this.audio.play();
          });
        }
    }

    this.stopSound = function(){
      console.log('pausar audio');
      this.audio.pause();
    }

    this.advanceSound = function(){
      if(this.audio.ended)
        this.audio.currentTime = 0;
      this.audio.currentTime++;
    }

    this.backSound = function(){
      if(this.audio.ended)
        this.audio.currentTime = 0;
      this.audio.currentTime--;
    }

  }
})

/*
* ------------- DIRETIVA PLAY -------------------------------
* - tocar áudios dentro do onTouch
*/
app.directive('play',function(){
  return{
    restrict: 'E',
    link: function(scope, elem, attr, ctrl){
      //criar elemento audio
      if(attr.type == "audio"){
        var media = new Audio(attr.src);
        media.volume = 0.2;
      }
      
      var onTouch = Elements.searchElement(elem,"on-touch");
      onTouch.bind('click',function(){
        media.play();
      });
    }
  }
})


/*
* ------------- DIRETIVA TEST -------------------------------
*/
app.directive('test',function($animate,TestFactory,AlertFactory){
  return{
    restrict: 'E',
    link: function(scope, elem, attr){

      //pega o on-touch
      var onClick = Elements.searchElement(elem,"on-touch");
      var agent = Elements.searchElement(elem,"agent");

      //gera mensagem
      var alert = new AlertFactory("text",elem);
      alert.createAlert($animate);
      //
      var test = new TestFactory(elem);  
      onClick.bind('click',function(){
        //pegar a property
        var property = Elements.getProperty(attr.target);
        //pegar value
        var value = attr.value;
        //pegar parametros do execute
        var execute = elem[0].children; 
        var action = execute[0].attributes[0].nodeValue;
        var target = execute[0].attributes[1].nodeValue;
        
        //comparar 
        if(property.getValue() == value){
          
          //finalizar página 
          if(action == "endPage"){
            console.log("Test encerra pagina");
            //
            ModuleFable.getBook().nextPage();
          }
          if(action == "changeState"){
            console.log("Test muda estado");
            //
            UtilsFunction.getAgentAndChangeState(agent[0].id, target);
          }
          if(action == "changePage"){
            //
            res = shout_target.split('#');
            var parameterOne = res[0];//page
            var parameterTwo = res[1];//number
            ModuleFable.getBook().changePage(parseInt(parameterTwo));
          }
        }//encerra o onClick
      })

    }
  }
})

/*
* ------------- CLASS TEST -------------------------------
*/
app.factory('TestFactory',function(){
  return function(element){
    this.element = element;

    this.compareValues = function(property, value){
      return (property.getValue() == value);
    }

  }
})

/*
* ------------- DIRETIVA SET -------------------------------
*/
app.directive('set',function(){
  return{
    restrict: 'E',
    link: function(scope, elem, attr, ctrl){
      var onClick = Elements.searchElement(elem, "state");
      var new_value = attr.value;
      
      
      onClick.bind('click', function(){
        //pega a property
        var property = Elements.getProperty(attr.target);
        console.log(property);
      
        console.log("troquei");
        property.setValue(new_value);
      })
    }
  }
})

/*
* ------------- DIRETIVA BOARD -------------------------------
*/
app.directive('board',function(){
  return{
    restrict: 'E',
    link: function(scope, elem, attr, ctrl){
      //estilização da board
      if(attr.fontSize == undefined)
        attr.fontSize = "25px";

      elem.css({
        position: 'absolute',
        color: 'black',
        'background-color': 'white', 
        'border-radius': '10px',
        'font-size': attr.fontSize,
        padding: '5px',
        'text-align': 'justify',
      })
    }
  }
})

/*
* ------------- DIRETIVAS X, Y, WIDTH, HEIGHT -------------------------------
*/
app.directive('left',function(){
  return{
    restrict: 'A',
    link: function(scope, elem, attr, ctrl){
      elem.css({
        position: 'absolute', 
        left: attr.left+'px'
      })
    }
  }
})

app.directive('top',function(){
  return{
    restrict: 'A',
    link: function(scope, elem, attr, ctrl){
      elem.css({
        position: 'absolute', 
        top: attr.top+'px'
      })
    }
  }
})

app.directive('width',function(){
  return{
    restrict: 'A',
    link: function(scope, elem, attr, ctrl){
      elem.css({
        width: attr.width+'px'
      })
    }
  }
})

app.directive('height',function(){
  return{
    restrict: 'A',
    link: function(scope, elem, attr, ctrl){
      elem.css({
        height: attr.height+'px'
      })
    }
  }
})

app.directive('fontSize',function(){
  return{
    restrict: 'A',
    link: function(scope, elem, attr, ctrl){
      elem.css({ 
        fontSize: attr.fontSize+'px'
      })
    }
  }
})

app.directive('fontColor',function(){
  return{
    restrict: 'A',
    link: function(scope, elem, attr, ctrl){
      elem.css({ 
        color: attr.fontColor
      })
    }
  }
})



/*
* ------------- CLASS PROPERTY -------------------------------
*/
app.factory('PropertyFactory', function(){  
  
  return function(id, value) {
        this.id = id;
        this.value = value;

        this.setValue = function(value){
          console.log("entramos aqui");
          this.value = value;
        };

        this.getValue = function(){
          return this.value;
        };

  };
  
});

app.directive('property',function(PropertyFactory){
  return{
    restrict: 'E',
    link: function(scope, elem, attr, ctrl){
      var prop = new PropertyFactory(attr.name, attr.value);
      console.log(prop);
      Elements.addProperty(prop);
    }
  }
});

/*
* ------------- DIRETIVA SET -------------------------------
* - muda um valor de uma propriedade
*/
app.directive('set',function(){
  return{
    
    restrict: 'E',
    link: function(scope, elem, attr, ctrl){
      
      var element = Elements.searchElement(elem,"on-touch");
      //e uso ele para ativar ações da tag set
      element.bind('click',function(){
        //pega o property
        var prop = Elements.getProperty(attr.target);
        console.log(prop);
        prop.setValue(attr.value);
      })
    }
  }
});


/*
* ------------- CLASS ALERT -------------------------------
* - chamado dentro de um ontouch ele lança um aviso na tela
*/
app.factory('AlertFactory',function(){
  return function(text, elem, agentNameState){
    //
    this.text = text;
    this.element = elem;
    this.agentNameState = agentNameState;
    this.flag = true;
    elem[0].style.display = "none";
    //
    this.createAlert = function($animate){
      //estilizando
      $animate.addClass(this.element,'animate fadeIn');
      this.element.css({
        display: 'none',
        position: 'absolute',
        background: '#bdbdbd', 
        'font-size': '30px',
        padding: '5px',
        'text-align': 'justify',
        left: '50px',
        top: '10px',
        width:'300px',
        'border-radius': '10px',
        'border': '2px solid #455a64',
        'z-index': '1'
      })
    }

    this.actionAlert = function(){
      console.log("entrei no actionAlert");
      if(this.flag){
        this.element[0].style.display = "block";
        this.flag = false;
        console.log("mostrar")
      }else{
        this.element[0].style.display = "none";
        this.flag = true;
        console.log("nao mostrar")
      }
      return flag; 
    }

  }
});

/*
* ------------- DIRETIVA ALERT -------------------------------
*/
app.directive('alert',function($animate,AlertFactory){
  return{
    restrict: 'E',
    link: function(scope, elem, attr, ctrl){
        var text = elem[0].childNodes[0].data;
        
        var ontouch = elem.parent();
        var state = ontouch.parent()[0].id;
        var agent = ontouch.parent().parent()[0].id;
        var agentNameState = agent + state ;

        var alert = new AlertFactory(text,elem,agentNameState);
        elem[0].id = agentNameState;
        alert.createAlert($animate);
        
        Elements.addAlert(alert);
    }
  }
})

/*
* ------------- CLASS DRAG -------------------------------
*/
app.factory('DragFactory',function(){
  return function(id, elem){
    this.id = id;
    this.elem = elem;
    this.top = 0;
    this.left = 0;

    this.attPosition = function(x, y){
      this.top = y;
      this.left = x;
      console.log("id "+this.id);
      console.log("x:"+this.left+" y:"+this.top);
    }

    this.getPosition = function(){
      return{
        x: this.left,
        y: this.top
      }
    }
  }
});

/*
* ------------- DIRETIVA DRAGGABLE -------------------------------
*/
app.directive('draggable', function($document, DragFactory) {
  return {
    restrict: 'AE',
    link: function(scope, element, attr) {
      var startX = 0, startY = 0, x = attr.left, y = attr.top;
      var drag = new DragFactory(element[0].id, element);
      Elements.addDrag(drag);

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content

        event.preventDefault();
        startX = event.pageX - x;
        startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        //
        dect = Elements.getDetectable(element[0].id);
      });

      function mousemove(event) {
        console.log("x: "+event.pageX+" y: "+event.pageY);
        console.log("ox: "+event.offsetX+" oy: "+event.offsetY);

        y = event.pageY - startY;
        x = event.pageX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px'
        });
        //
        drag.attPosition(x, y);
        if(dect != undefined){
          dect.checkArea();
          dect.startEvent();
        }
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    }
  };
});

/*
* ------------- DIRETIVA DETECT -------------------------------
*/
app.directive('detect',function(DetectFactory){
  return{
    restrict: 'AE',
    link: function(scope, elem, attr){
      console.log('DETECTSSS');
      //
      var img = angular.element(elem.parent()).find('img');
      var attributes = img[0].attributes;
      console.log(attributes);
      var dimensions = {};

      for(var i=0; i < attributes.length;i++){
        if(attributes[i].name == "top")
           dimensions.top = attributes[i].value;
        if(attributes[i].localName == "left")
          dimensions.left = attributes[i].value;
        if(attributes[i].localName == "width")
          dimensions.width = attributes[i].value;
        if(attributes[i].localName == "height")
          dimensions.height = attributes[i].value;
      }

      console.log(dimensions);
      //
      var dect = new DetectFactory(attr.target, dimensions);
      dect.setEvent("changeState", attr.changeState);

      dect.setAgent(attr.agent);  

      Elements.addDetectable(dect);
    }
  }
})

/* ------------- DIRETIVA DETECT -------------------------------
* - Responsável por detectar elementos arrastáveis
* - Gera uma ação quando o elemento está sobre a área informada
*/

app.factory('DetectFactory',function(){
  return function(id, dimensions){
    this.id = id;
    this.value = false;
    this.x = dimensions.left;
    this.y = dimensions.top;
    this.width = dimensions.width;
    this.height = dimensions.height;
    this.action = "";
    this.event = "";
    this.agent = "";

    this.setEvent = function(event, action){
      this.action = action;
      this.event = event;
    }

    this.setAgent = function(agent){
      this.agent = agent;
    }

    this.startEvent = function(event,action,param1){
      if(this.value){
        // if(this.event == "changePage")
        //   ModuleFable.getBook().changePage(parseInt(this.action));
        if(this.event == "changeState")
          var agent = Elements.getAgent(this.agent);
          agent.changeState(this.action);
      }
    }

    this.getValue = function(){
      console.log("dect: "+ this.value);
      return this.value;
    }

    this.checkArea = function (){
      var drag = Elements.getDrag(this.id);
      var position = drag.getPosition();
      var x = this.x < position.x && position.x <(this.x + this.width);
      var y = this.y < position.y && position.y <(this.y + this.height);
      if(x && y){
        this.value = true;
      }
    }

  }
})

/* ------------- CLASS TRANSITION -------------------------------
* - Responsável por efeitos de transições
* - em elementos, imagens
*/
app.factory('TransitionFactory',function(){
  return function(elem,animateCss){
    this.elem = elem;
    this.animateCss = animateCss;
    this.css = null;

    this.setStyle = function(type){
      this.css = this.animateCss(this.elem,{
        addClass: type
      })
    }

    this.startAnimation = function(){
      this.css.start();
    }

  }
})

/* 
* ------------- DIRETIVA TRANSITION -------------------------------
*/
app.directive('transition',function($animateCss, TransitionFactory){
  return{
    restrict: 'A',
    link: function(scope, elem, attr, ctrl){
      var transition = new TransitionFactory(elem, $animateCss);
      transition.setStyle(attr.transition);

      transition.startAnimation();
    }
  }
})