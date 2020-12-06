import generate from '@babel/generator'
import {
  callExpression,
  identifier,
  memberExpression,
  taggedTemplateExpression,
  templateElement,
  templateLiteral,
  variableDeclaration,
  variableDeclarator
} from '@babel/types'

export type StyledComponent = {
  componentName: string
  css: string
  elementType?: string
  needsTheme: boolean
}

export default function generateStyledComponent(
  styledComponent: StyledComponent
): string {
  const {componentName, css, elementType, needsTheme} = styledComponent
  const isCustomComponent = elementType[0] !== elementType[0].toLowerCase()
  const styledFunction = isCustomComponent
    ? callExpression(identifier('styled'), [identifier(elementType)]) // styled(Button)
    : memberExpression(identifier('styled'), identifier(elementType)) // styled.div

  if (needsTheme) {
    return `const ${componentName} = ${
      generate(styledFunction).code
    }(({theme}) => \`${css}\`)`
  }

  return generate(
    variableDeclaration('const', [
      variableDeclarator(
        identifier(componentName),
        taggedTemplateExpression(
          styledFunction,
          templateLiteral([templateElement({raw: css})], [])
        )
      )
    ])
  ).code
}
