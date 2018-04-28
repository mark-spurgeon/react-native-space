import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
  Animated
} from 'react-native';

import SpaceStyles from "./SpaceStyle";


export class Space extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      pan:new Animated.ValueXY(),
      d:new Animated.ValueXY(),
      unitsize : this.props.unitsize || 64,
    }
    this.measureWelcome = this.measureWelcome.bind(this);
    this.handleMove = this.handleMove.bind(this);
  }
  measureWelcome(event) {
    this.setState({
      x:this.props.x || 0,
      y:this.props.y || 0,
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height
    })
  }

  async handleMove(e) {
    /*this.setState({x:e.x, y:e.y})*/
    boundarybox = {
      "left":e.x,
      "right":e.x+this.state.width,
      "top":e.y,
      "bottom":e.y+this.state.height,
    }
    /*TODO : ADD ERROR HANDLING */
    this.props.onPositionChange(boundarybox);
  }

  componentWillUnmount() {

  }

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
        var newgx = gesture.dx;
        var newgy = gesture.dy;
        if (gesture.dx<-this.props.unitsize || gesture.dx>=this.state.unitsize) {
          newgx = -(Math.floor(gesture.dx/this.state.unitsize)-gesture.dx/this.props.unitsize)*this.state.unitsize;
        }
        if (gesture.dy<-this.props.unitsize || gesture.dy>=this.state.unitsize) {
          newgy = -(Math.floor(gesture.dy/this.state.unitsize)-gesture.dy/this.props.unitsize)*this.state.unitsize;
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


  getStyle(linesize, rowsize) {
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
    return [
              SpaceStyles.line,
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
    const numberoflines = Math.floor(this.state.width/this.state.unitsize)+4;
    var lines = [];
    for (i=0; i<numberoflines; i++ ) {
      lines.push({x: (i-2)*this.props.unitsize-this.state.unitsize-this.state.unitsize/2, id:i});
    };
    const numberofrows = Math.floor(this.state.height/this.state.unitsize)+4;
    var rows = [];
    for (i=0; i<numberofrows; i++ ) {
      rows.push({y: (i-2)*this.state.unitsize-this.state.unitsize/2, id:i});
    };
    return (
      <View onLayout={(e) => this.measureWelcome(e)} style={SpaceStyles.view} {...this._panResponder.panHandlers} >
        { lines.map(line => <Animated.View style={this.getStyle(line.x, 0)} key={line.id}></Animated.View>)}
        { rows.map(row => <Animated.View style={this.getStyle(0,row.y)} key={row.id}></Animated.View>)}
        <View style={[SpaceStyles.border,{height:"100%", top:0, right:0}]}></View>
        <View style={[SpaceStyles.border,{height:"100%", top:0, left:0}]}></View>
        <View style={[SpaceStyles.border,{width:"100%", top:0, left:0}]}></View>
        <View style={[SpaceStyles.border,{width:"100%", bottom:0, left:0}]}></View>
      </View>
    )
  }
};
