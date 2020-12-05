import {NodePath} from '@babel/traverse'
import {isJSXElement, isJSXIdentifier, MemberExpression} from '@babel/types'
import MagicString from 'magic-string'
import {StyledComponentByClass} from './handleUseStylesDefinition'
import {removeNode, replaceNode} from './output'

export default function handleClassesUsage(
  path: NodePath<MemberExpression>,
  styledComponents: StyledComponentByClass,
  output: MagicString
): void {
  const className = (<any>path.node.property).name
  const styledComponent = styledComponents[className]
  const jsxElement: any = path.parentPath.parentPath.parent
  const elementType = jsxElement.name.name

  if (
    styledComponent.elementType &&
    styledComponent.elementType !== elementType
  ) {
    throw new Error(
      `Class '${className}' used on elements with different types: ${styledComponent.elementType} and ${elementType}`
    )
  }

  removeNode(output, path.parentPath.parentPath.node, false)

  const classNameLikeComponentName =
    jsxElement.name.name === styledComponent.componentName
  if (classNameLikeComponentName) {
    styledComponent.componentName = 'Styled' + styledComponent.componentName
  }

  const fullJsxElement = path.parentPath.parentPath.parentPath.parent

  if (!isJSXElement(fullJsxElement)) return
  if (!isJSXIdentifier(fullJsxElement.openingElement.name)) return

  replaceNode(
    output,
    fullJsxElement.openingElement.name,
    styledComponent.componentName
  )

  if (fullJsxElement.closingElement) {
    if (!isJSXIdentifier(fullJsxElement.closingElement.name)) return

    replaceNode(
      output,
      fullJsxElement.closingElement.name,
      styledComponent.componentName
    )
  }

  styledComponent.elementType = elementType
}
