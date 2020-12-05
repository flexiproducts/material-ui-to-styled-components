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

export default function generateStyledComponent({
  componentName,
  css,
  elementType,
  needsTheme
}) {
  const isCustomComponent = elementType[0] !== elementType[0].toLowerCase()
  const styledFunction = isCustomComponent
    ? callExpression(identifier('styled'), [identifier(elementType)]) // styled(Button)
    : memberExpression(identifier('styled'), identifier(elementType)) // styled.div

  if (needsTheme) {
    return `const ${componentName} = ${
      generate(styledFunction).code
    }(({theme}) => css\`${css}\`)`
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
