import {parse, ParserOptions} from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import {readFileSync} from 'fs'
import generateStyledComponent from './src/generateStyledComponent'
import handleUseStylesDefinition, {
  StyledComponentByClass
} from './src/handleUseStylesDefinition'
import handleClassesUsage from './src/handleClassesUsage'
import {isIdentifier, isImportSpecifier} from '@babel/types'

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
    if (!isIdentifier(path.node.object)) return
    if (path.node.object.name !== 'classes') return

    // Assuming useStyled creation happened before
    handleClassesUsage(path, styledComponents)
  },

  CallExpression: (path) => {
    if (!isIdentifier(path.node.callee)) return
    if (path.node.callee.name !== 'useStyles') return

    path.parentPath.parentPath.remove()
  },

  ImportDeclaration: (path) => {
    if (path.node.source.value !== '@material-ui/core') return
    path.node.specifiers = path.node.specifiers.filter((specifier) => {
      if (!isImportSpecifier(specifier) || !isIdentifier(specifier.imported))
        return true

      const importName = specifier.imported.name
      return !['makeStyles', 'createStyles', 'Theme'].includes(importName)
    })

    const noImportsLeft = path.node.specifiers.length === 0
    if (noImportsLeft) path.remove()
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
