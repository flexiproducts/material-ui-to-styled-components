import {readFileSync} from 'fs'
import transformCode from './src/transformCode'

const code = readFileSync('./fixtures/before.tsx', 'utf-8')

console.log(transformCode(code))
