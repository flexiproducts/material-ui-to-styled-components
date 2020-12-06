import traverse from '@babel/traverse'
import generateStyledComponent from './generateStyledComponent'
import handleUseStylesDefinition, {
  StyledComponentByClass
} from './handleUseStylesDefinition'
import handleClassesUsage from './handleClassesUsage'
import {isIdentifier, isImportSpecifier} from '@babel/types'
import parse from './parse'
import MagicString from 'magic-string'
import {removeNode, replaceNode} from './output'
import generate from '@babel/generator'

export default function (code: string) {
  const ast = parse(code)
  const output = new MagicString(code)

  let styledComponents: StyledComponentByClass = {}

  traverse(ast, {
    VariableDeclaration: (path) => {
      if (getVariableDeclarationName(path.node) !== 'useStyles') return

      styledComponents = handleUseStylesDefinition(path, output)
    },

    MemberExpression: (path) => {
      if (!isIdentifier(path.node.object)) return
      if (path.node.object.name !== 'classes') return

      // Assuming useStyled creation happened before
      handleClassesUsage(path, styledComponents, output)
    },

    CallExpression: (path) => {
      if (!isIdentifier(path.node.callee)) return
      if (path.node.callee.name !== 'useStyles') return

      removeNode(output, path.parentPath.parentPath.node)
    },

    ImportDeclaration: (path) => {
      if (path.node.source.value === 'react' && path.node.end) {
        output.appendRight(
          path.node.end,
          `\nimport styled from 'styled-components'`
        )
      }

      if (path.node.source.value !== '@material-ui/core') return
      path.node.specifiers = path.node.specifiers.filter((specifier) => {
        if (!isImportSpecifier(specifier) || !isIdentifier(specifier.imported))
          return true

        const importName = specifier.imported.name
        return !['makeStyles', 'createStyles', 'Theme'].includes(importName)
      })

      const noImportsLeft = path.node.specifiers.length === 0
      if (noImportsLeft) {
        removeNode(output, path.node)
      } else {
        replaceNode(output, path.node, generate(path.node).code)
      }
    }
  })

  return (
    output.toString() +
    '\n\n' +
    Object.values(styledComponents).map(generateStyledComponent).join('\n\n')
  )
}

function getVariableDeclarationName(node) {
  return (<any>node.declarations[0].id)?.name
}
