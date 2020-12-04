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
    callExpression,
    templateLiteral,
    templateElement,
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
console.log('input')
console.log(code)
console.log()

const ast = parse(code, babelOptions)

traverse(ast, {
    VariableDeclaration: (enter) => {
        if ((<any>enter.node.declarations[0].id)?.name === 'useStyles') {
            const classDefinitions = getClassDefinitions(enter.node)
            for (const property of classDefinitions.properties) {
                const componentName = capitalize(property.key.name)
                const css = getCssProperties(property.value.properties)
                console.log('output')
                debug(generateStyledComponent(componentName, css))
            }
        }
    },

    enter(path) {
        if (path.isIdentifier({ name: 'useStyles' })) {
            path.node.name = 'mmep';
        }
    }
})

// const output = generate(ast)
// console.log(output.code)


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

function generateStyledComponent(componentName: string, css: string) {
    return variableDeclaration('const', [
        variableDeclarator(identifier(componentName),
            taggedTemplateExpression(
                memberExpression(identifier('styled'), identifier('div')),
                templateLiteral([templateElement({raw: css})], [])
            )),
    ])
}

