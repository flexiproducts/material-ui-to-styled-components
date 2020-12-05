import MagicString from 'magic-string'
import {Node} from '@babel/types'

export function removeNode(output: MagicString, node: Node, removeLine = true) {
  const {start, end} = node
  if (start && end) output.remove(start - (removeLine ? 1 : 0), end)
}
