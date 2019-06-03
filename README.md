# node-red-contrib-signal-interval

The purpose of this node is to identify pairs of signals/payloads and return the time distance (interval) between them.

A pair of signals consists of an **on** signal followed by an **off** signal. Upon arrival of the **off** signal, the node will emit a payload which includes information about the duration of the **on** period which is defined as the interval between the signals.

## Example:

    Input:  on--off-----on------------off---
                 |                     |
                 |                     |
    Output:  interval: 0.2 s     interval: 1.2 s


## Payload format

### Input

The expected input for the node takes the form

```javascript
{
    cmd: 'on' | 'off'
}
```

i.e. the **on**/**off** value is expected on the `cmd` property by default; a different property name can be specified on the node configuration if needed (only top-level properties supported, no nesting).

### Output

The output format looks like

```javascript
{
    type:"actual" | "dummy",
    duration:0.618
}
```

with the duration in seconds and the type explained below.

## Noise

Generally transmissions can be noisy and signals can be blocked along the way. In our case, the effect of this would be that one (or multiple) signals are dropped and don't reach the node. If we miss out on an entire pair of signals (i.e. the **on** and the **off** signals are dropped) there is nothing we can do. If, however, the environment is not too noisy we can assume most of the signals coming through and we only have to compensate for a missing **on** or **off** signal every now and then. We can detect this situation by two consecutive **on** or two consecutive **off** signals. In this case, we know that we have missed a signal but don't know when, so we just assume a default interval duration. This is indicated by `type: "dummy"` with the default/dummy duration being configurable in the node configuration (also check the tests in `spec.js` for some examples).
