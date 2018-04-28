# React Native Space

A compenent allowing you to play with space. By "space", I mean the concept of space : some space where entites occupy some space in a certain position.

Basically, it's a stripped-down map.

But this means we can add whatever we want to that space. And that's the cool part.


## How to use it

Use it as a component. Like this :

```
  render() {
    return (
      <Space
        x={0}
        y={0}
        unitsize={64}
      />
    )
  }
```


### Properties

```
x={1984}   //  initial x coordinate on the space
y={1849}   // initial y coordinate of the space
unitsize={32}   // size of the units to draw the grid (only used to draw)
onPositionChange={function(boundary)}  // gets the space covered by the component, triggered when you move

```

Properties that are needed but still not built
```
InitialComponents = [{
    x:10,
    y:100,
    width:100,
    height:100,
    object:<Component>
  }]

exploringZoneHandler = function(box) {
  return [
    {
      x:100, // if it is in the box
      y:100, // if it is in the box

    }
  ]
}
```

## Still very barebones

For now this is basically an unusable component, it's just quite fun to play with, that is if you are easily entertained.

# TODO

To make it more usable, here's a list of things to do :
- Function to add components in it depending on coordinates
- Memory object : keep objects in mind to re-render them when on the right coordinates.
- (logical addition) Remove objects when not in the box.
- Figure out a way to make it work with a REST api
