import {parse, ParserOptions} from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import {readFileSync} from 'fs'
import {camelCase, kebabCase} from 'lodash'
import {
  variableDeclaration,
  variableDeclarator,
  identifier,
  taggedTemplateExpression,
  memberExpression,
  templateLiteral,
  templateElement,
  callExpression,
  isLiteral
} from '@babel/types'

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
console.log('INPUT')
console.log(code)
console.log()

const ast = parse(code, babelOptions)

const styledComponents = {}

traverse(ast, {
  VariableDeclaration: (enter) => {
    // const useStyles = makeStyles((theme: Theme) =>
    if (getVariableDeclarationName(enter.node) !== 'useStyles') return

    const classDefinitions = getClassDefinitions(enter.node)
    for (const property of classDefinitions.properties) {
      const className = property.key.name
      const componentName =
        className[0].toUpperCase() + camelCase(className).slice(1)
      const css = getCssProperties(property.value.properties)
      const needsTheme = css.includes('theme')
      styledComponents[className] = {componentName, css, needsTheme}
    }

    enter.remove()
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
        'Class used on elements with different types, e.g. div and span'
      )
    }
    enter.parentPath.parentPath.remove()

    const fullJsxElement: any = enter.parentPath.parentPath.parentPath.parent
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
        const importName = specifier?.imported?.name
        return !['makeStyles', 'createStyles', 'Theme'].includes(importName)
      })
      if (enter.node.specifiers.length === 0) {
        enter.remove()
      }
    }
  }
})

const output =
  generate(ast).code +
  '\n\n' +
  Object.values(styledComponents).map(generateStyledComponent).join('\n\n')
console.log('OUTPUT')
console.log(output)

/*
Input
```
makeStyles((theme: Theme) => createStyles({...}));
```

Output
```
{...}
```
*/
function getClassDefinitions(node: any) {
  const functionBody: any = node.declarations[0].init
  return functionBody.arguments[0].body.arguments[0] //  e.g. {root: {color: blue}}
}

function getVariableDeclarationName(node) {
  return (<any>node.declarations[0].id)?.name
}

function getCssProperties(cssDefinitions) {
  const output = []
  for (const cssObject of cssDefinitions) {
    const key = cssObject.key.name
    const value = isLiteral(cssObject.value)
      ? cssObject.value.value
      : '${' + generate(cssObject.value).code + '}'
    output.push({key, value})
  }
  return generateStyleBlock(output)
}

// from: https://github.com/Agreon/styco/blob/master/src/util/generateStyledComponent.ts
function generateStyleBlock(properties: Property[]) {
  let stringifiedStyles = properties.map((prop) => {
    return `  ${kebabCase(prop.key)}: ${prop.value}`
  })

  return `\n${stringifiedStyles.join(';\n')};\n`
}

type Property = {key: string; value: string}

function generateStyledComponent({
  componentName,
  css,
  elementType,
  needsTheme
}) {
  const styledFunction =
    elementType[0] !== elementType[0].toLowerCase()
      ? callExpression(identifier('styled'), [identifier(elementType)]) // styled(Button)
      : memberExpression(identifier('styled'), identifier(elementType)) // styled.div

  if (needsTheme) {
    return `const ${componentName} = ${
      generate(styledFunction).code
    }(({theme}) => css\`${css}\``
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
