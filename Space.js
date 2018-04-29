import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
  TextInput
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
      _compId:0
    }
    this.handleInit = this.handleInit.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.getBoundary = this.getBoundary.bind(this);
    this.initComponents = this.initComponents.bind(this);
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
      activeComps:l
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
  getLineStyle(linesize, rowsize) {
    if (linesize===0) {
      var top = rowsize;
      var left = 0;
      var width = "100%";
      var height = 1;
      var translateX = 0;
      var translateY = this.state.pan.y;
    } else if (rowsize===0) {
      var top = 0;
      var left = linesize;
      var height = "100%";
      var width = 1;
      var translateX = this.state.pan.x;
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

    /* Calculate the grid's position */
    const numberoflines = Math.floor(this.state.width/this.state.unitsize)+4;
    var lines = [];
    for (i=0; i<numberoflines; i++ ) {
      lines.push({x: (i-2)*this.state.unitsize-this.state.unitsize-this.state.unitsize/2, id:i});
    };
    const numberofrows = Math.floor(this.state.height/this.state.unitsize)+4;
    var rows = [];
    for (i=0; i<numberofrows; i++ ) {
      rows.push({y: (i-2)*this.state.unitsize-this.state.unitsize/2, id:i});
    };


    if (this.props.addComponent && typeof this.props.addComponent == 'function') {
      try {
        var comps = this.state.activeComps;
        var newcomps = this.props.addComponent();
        if (newcomps!==null) {
          for (var i = 0; i < newcomps.length; i++) {
            comps.push(newcomps[i]);
          }
        }
        /*TODO : there will probably be duplicates, find a way to prevent this
                + find a way to add ids to these new components */
        this.setState({activeComps: comps})
      } catch (e) {

      }
    }

    if (this.state.activeComps.length>0) {
      var items = this.state.activeComps.map(item =>
        (<Animated.View style={{position:"absolute", top:Animated.multiply(Animated.add(this.state.d.y, -item.y), -1), left:Animated.multiply(Animated.add(this.state.d.x, -item.x), -1), width:item.width, height:item.height}}>{item.component}</Animated.View>)
      );
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
        { lines.map(line => <Animated.View style={this.getLineStyle(line.x, 0)} key={line.id}></Animated.View>)}
        { rows.map(row => <Animated.View style={this.getLineStyle(0,row.y)} key={row.id}></Animated.View>)}

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
