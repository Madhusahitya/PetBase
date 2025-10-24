# Pet Sprites

Place sprite sheets here for animated pets:

## Required Files:
- `puppy-idle.png` - 4 frames, 100ms delay (happy puppy wagging tail)
- `puppy-sad.png` - 4 frames, 150ms delay (sad puppy drooping ears)
- `puppy-grown.png` - 4 frames, 100ms delay (evolved puppy at level 5+)
- `kitten-idle.png` - 4 frames, 100ms delay (happy kitten playing)
- `kitten-sad.png` - 4 frames, 150ms delay (sad kitten)
- `kitten-grown.png` - 4 frames, 100ms delay (evolved kitten)
- `dragon-idle.png` - 4 frames, 100ms delay (happy dragon breathing fire)
- `dragon-sad.png` - 4 frames, 150ms delay (sad dragon)
- `dragon-grown.png` - 4 frames, 100ms delay (evolved dragon)

## Sprite Sheet Format:
- 4 frames horizontally
- 200x200px per frame
- Total: 800x200px
- Transparent background (PNG)

## Usage:
The PetCard component will automatically select the right sprite based on:
- `petType`: puppy, kitten, dragon
- `happiness`: >50 = idle, <50 = sad
- `level`: >=5 = grown version
