#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const rootDir = 'lists'
const excludedLists = [
  'city', 'country', 'territory', 'day'
]

const processDirectory = (dir) => {
  const dirEntries = fs.readdirSync(dir, { withFileTypes: true })

  for (const dirEntry of dirEntries) {
    if (dirEntry.isDirectory()) {
      processDirectory(path.join(dir, dirEntry.name))
    } else if (dirEntry.isFile() && path.extname(dirEntry.name) === '.yml') {
      processFile(dir, dirEntry.name)
    }
  }
}

const processFile = (dir, file) => {
  if (excludedLists.some(e => file.includes(e))) {
    return
  }

  const filePath = path.join(dir, file)
  const fileContents = fs.readFileSync(filePath).toString()
  const fileSections = fileContents.split('---')

  const frontmatter = fileSections[1]
  let list = fileSections[2]
    .toLowerCase()
    .split('\n')
    .filter(e => String(e).trim())
    .map(e => e.replace(/^\s+-\s+|^-\s+|^\s+/g, '').replace(/\.$/, ''))

  // Dedupe
  list = [...new Set(list)]

  // Sort
  list.sort((a, b) => a.localeCompare(b))

  const newContents = `---${frontmatter}---\n${list.join('\n')}\n`

  if (fileContents !== newContents) {
    const writeStream = fs.createWriteStream(filePath)
    const pathName = writeStream.path

    // write new file contents
    writeStream.write(newContents)

    // the finish event is emitted when all data has been flushed from the stream
    writeStream.on('finish', () => {
      console.log(`Updated ${pathName}`)
    })

    // handle the errors on the write process
    writeStream.on('error', (err) => {
      console.error(`There is an error writing the file ${pathName} => ${err}`)
    })

    // close the stream
    writeStream.end()
  }
}

processDirectory(rootDir)
