import {parse, ParserOptions} from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import {readFileSync} from 'fs'
import {isJSXElement} from '@babel/types'
import generateStyledComponent from './src/generateStyledComponent'
import handleUseStylesDefinition, {
  StyledComponentByClass
} from './src/handleUseStylesDefinition'

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

let styledComponents: StyledComponentByClass

traverse(ast, {
  VariableDeclaration: (path) => {
    if (getVariableDeclarationName(path.node) !== 'useStyles') return

    styledComponents = handleUseStylesDefinition(path)
  },

  MemberExpression: (enter) => {
    // classes.second in <span className={classes.second}>
    if ((<any>enter.node.object).name !== 'classes') return
    // assuming useStyled creation happened before

    const className = (<any>enter.node.property).name
    const styledComponent = styledComponents[className]
    const jsxElement: any = enter.parentPath.parentPath.parent
    const elementType = jsxElement.name.name

    if (
      styledComponent.elementType &&
      styledComponent.elementType !== elementType
    ) {
      throw new Error(
        `Class '${className}' used on elements with different types: ${styledComponent.elementType} and ${elementType}`
      )
    }
    enter.parentPath.parentPath.remove()

    // avoid name clash
    if (jsxElement.name.name === styledComponent.componentName) {
      styledComponent.componentName = 'Styled' + styledComponent.componentName
    }

    const fullJsxElement = enter.parentPath.parentPath.parentPath.parent
    if (!isJSXElement(fullJsxElement)) return

    fullJsxElement.openingElement.name.name = styledComponent.componentName
    if (fullJsxElement.closingElement) {
      fullJsxElement.closingElement.name.name = styledComponent.componentName
    }

    jsxElement.name.name = styledComponent.componentName
    styledComponent.elementType = elementType
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
