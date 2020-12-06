#!/usr/bin/env node

import {sync as glob} from 'fast-glob'
import {readFileSync, writeFileSync} from 'fs'
import transformCode from './src/transformCode'

const tsxFiles = glob('**/**.tsx').map((path) => ({
  path,
  content: readFileSync(path, 'utf-8')
}))

const filesWithUseStyles = tsxFiles.filter(({content}) =>
  content.includes('useStyles')
)

filesWithUseStyles.forEach(({path, content}) => {
  console.log('Changing', path, '...')
  try {
    writeFileSync(path, transformCode(content))
  } catch (e) {
    console.error('Failed')
  }
  console.log('Done')
})
