import {NodePath} from '@babel/traverse'
import {isJSXElement, isJSXIdentifier, MemberExpression} from '@babel/types'
import {StyledComponentByClass} from './handleUseStylesDefinition'

export default function handleClassesUsage(
  path: NodePath<MemberExpression>,
  styledComponents: StyledComponentByClass
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
  path.parentPath.parentPath.remove()

  const classNameLikeComponentName =
    jsxElement.name.name === styledComponent.componentName
  if (classNameLikeComponentName) {
    styledComponent.componentName = 'Styled' + styledComponent.componentName
  }

  const fullJsxElement = path.parentPath.parentPath.parentPath.parent
  if (!isJSXElement(fullJsxElement)) return
  if (!isJSXIdentifier(fullJsxElement.openingElement.name)) return

  fullJsxElement.openingElement.name.name = styledComponent.componentName
  if (fullJsxElement.closingElement) {
    if (!isJSXIdentifier(fullJsxElement.closingElement.name)) return
    fullJsxElement.closingElement.name.name = styledComponent.componentName
  }

  jsxElement.name.name = styledComponent.componentName
  styledComponent.elementType = elementType
}
