import generate from '@babel/generator'
import {isLiteral} from '@babel/types'
import {kebabCase} from 'lodash'

export default function genereateStyleBlock(cssDefinitions) {
  const output = []
  for (const cssObject of cssDefinitions) {
    const key = cssObject.key.name
    const value = isLiteral(cssObject.value)
      ? cssObject.value.value
      : '${' + generate(cssObject.value).code + '}'
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
