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
      rows: [],
      lines: [],
      pan:new Animated.ValueXY(),
      d:new Animated.ValueXY({x:this.props.x||0, y:this.props.y||0}),
      unitsize : this.props.unitsize || 64,
      memoryComps:[],
      activeComps:[],
      _compId:0,
      zoomFactor:new Animated.Value(1)
    }
    this.handleInit = this.handleInit.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this._getBoundary = this._getBoundary.bind(this);
    this._initComponents = this._initComponents.bind(this);
    this._fixComponent = this._fixComponent.bind(this);
    this.getPosition = this.getPosition.bind(this);
    this.addItem = this.addItem.bind(this);
  }

  /* MOUNT : Gets touch events */
  componentWillMount() {
    this.state.d.addListener((value) => this.handleMove(value));
    this._panResponder = PanResponder.create({
      /*onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onStartShouldSetPanResponder: (e, gesture) => true,*/
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (e, gesture) => true,
      onPanResponderMove: (e, gesture) => {
        if (this.state.zoomFactor.__getValue()===1) {
          var x = this.state.x;
          var y = this.state.y;
          var newx = x-gesture.dx;
          var newy = y-gesture.dy;
          var newgx = -newx;
          var newgy = -newy;
          if (newgx<-this.state.unitsize || newgx>=this.state.unitsize) {
            newgx = (Math.floor(newx/this.state.unitsize)-newx/this.state.unitsize)*this.state.unitsize+this.state.unitsize*2.0;
          }
          if (gesture.dy<-this.state.unitsize || gesture.dy>=this.state.unitsize) {
            newgy = (Math.floor(newy/this.state.unitsize)-newy/this.state.unitsize)*this.state.unitsize+this.state.unitsize*2.0;
          }
          Animated.event([
            null,
            { dx: this.state.pan.x, dy: this.state.pan.y, wholedx:this.state.d.x, wholedy:this.state.d.y },
          ])(e, {dx:newgx, dy:newgy, wholedx:newx, wholedy:newy});
        }

        /*var x = this.state.x;
        var y = this.state.y;
        this.setState({x:x-gesture.dx, y:y-gesture.dy});*/
        return true
      },
      onPanResponderRelease: () => {
        this.setState({x: this.state.d.x.__getValue(), y:this.state.d.y.__getValue() })
      }

    })
  }
  /* INIT : already rendered, gets informations when rendered*/
  handleInit(event) {
    var xwidth = event.nativeEvent.layout.width;
    var yheight = event.nativeEvent.layout.height;
    var xpos = this.props.x ;
    var ypos = this.props.y ;

    if (this.props.onInitial) {
      if (typeof this.props.onInitial == 'function') {
        try {
          var b = this._getBoundary(xpos,ypos,xpos+xwidth, ypos+yheight);
          var l = this._initComponents(b);
        } catch (e) {
          console.error(e);
          var l = []
        }
      }
    } else {
      var l = []
    }
    /* Calculate the grid's position */
    var numberoflines = Math.floor(xwidth/this.state.unitsize)+4;
    var lines = [];
    for (i=0; i<numberoflines; i++ ) {
      var linepos = (i-2)*this.state.unitsize-this.state.unitsize - this.state.unitsize/2;
      lines.push({x: linepos, id:i});
    };
    var numberofrows = Math.floor(yheight/this.state.unitsize)+4;
    var rows = [];
    for (i=0; i<numberofrows; i++ ) {
      rows.push({y: (i-2)*this.state.unitsize-this.state.unitsize-this.state.unitsize/2, id:i});
    };

    this.setState({
      x:xpos-xwidth/2,
      y:ypos-yheight/2,
      width: xwidth,
      height: yheight,
      rows: rows,
      lines:lines,
      d:new Animated.ValueXY({x:xpos-xwidth/2, y:ypos-yheight/2}), // change d position to the right one initially
    })

  }
  /* EVENT : triggers update event */
  async handleMove(e) {
    /*this.setState({x:e.x, y:e.y})*/
    boundarybox = this._getBoundary(e.x, e.y, e.x+this.state.width, e.y+this.state.height);
    /*TODO : ADD ERROR HANDLING */
    if (typeof this.props.onUpdate == 'function') {
      try {
        this.props.onUpdate(boundarybox);
      } catch (e) {
        console.log(e);
      }
    }
  }

  /* COMPONENT'S FUNCTIONS : using 'ref' to get/post information */
  getPosition() {
    return {x: this.state.x+this.state.width/2, y: this.state.y+this.state.height/2}
  }
  addItem(item){
    var newitem = this._fixComponent(item);
    var newmemorycomps = this.state.memoryComps;
    var newactivecomps = this.state.activeComps;
    var uids=[];
    for (var i = 0; i < newmemorycomps.length; i++) {
      if (newmemorycomps.uid) {
        uids.push(newmemorycomps.uid);
      }
    }
    if (uids.indexOf(newitem.uid)<0) {
      newmemorycomps.push(newitem);
      newactivecomps.push(newitem);
      this.setState({memoryComps:newmemorycomps, activeComps:newactivecomps})
      return {
        "status":"ok",
      }
    } else {
      return {
        "status":"error",
        "message":"Item already exists"
      }
    }
  }
  removeItem(uid) {
    var newmemorycomps = [];
    var newactivecomps = [];
    for (var i = 0; i < this.state.memoryComps.length; i++) {
      if (this.state.memoryComps[i].uid !== uid) {
        newmemorycomps.push(this.state.memoryComps[i]);
        newactivecomps.push(this.state.memoryComps[i]);
      }
    }
    this.setState({memoryComps:newmemorycomps, activeComps:newactivecomps})
    return {
      "status":"removed",
    }
  }
  Zoom(val){
    Animated.timing(
      this.state.zoomFactor,
      {
        toValue: val,
        duration: 400,
      }
    ).start();
  }
  deZoom(){
    Animated.timing(
      this.state.zoomFactor,
      {
        toValue: 1,
        duration: 300,
      }
    ).start();
  }

  /* INTERNAL INFO : boundary box */
  _getBoundary(left, top, right, bottom) {
    const bmargin = this.props.boundaryMargin || 64;
    return {
        left:left-bmargin,
        top:top-bmargin,
        right:right+bmargin,
        bottom:bottom+bmargin
      }
  }
  /* INTERNAL ACTION : fix a new component */
  _fixComponent(c) {
    var newc = c;
    if (!c.height) {
      newc.height = 100
    }
    if (!c.width) {
      newc.width = 100
    }
    if (!c.x) {
      newc.x = 100
    }
    if (!c.y) {
      newc.y = 100
    }
    if (!c.uid) {
      newc.uid = 0;
      console.warn('Space : item should have a unique ID, please ad a `uid` parameter to your item ')
    }
    if (!c.component) {
      newc.component = <ComponentTest1/> // TODO : REPLACE WITH PLACEHOLDER COMP, NOT TESTING COMP
    }
    newc.x = Number(newc.x);
    newc.y = Number(newc.y);
    newc.width = Number(newc.width);
    newc.height = Number(newc.height);
    return newc;
  }
  /* INTERNAL ACTION: select components that should be rendered */
  selectActiveComponents() {
    // TODO
  }
  /* INTERNAL ACTION : convert initial components to the right stuff [especially add a unique id] */
  async _initComponents(boundary) {
    var clist = await this.props.onInitial(boundary);
    var nclist = [];
    for (var i = 0; i < clist.length; i++) {
      var n = clist[i];
      var nfix = this._fixComponent(n);
      nclist.push(nfix);
    }
    this.setState({
      activeComps:nclist,
      memoryComps:nclist
    })
    return nclist;
  }


  /* SPECIFIC INFO : gets the grid's line's styles [needs a cleaner aproach?] */
  getLineStyle(i,linesize, rowsize) {

    const pixelvalue = PixelRatio.getPixelSizeForLayoutSize(this.state.unitsize);

    if (linesize===0) {
      if ( rowsize<this.state.height/2 ) {
        var diff = Animated.add(this.state.height/2, Animated.multiply(-1, rowsize));
        var diffmult = Animated.multiply(this.state.zoomFactor, diff);
        var zoomAdd1 = Animated.add(diff, Animated.multiply(-1, diffmult));
        // var zoomAdd1 = Animated.multiply(Animated.multiply(this.state.zoomFactor, -this.state.unitsize), -(rowsize-this.state.width/2)/pixelvalue );
      } else if ( rowsize>=this.state.height/2 ) {
        var diff = Animated.add(rowsize, Animated.multiply(-1, this.state.height/2));
        var diffmult = Animated.multiply(this.state.zoomFactor, diff);
        var zoomAdd1 = Animated.add(diffmult, Animated.multiply(-1, diff));
        // var zoomAdd1 = Animated.multiply(Animated.multiply(this.state.zoomFactor, this.state.unitsize), (rowsize-this.state.width/2)/pixelvalue );
      }
      var top = rowsize;
      var left = 0;
      var width = "100%";
      var height = 1;
      var translateX = 0;
      var translateY = Animated.add(this.state.pan.y, zoomAdd1);
    } else if (rowsize===0) {
      if (linesize<this.state.width/2 ) {
        var diff = Animated.add(this.state.width/2, Animated.multiply(-1, linesize));
        var diffmult = Animated.multiply(this.state.zoomFactor, diff);
        var zoomAdd2 = Animated.add(diff, Animated.multiply(-1, diffmult));
        // var zoomAdd2 = Animated.multiply(Animated.multiply(this.state.zoomFactor, -this.state.unitsize), -(linesize-this.state.width/2)/pixelvalue );
      } else if (linesize>this.state.width/2 ) {
        var diff = Animated.add(linesize, Animated.multiply(-1, this.state.width/2));
        var diffmult = Animated.multiply(this.state.zoomFactor, diff);
        var zoomAdd2 = Animated.add(diffmult, Animated.multiply(-1, diff));
        //var zoomAdd2 = Animated.multiply(Animated.multiply(this.state.zoomFactor, this.state.unitsize), (linesize-this.state.width/2)/pixelvalue );
      }
      var top = 0;
      var left = linesize;
      var height = "100%";
      var width = 1;
      var translateX = Animated.add(this.state.pan.x, zoomAdd2);
      var translateY = 0;
    }
    if (this.props.theme) {
      var style=this.props.theme;
    } else {
      var style = SpaceStyles;
    }
    return [
              SpaceStyles._spaceLine,
              {
                backgroundColor:this.props.lineColor || "#9EADFF",
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

    /* CREATE ITEM LIST */

    if (this.state.activeComps.length>0) {

      var uids = []
      var items = this.state.activeComps.map((item) => {
        if (uids.indexOf(item.uid)<0) {
          uids.push(item.uid);

          var baseTopPosition = Animated.add(Animated.add(Animated.multiply(this.state.d.y,-1), item.y), Animated.multiply(-1, item.height/2));
          if (baseTopPosition.__getValue()+item.height/2 < (this.state.height/2)) {
              var diff = Animated.add(this.state.height/2, Animated.multiply(-1, baseTopPosition));
              var diffmult = Animated.multiply(this.state.zoomFactor, diff);
              var zoomAdd1 = Animated.add(diffmult, Animated.multiply(-1, diff));
              // var addition = Animated.multiply(Animated.multiply( -pixelUnitValue , this.state.zoomFactor), Animated.multiply( Animated.divide(Animated.add(baseTopPosition, -this.state.height/2), pixelUnitValue ), -1) );
              /*Animated.multiply(Animated.multiply(this.state.zoomFactor, -this.state.unitsize), -(linesize-this.state.width/2)/pixelvalue );*/
          } else {
              var diff = Animated.add(this.state.height/2, Animated.multiply(-1, baseTopPosition));
              var diffmult = Animated.multiply(this.state.zoomFactor, diff);
              var zoomAdd1 = Animated.add(diffmult, Animated.multiply(-1, diff));
              //  var addition = Animated.multiply(Animated.multiply( pixelUnitValue , this.state.zoomFactor), Animated.divide(Animated.add(baseTopPosition, -this.state.height/2), pixelUnitValue ) );
          }
          var topPosition = Animated.add(baseTopPosition, Animated.multiply(-1, zoomAdd1));



          var baseLeftPosition = Animated.add(Animated.add(Animated.multiply(this.state.d.x,-1), item.x), Animated.multiply(-1, item.width/2));

          if (baseLeftPosition.__getValue()+item.width/2 < this.state.width/2) {
            var diff = Animated.add(baseLeftPosition, Animated.multiply(-1, this.state.width/2));
            var diffmult = Animated.multiply(this.state.zoomFactor, diff);
            var zoomAdd2 = Animated.add(diff, Animated.multiply(-1, diffmult));
            //var addition2 = Animated.multiply(Animated.multiply( -pixelUnitValue , this.state.zoomFactor), Animated.multiply( Animated.divide(Animated.add(baseLeftPosition, -this.state.width/2), pixelUnitValue ), -1) );

          } else {
            var diff = Animated.add(this.state.width/2, Animated.multiply(-1, baseLeftPosition));
            var diffmult = Animated.multiply(this.state.zoomFactor, diff);
            var zoomAdd2 = Animated.add(diffmult, Animated.multiply(-1, diff));
            //var addition2 = Animated.multiply(Animated.multiply( pixelUnitValue , this.state.zoomFactor), Animated.divide(Animated.add(baseLeftPosition, -this.state.width/2), pixelUnitValue ) );
          }

          var leftPosition =Animated.add(baseLeftPosition, Animated.multiply(-1, zoomAdd2));

          return (
            (<Animated.View
                style={{position:"absolute",
                  top:topPosition,
                  left:leftPosition,
                  width:item.width,
                  height:item.height,
                  transform: [
                    {scaleX:this.state.zoomFactor},
                    {scaleY:this.state.zoomFactor}
                  ]
                  }}
                  key={item.uid}
                >

                  {item.component}

              </Animated.View>)
          )
        }
      });
    } else {
      var items = [];
    }

    return (
      <View onLayout={(e) => this.handleInit(e)} style={[SpaceStyles._spaceView,{backgroundColor:this.props.backgroundColor || "#1E59E9"} ]} {...this._panResponder.panHandlers} >
        {
          this.state.lines &&

          this.state.lines.map(line => <Animated.View style={this.getLineStyle(line.id, line.x, 0)} key={line.id}></Animated.View>)

        }

        {
          this.state.rows &&

          this.state.rows.map(row => <Animated.View style={this.getLineStyle(row.id, 0,row.y)} key={row.id}></Animated.View>)

        }

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

export class ComponentPoint extends React.Component {

  render() {
    return (
      <View style={{backgroundColor:'rgba(255,25,25,0.5)', width:64, height:48}} >
      <Text style={SpaceStyles.componentError}> X : {this.props.x}</Text>
      <Text style={SpaceStyles.componentError}> Y : {this.props.y}</Text>
      </View>
    )
  }
};
