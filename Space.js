import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
  TextInput,
  PixelRatio
} from 'react-native';

import SpaceStyles from "./SpaceStyle";


export default class Space extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      x:this.props.x || 0,
      y:this.props.y || 0,
      width: 0,
      height: 0,
      pan:new Animated.ValueXY(),
      d:new Animated.ValueXY({x:this.props.x||0, y:this.props.y||0}),
      unitsize : this.props.unitsize || 64,
      memoryComps:[],
      activeComps:[],
      _compId:0,
      zoomFactor:new Animated.Value(0)
    }
    this.handleInit = this.handleInit.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.getBoundary = this.getBoundary.bind(this);
    this.initComponents = this.initComponents.bind(this);
    this.fixComponent = this.fixComponent.bind(this);
  }

  /* EVENT : triggers initial event and initiates a bunch of useful information*/
  handleInit(event) {
    var x = this.props.x || 0;
    var y = this.props.y || 0;

    if (this.props.onInitial) {
      if (typeof this.props.onInitial == 'function') {
        try {
          var l = this.initComponents(this.props.onInitial(this.getBoundary(x,y,x+this.state.width, y+this.state.height)));
        } catch (e) {
          console.log(e);
          var l = []
        }
      }
    } else {
      var l = []
    }
    this.setState({
      x:this.props.x || 0,
      y:this.props.y || 0,
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
      memoryComps : l,
      activeComps:l,
      zoomFactor:new Animated.Value(0)
    })

  }

  /* EVENT : triggers update event */
  async handleMove(e) {
    /*this.setState({x:e.x, y:e.y})*/
    boundarybox = this.getBoundary(e.x, e.y, e.x+this.state.width, e.y+this.state.height);
    /*TODO : ADD ERROR HANDLING */
    if (typeof this.props.onUpdate == 'function') {
      try {
        this.props.onUpdate(boundarybox);
      } catch (e) {
        console.log(e);
      }
    }
  }

  /* INIT : Gets touch events */
  componentWillMount() {
    this.state.d.addListener((value) => this.handleMove(value));
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderMove: (e, gesture) => {
        var x = this.state.x;
        var y = this.state.y;
        var newx = x-gesture.dx;
        var newy = y-gesture.dy;
        var newgx = -newx;
        var newgy = -newy;
        if (newgx<-this.state.unitsize || newgx>=this.state.unitsize) {
          newgx = (Math.floor(newx/this.state.unitsize)-newx/this.state.unitsize)*this.state.unitsize+this.state.unitsize*2;
        }
        if (gesture.dy<-this.state.unitsize || gesture.dy>=this.state.unitsize) {
          newgy = (Math.floor(newy/this.state.unitsize)-newy/this.state.unitsize)*this.state.unitsize+this.state.unitsize*2;
        }
        Animated.event([
          null,
          { dx: this.state.pan.x, dy: this.state.pan.y, wholedx:this.state.d.x, wholedy:this.state.d.y },
        ])(e, {dx:newgx, dy:newgy, wholedx:newx, wholedy:newy});

        /*var x = this.state.x;
        var y = this.state.y;
        this.setState({x:x-gesture.dx, y:y-gesture.dy});*/
      },
      onPanResponderRelease: () => {
        this.setState({x: this.state.d.x.__getValue(), y:this.state.d.y.__getValue() })
      }

    })
  }

  /* STANDARD INFO : boundary box */
  getBoundary(left, top, right, bottom) {
    const bmargin = this.props.boundaryMargin || 0;
    return {
      view : {
        left:left-bmargin,
        top:top-bmargin,
        right:right+bmargin,
        bottom:bottom+bmargin
      }

    }
  }
  /* STANDARD INFO : convert initial components to the right stuff [especially add a unique id] */
  initComponents(clist) {
    var nclist = [];
    var compId = 0;
    for (var i = 0; i < clist.length; i++) {
      var n = clist[i];
      n.id = compId;
      compId+=1;
      nclist.push(n);
      if (!n.x) {
        n.x=0
      }
      if (!n.y) {
        n.y=0
      }
      if (!n.width) {
        n.width=100
      }
      if (!n.height) {
        n.height=100
      }
      if (!n.component) {
        n.component=<ComponentNotFound/>
      }
    }
    return nclist
  }


  fixComponent(c) {
    if (!c.height) {
      c.height = 100
    }
    if (!c.width) {
      c.width = 100
    }
    if (!c.x) {
      c.x = 100
    }
    if (!c.y) {
      c.y = 100
    }
    if (!c.component) {
      c.component = <ComponentTest1/>
    }
  }

  /* ACTION : DISPLAY COMPONENT */

  selectActiveComponents(b) {
      /* SELECTS ACTIVE COMPONENTS FROM MEMORY, USED TO UPDATE*/
  }

  addComponent(c) {
    /* THIS IS TRIGGERED IN THE RENDER METHOD WHEN
       THE addComponent property
       has something in it */
  }

  /* SPECIFIC INFO : gets the grid's line's styles [needs a cleaner aproach?] */
  getLineStyle(i,linesize, rowsize) {

    const pixelvalue = PixelRatio.getPixelSizeForLayoutSize(this.state.unitsize);

    if (linesize===0) {
      if ( (rowsize-this.state.width/2)<0 ) {
        var zoomAdd1 = Animated.multiply(Animated.multiply(this.state.zoomFactor, -this.state.unitsize), -(rowsize-this.state.width/2)/pixelvalue );
      } else if ( (rowsize-this.state.width/2)>=0 ) {
        var zoomAdd1 = Animated.multiply(Animated.multiply(this.state.zoomFactor, this.state.unitsize), (rowsize-this.state.width/2)/pixelvalue );
      }
      var top = rowsize;
      var left = 0;
      var width = "100%";
      var height = 1;
      var translateX = 0;
      var translateY = Animated.add(this.state.pan.y, zoomAdd1);
    } else if (rowsize===0) {
      if ( (linesize-this.state.width/2)<0 ) {
        var zoomAdd = Animated.multiply(Animated.multiply(this.state.zoomFactor, -this.state.unitsize), -(linesize-this.state.width/2)/pixelvalue );
      } else if ( (linesize-this.state.width/2)>=0 ) {
        var zoomAdd = Animated.multiply(Animated.multiply(this.state.zoomFactor, this.state.unitsize), (linesize-this.state.width/2)/pixelvalue );
      }
      var top = 0;
      var left = linesize;
      var height = "100%";
      var width = 1;
      var translateX = Animated.add(this.state.pan.x, zoomAdd);
      var translateY = 0;
    }
    if (this.props.theme) {
      var style=this.props.theme;
    } else {
      var style = SpaceStyles;
    }
    return [
              style._spaceLine || SpaceStyles._spaceLine,
              {
                width:width,
                height:height,
                top: top,
                left:left,
                transform: [
                  {
                    translateX: translateX
                  },
                  {
                    translateY: translateY
                  }
                ]
              }
      ];
  }

  render() {


    /* zoom factor */
    if (this.props.zoomFactor !== this.state.zoomFactor.__getValue()) {
      Animated.timing(
        this.state.zoomFactor,
        {
          toValue: this.props.zoomFactor,
          duration: 400,
        }
      ).start();
    };

    /* Calculate the grid's position */
    const numberoflines = Math.floor(this.state.width/this.state.unitsize)+4;
    var lines = [];
    for (i=0; i<numberoflines; i++ ) {
      var linepos = (i-2)*this.state.unitsize-this.state.unitsize - this.state.unitsize/2;
      lines.push({x: linepos, id:i});
    };
    const numberofrows = Math.floor(this.state.height/this.state.unitsize)+4;
    var rows = [];
    for (i=0; i<numberofrows; i++ ) {
      rows.push({y: (i-2)*this.state.unitsize-this.state.unitsize-this.state.unitsize/2, id:i});
    };

    /* ADD COMPONENTS - newComponents */

    if (this.props.newComponents != null) {
        var comps = this.state.activeComps;
        var uids=[];
        for (var i = 0; i < comps.length; i++) {
          if (comps[i].uid) {
            uids.push(comps[i].uid);
          }
        }
        var newcomps = this.props.newComponents;

        for (var i = 0; i < newcomps.length; i++) {
          if (newcomps[i].uid && uids.indexOf(newcomps[i].uid)<0 ) {
            var newcom = this.fixComponent(newcomps[i]);
            comps.push(newcom);
          } else {
            console.warn("react-native-space : addComponents : either some items are already rendered  or you forgot to assign a 'uid' (unique ID) to one ore more item(s).");
          }
        }
    }


    /* DRAW COMPONENTS */

    if (this.state.activeComps.length>0) {

      const pixelUnitValue = PixelRatio.getPixelSizeForLayoutSize(this.state.unitsize);

      var items = this.state.activeComps.map((item) => {


        var baseTopPosition = Animated.multiply(Animated.add(this.state.d.y, -item.y), -1);
        if (baseTopPosition.__getValue() < (this.state.height/2)) {
            var addition = Animated.multiply(Animated.multiply( -pixelUnitValue , this.state.zoomFactor), Animated.multiply( Animated.divide(Animated.add(baseTopPosition, -this.state.height/2), pixelUnitValue ), -1) );
            /*Animated.multiply(Animated.multiply(this.state.zoomFactor, -this.state.unitsize), -(linesize-this.state.width/2)/pixelvalue );*/
        } else {
            var addition = Animated.multiply(Animated.multiply( pixelUnitValue , this.state.zoomFactor), Animated.divide(Animated.add(baseTopPosition, -this.state.height/2), pixelUnitValue ) );
        }
        var topPosition = Animated.add(Animated.add(baseTopPosition, addition), -item.height/2);



        var baseLeftPosition = Animated.multiply(Animated.add(this.state.d.x, -item.x), -1);

        if (baseLeftPosition.__getValue() <= (this.state.width/2)) {

          var addition2 = Animated.multiply(Animated.multiply( -pixelUnitValue , this.state.zoomFactor), Animated.multiply( Animated.divide(Animated.add(baseLeftPosition, -this.state.width/2), pixelUnitValue ), -1) );

        } else if (baseLeftPosition.__getValue() > (this.state.width/2)){

          var addition2 = Animated.multiply(Animated.multiply( pixelUnitValue , this.state.zoomFactor), Animated.divide(Animated.add(baseLeftPosition, -this.state.width/2), pixelUnitValue ) );
        }

        var leftPosition = Animated.add( Animated.add(baseLeftPosition, addition2 ), -item.width/2);

        return (
          (<Animated.View
              style={{position:"absolute",
                top:topPosition,
                left:leftPosition,
                width:item.width,
                height:item.height,
                transform: [
                  {scaleX: Animated.add(1,this.state.zoomFactor)},
                  {scaleY: Animated.add(1,this.state.zoomFactor)}
                ]
                }}
              >

                {item.component}

            </Animated.View>)
        )
      });
    } else {
      var items = [];
    }

    if (this.props.theme) {
      var style = this.props.theme;
    } else {
      var style = SpaceStyles;
    }
    return (
      <View onLayout={(e) => this.handleInit(e)} style={style._spaceView || SpaceStyles._spaceView} {...this._panResponder.panHandlers} >
        { lines.map(line => <Animated.View style={this.getLineStyle(line.id, line.x, 0)} key={line.id}></Animated.View>)}
        { rows.map(row => <Animated.View style={this.getLineStyle(row.id, 0,row.y)} key={row.id}></Animated.View>)}

        {items}

      </View>
    )
  }
};


export class ComponentTest1 extends React.Component {

  render() {
    return (
      <View style={SpaceStyles.testView}>
        <Text style={SpaceStyles.testText}>This is a test component</Text>
        <TextInput value="Write here" style={SpaceStyles.testInput}></TextInput>
      </View>
    )
  }
};
export class ComponentNotFound extends React.Component {

  render() {
    return (
      <Text style={SpaceStyles.componentError}> Error : component not found</Text>
    )
  }
};
