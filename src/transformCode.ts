import traverse from '@babel/traverse'
import generate from '@babel/generator'
import generateStyledComponent from './generateStyledComponent'
import handleUseStylesDefinition, {
  StyledComponentByClass
} from './handleUseStylesDefinition'
import handleClassesUsage from './handleClassesUsage'
import {isIdentifier, isImportSpecifier} from '@babel/types'
import parse from './parse'

export default function (code: string) {
  const ast = parse(code)

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
  return output
}

function getVariableDeclarationName(node) {
  return (<any>node.declarations[0].id)?.name
}
