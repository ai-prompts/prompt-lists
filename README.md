# Lists for prompts

Categorised lists of things for AI image and media generation

Install using npm:

```bash
npm install prompt-lists
```

## Usage

After you’ve installed the package, you can import and use it in your project as follows:

```javascript
import lists from 'prompt-lists'

console.log(lists.animal.mammal(3))
//  [ 'marmoset', 'caribou', 'tiger', 'platypus' ]

console.log(lists.animal.mammal())
// {
//   title: 'Mammals',
//   category: 'animal',
//   list: [
//     'aardvark',
//     'american mink',
//     'anteater',
//     'antelope',
//     ...
//   ]
// }
```
