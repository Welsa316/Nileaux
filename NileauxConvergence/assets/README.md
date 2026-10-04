# Nileaux emblem, source of truth

`nileaux-emblem.svg` is a byte-for-byte copy of the supplied
`Elegant Crescent River Emblem.svg` (viewBox 0 0 1024 1024, one compound path of
eight subpaths, fill only).

The component does not redraw or simplify it. `../emblem/geometry.js` is generated
from this file: the full compound path is used verbatim for the fill layer, and the
same eight subpaths are exposed individually so each can be stroke-drawn in sequence.
Regenerate that module if this file ever changes.
