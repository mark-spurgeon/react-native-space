# React Native Space

A compenent allowing you to play with space. By "space", I mean the concept of space : some space where entites occupy some space in a certain position.

Basically, it's a stripped-down map.

But this means we can add whatever we want to that space. And that's the cool part.
> This is in early development, so I advise you not to use it for production purposes.


![Screen Capture](https://github.com/the-duck/react-native-space/blob/master/img/screen.gif)

### Installation
```
npm install --save react-native-space
```
Current version : 0.1.4

### Usage

Use it as a component. Like this :

```
import Space from 'react-native-space';
import {Text} from 'react-native';


class MainView extends React.Component {

  loadComponents(boundary) {
    //... check if items are in the boundary
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
        onInitial={(b)=>loadComponents(b)}
      />  
    );
  }
}

```
You might as well use Space's testing component(s)

`
import {ComponentTest1} from 'react-native-space';
`


### Properties

| prop        | default     | type  | description |
| ----------- |:-----------:| -----:| ----------- |
| x | 0 | Number | X position of the component on the space |
| y | 0 | Number | Y position of the component on the space |
| theme | 0 | React.StyleSheet | Override theme, checkout the docs : [link soon](https://) |
| onInitial | None | Function (Event) | Return a list of components to load initially. Passes a `boundary` json object |
| onUpdate | None | Function (Event) | Return a list of components to add depending on the boundary. Passes a `boundary` json object.|
| addComponent | return null | Function | Add a component. ! This has not been entirely tested, and should not be used(and anyway it should be used in a certain way which has not been documented yet) |

#### Functions
All functions pass `boundary` data, which corresponds to the area that the component covers.
```
...

update(boundary) {
  /*
  var t = boundary.view.top;
  var l = boundary.view.left;
  var r = boundary.view.right;
  var b = boundary.view.bottom;
  */
}

render() {
  return (
    <Space
      x={0}
      y={0}
      onInitial={(b)=>loadComponents(b)}
      onUpdate={(b) => update(b)}
    />  
  );
}

... in your MainView component, for example
```

# TODO

- Component ID system [crucial] : generate ID.
- Memory object : keep objects in mind to re-render them when on the right coordinates. (close to being done)
- (logical addition) Remove objects when not in the box. (close as well, goes with memory system)
- Add components while already running (√ though still experimental)
- Figure out a way to make it work with a REST api
- Take velocity into account when scrolling.
- [you might want to submit an issue if you need something more :)]
