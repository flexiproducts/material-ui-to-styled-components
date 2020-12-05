import {parse, ParserOptions} from '@babel/parser'

export default function (code: string) {
  return parse(code, babelOptions)
}

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
