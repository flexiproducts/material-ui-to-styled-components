import { parse, ParserOptions } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from '@babel/generator';
import {readFileSync} from 'fs'
import {capitalize, kebabCase} from 'lodash'
import {
    variableDeclaration,
    variableDeclarator,
    identifier,
    taggedTemplateExpression,
    memberExpression,   
    templateLiteral,
    templateElement,
    jsxElement,
    callExpression,
  } from "@babel/types";

const babelOptions: ParserOptions = {
    sourceType: "module",
    plugins: [
      "jsx",
      "typescript",
      ["decorators", { decoratorsBeforeExport: true }],
      "classProperties",
      "optionalChaining",
      "nullishCoalescingOperator",
    ],
  };


const code = readFileSync('./fixtures/before.js', 'utf-8')
console.log('INPUT')
console.log(code)
console.log()

const ast = parse(code, babelOptions)

const styledComponents = {}

traverse(ast, {
    VariableDeclaration: (enter) => {
        if (getVariableDeclarationName(enter.node) !== 'useStyles') return

        const classDefinitions = getClassDefinitions(enter.node)
        for (const property of classDefinitions.properties) {
            const className = property.key.name
            const componentName = capitalize(className)
            const css = getCssProperties(property.value.properties)
            styledComponents[className] = {componentName, css}
        }

        enter.remove()
    },

    MemberExpression: (enter) => {
        // assuming useStyled creation happened before
        if ((<any>enter.node.object).name !== 'classes') return
        
        const className = (<any> enter.node.property).name
        const styledComponent = styledComponents[className]
        const jsxElement: any = enter.parentPath.parentPath.parent
        const elementType = jsxElement.name.name

        if (styledComponent.elementType  && styledComponent.elementType  !== elementType) {
            throw new Error('Class used on elements with different types, e.g. div and span')
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
        if (enter.node.callee?.name === 'useStyles') {
            enter.parentPath.parentPath.remove()
        }
    }
})


const output = generate(ast).code + '\n\n' + Object.values(styledComponents).map(generateStyledComponent).join('\n\n')
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

function debug(ast) {
    console.log(generate(ast).code)
}


function getCssProperties(cssDefinitions) {
    const output = []
    for (const cssObject of cssDefinitions) {
        const key = cssObject.key.name
        const value = cssObject.value.value
        output.push({key, value})
    }
    return generateStyleBlock(output)
}



// from: https://github.com/Agreon/styco/blob/master/src/util/generateStyledComponent.ts
function generateStyleBlock (properties: Property[]) {
    let stringifiedStyles = properties.map(prop => {
      return `  ${kebabCase(prop.key)}: ${prop.value}`;
    });
  
    return `\n${stringifiedStyles.join(";\n")};\n`;
  }


type Property = { key: string; value: string };

function generateStyledComponent({componentName, css, elementType}) {
    return generate(variableDeclaration('const', [
        variableDeclarator(identifier(componentName),
            taggedTemplateExpression(
                elementType[0] !== elementType[0].toLowerCase() ? 
                    callExpression(identifier('styled'), [identifier(elementType)]) :
                    memberExpression(identifier('styled'), identifier(elementType)),
                templateLiteral([templateElement({raw: css})], [])
            )),
    ])).code
}


