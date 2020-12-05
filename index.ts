import {parse, ParserOptions} from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import {readFileSync} from 'fs'
import generateStyledComponent from './src/generateStyledComponent'
import handleUseStylesDefinition, {
  StyledComponentByClass
} from './src/handleUseStylesDefinition'
import handleClassesUsage from './src/handleClassesUsage'

const babelOptions: ParserOptions = {
  sourceType: 'module',
  plugins: [
    'jsx',
    'typescript',
    ['decorators', {decoratorsBeforeExport: true}],
    'classProperties',
    'optionalChaining',
    'nullishCoalescingOperator'
  ]
}

const code = readFileSync('./fixtures/before.tsx', 'utf-8')
const ast = parse(code, babelOptions)

let styledComponents: StyledComponentByClass = {}

traverse(ast, {
  VariableDeclaration: (path) => {
    if (getVariableDeclarationName(path.node) !== 'useStyles') return

    styledComponents = handleUseStylesDefinition(path)
  },

  MemberExpression: (path) => {
    // classes.second in <span className={classes.second}>
    if ((<any>path.node.object).name !== 'classes') return
    // assuming useStyled creation happened before

    handleClassesUsage(path, styledComponents)
  },

  CallExpression: (enter) => {
    if ((<any>enter.node.callee)?.name === 'useStyles') {
      enter.parentPath.parentPath.remove()
    }
  },

  ImportDeclaration: (enter) => {
    if (enter.node.source.value === '@material-ui/core') {
      enter.node.specifiers = enter.node.specifiers.filter((specifier) => {
        const importName = (<any>specifier)?.imported?.name
        return !['makeStyles', 'createStyles', 'Theme'].includes(importName)
      })
      if (enter.node.specifiers.length === 0) {
        enter.remove()
      }
    }
  }
})

const noComponentWithTheme = Object.values(styledComponents).every(
  ({needsTheme}) => !needsTheme
)

const output =
  (noComponentWithTheme
    ? `import styled from 'styled-components'\n`
    : `import styled, {css} from 'styled-components'\n`) +
  generate(ast).code +
  '\n\n' +
  Object.values(styledComponents).map(generateStyledComponent).join('\n\n')
console.log(output)

function getVariableDeclarationName(node) {
  return (<any>node.declarations[0].id)?.name
}
