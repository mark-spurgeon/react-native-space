import {StyleSheet} from "react-native";
export default SpaceStyles = StyleSheet.create({

  _spaceView: {
    flex:0,
    height:"100%",
    width:"100%",
    backgroundColor:"#1E59E9",
    overflow:"hidden"
  },

  _spaceLine: {
    height:1,
    width:1,
    backgroundColor:"#9EADFF",
    position:"absolute",
    top:0,
    left:0
  },


  testView : {
    backgroundColor:"white",
    width:200,
    height:200,
    flex:1,
    borderRadius:3
  },

  testText : {
    backgroundColor:"#202060",
    padding:5,
    color:"white",
    borderTopLeftRadius:3,
    borderTopRightRadius:3
  },
  testInput : {
    backgroundColor:"white",
    padding:5,
  }

})
