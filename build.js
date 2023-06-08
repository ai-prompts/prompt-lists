import listHelpers from './index.js'
import fs from 'fs'

const allLists = []
const listMetadata = {}

for (const category of Object.keys(listHelpers)) {
  for (const listName of Object.keys(listHelpers[category])) {
    const key = `${category}.${listName}`

    allLists.push(key)
    listMetadata[key] = listHelpers[category][listName]()
    listMetadata[key].total = listMetadata[key].list.length
    delete listMetadata[key].list
  }
}

fs.writeFileSync('lists.json', JSON.stringify(allLists, null, 2))
fs.writeFileSync('list-metadata.json', JSON.stringify(listMetadata, null, 2))
