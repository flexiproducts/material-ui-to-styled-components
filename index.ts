import { parse, ParserOptions } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from '@babel/generator';
import {readFileSync} from 'fs'

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

const ast = parse(code, babelOptions)

traverse(ast, {
    VariableDeclaration: enter => {
        enter.node.kind = 'const'
    }
})

const output = generate(ast, code)
console.log(output.code)

