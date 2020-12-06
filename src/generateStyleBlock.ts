import generate from '@babel/generator'
import {isLiteral, isTemplateLiteral} from '@babel/types'
import {kebabCase} from 'lodash'

export default function generateStyleBlock(cssDefinitions) {
  const output: {key: string; value: string}[] = []
  for (const cssObject of cssDefinitions) {
    const key = cssObject.key.name

    let value: string

    if (isTemplateLiteral(cssObject.value)) {
      value = generate(cssObject.value).code.slice(1, -1)
    } else if (isLiteral(cssObject.value)) {
      value = cssObject.value.value
    } else {
      value = '${' + generate(cssObject.value).code + '}'
    }

    output.push({key, value})
  }
  return genereteCssProperties(output)
}

function genereteCssProperties(properties: Property[]) {
  let stringifiedStyles = properties.map((prop) => {
    return `  ${kebabCase(prop.key)}: ${prop.value}`
  })

  return `\n${stringifiedStyles.join(';\n')};\n`
}

type Property = {key: string; value: string}
