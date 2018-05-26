![logo](https://github.com/the-duck/react-native-space/blob/master/img/rnspace.png)
React Native Space
======

A compenent allowing you to play with space. By "space", I mean the concept of space : some space where entites occupy some space in a certain position.

Basically, it's a stripped-down map.

But this means we can add whatever we want to that space. And that's the cool part.
> This is in early development, so I advise you not to use it for production purposes.


![Screen Capture](https://github.com/the-duck/react-native-space/blob/master/img/screen.gif)

### Installation
```
npm install --save react-native-space
```
Current version : 0.2.0 (latest is most stable)

### Usage

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
        uid:"anything that's unique to the item",
        component: <Text>Oh hi mark</Text>  // Any React component
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


# Properties

| prop        | default     | type  | description |
| ----------- |:-----------:| -----:| ----------- |
| x | 0 | Number | X position of the component on the space |
| y | 0 | Number | Y position of the component on the space |
| unitsize | 64 | Number | Size of the 'unit' of the grid |
| backgroundColor | # | color value | Background color |
| lineColor | # | color value | Grid's lines' color |
| onInitial | null | Function (Event) | Return a list of components to load initially. Passes a `boundary` json object |
| onUpdate | null | Function (Event) | Return a list of components to add depending on the boundary.|

# Functions
Properties let you monitor what happens when the Space changes. But to add things dynamically, you need to use the 'ref' like so

```
...

otherFunction() {
  this.refs.SpaceComponent.addItem()
}

render() {
  return (
    <Space
      ...
      ...
      ref={"SpaceComponent"}
    />  
  );
}

...

```

#### addItem(item)
Add an item to the Space
```
var i = this.refs.SpaceComponent.addItem({
    x: 0,
    y:0,
    width:100,
    height:100,
    uid:'lakenfjeohfi',
    component:<Text>I like spaghett</Text>
  })
console.log(i.status) // returns 'ok'
```
#### removeItem(uid)
Remove an item.
```
var rm = this.refs.SpaceComponent.removeItem(uid)
console.log(rm.status) // returns 'removed'
```
__All__ objects with the `uid` will be removed, so this property is important.

#### getPosition()
Gets the position of the Space
```
var pos = this.refs.SpaceComponent.getPosition()
console.log(pos.x, pos.y)
```

# TODO

- Component ID system [crucial] : generate ID. 👌
- Memory object : keep objects in mind to re-render them when on the right coordinates. (close to being done) 👌
- Add components while already running 👌
- Take velocity into account when moving the space around. 🔨
- Remove objects when not in the box. (close as well, goes with memory system) 🔨
