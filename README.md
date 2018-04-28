# React Native Space

A compenent allowing you to play with space. By "space", I mean the concept of space : some space where entites occupy some space in a certain position.

Basically, it's a stripped-down map.

But this means we can add whatever we want to that space. And that's the cool part.
> This is in early development, so I advise you not to use it for production purposes.


![Screen Capture](https://github.com/the-duck/react-native-space/img/screen.gif)

### Installation
```
npm install --save react-native-space
```
make sure it's version 0.0.4 ... or higher

### Usage

Use it as a component. Like this :

```
import Space from 'react-native-space';
import {Text} from 'react-native';


class MainView extends React.Component {

  loadComponents(boundary) {
    //... check if items are in the boundaries
    return [
      {
        x:10,
        y:100,
        width:100,
        height:100,
        component: <Text>Oh hi mark</Text>  // Any React component, in theory
      }
    ]
  }

  render() {
    return (
      <Space
        x={0}
        y={0}
        loadInitialComponents={(b)=>loadComponents(b)}
      />  
    );
  }
}

```
You might as well use Space's testing component(s)

`
import {SpaceTest} from 'react-native-space';
`


### Properties

| prop        | default     | type  | description |
| ----------- |:-----------:| -----:| ----------- |
| x | 0 | Number | X position of the component on the space |
| y | 0 | Number | Y position of the component on the space |
| theme | 0 | React.StyleSheet | Override theme, checkout the docs : [link soon](https://) |
| loadInitialComponents | None | Function | Gets a list of components to load initially. Passes a `boundary` json object |
| onPositionChange | None | Function | Optionnaly add an event listener, passes a `boundary` json object.|

#### Functions
All functions pass `boundary` data, which corresponds to the area that the component covers.
```
...

onPos(boundary) {
  /*
  var t = boundary.top;
  var l = boundary.left;
  var r = boundary.right;
  var b = boundary.bottom;
  */
}

render() {
  return (
    <Space
      x={0}
      y={0}
      loadInitialComponents={(b)=>loadComponents(b)}
      onPositionChange={(b) => onPos(b)}
    />  
  );
}

... in your MainView component, for example
```

# TODO

- Function to add components in it depending on coordinates √ 
- Memory object : keep objects in mind to re-render them when on the right coordinates.
- (logical addition) Remove objects when not in the box.
- Figure out a way to make it work with a REST api
- Take velocity into account when scrolling.
- [you might want to submit an issue if you need something more]
