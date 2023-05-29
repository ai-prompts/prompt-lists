import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import yaml from 'js-yaml'

const listsPath = 'lists'

const toCamelCase = (str) => {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase() })
}

const allLists = fs
  .readdirSync(listsPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .flatMap(dirent =>
    fs.readdirSync(path.join(listsPath, dirent.name))
      .filter(file => path.extname(file) === '.yml')
      .map(file => {
        return {
          originalPath: [dirent.name, file.split('.')[0]],
          camelCasePath: [toCamelCase(dirent.name), toCamelCase(file.split('.')[0])]
        }
      })
  )

const readListFile = (listPath) => {
  const fileContent = fs.readFileSync(`${listsPath}/${listPath.join('/')}.yml`).toString()
  const [frontmatter, items] = fileContent.split(/---|\.\.\./).slice(1) // Splits at the YAML frontmatter boundaries
  const parsedFrontmatter = yaml.load(frontmatter)
  const list = items.split('\n').filter(e => String(e).trim())
  return {
    title: parsedFrontmatter.title,
    category: parsedFrontmatter.category,
    list
  }
}

const addNestedProperty = (obj, path, getter) => {
  const lastKey = path.pop()
  path.reduce((nestedObj, key) => {
    if (!nestedObj[key]) nestedObj[key] = {}
    return nestedObj[key]
  }, obj)[lastKey] = getter
}

const listHelpers = {}

// make all lists available as methods
allLists.forEach((listPaths) => {
  let cachedList = null
  const listGetter = (count) => {
    if (!cachedList) {
      cachedList = readListFile(listPaths.originalPath)
    }
    if (typeof count === 'number' && count > 0) {
      return _.sampleSize(cachedList.list, count)
    }
    return cachedList
  }
  addNestedProperty(listHelpers, [...listPaths.camelCasePath], listGetter)
})

export default listHelpers
