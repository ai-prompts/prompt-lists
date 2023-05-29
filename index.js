import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import yaml from 'js-yaml'

const listsPath = 'lists'
const allLists = fs
  .readdirSync(listsPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .flatMap(dirent =>
    fs.readdirSync(path.join(listsPath, dirent.name))
      .filter(file => path.extname(file) === '.yml')
      .map(file => [dirent.name, file.split('.')[0]])
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

const getList = (() => {
  const cache = {}

  return (listPath, opt) => {
    const options = opt || {}
    const key = JSON.stringify({ listPath, options })

    if (cache[key]) {
      return cache[key]
    }

    const l = readListFile(listPath)

    cache[key] = l
    return l
  }
})()

const item = (listPath, count = 1, listOptions = {}) => {
  if (typeof count === 'object') {
    listOptions = count
    count = 1
  }

  const { list } = getList(listPath, listOptions)
  return _.sampleSize(list, count).join(', ').trim()
}

const addNestedProperty = (obj, path, value) => {
  const lastKey = path.pop()
  path.reduce((nestedObj, key) => {
    if (!nestedObj[key]) nestedObj[key] = {}
    return nestedObj[key]
  }, obj)[lastKey] = value
}

const listHelpers = {}

// make all lists available as methods
allLists.forEach((listPath) => {
  addNestedProperty(listHelpers, [...listPath], {
    ...getList(listPath),
    item: (count) => item(listPath, count)
  })
})

export default listHelpers
