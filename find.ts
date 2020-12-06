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
  writeFileSync(path, transformCode(content))
})

console.log('Changed:')
filesWithUseStyles.forEach(({path}) => console.log(path))
