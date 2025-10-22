import path from 'node:path'
import {promises as fs, readFileSync, existsSync} from 'node:fs'

export type FilePath = string
const INCLUDE_REGEX = /^ *\[{3}\s*([^\s\]\n\r]+(?: +[^\s\]\n\r]+)*)\s*]{3} *$/gm
type Fragment = {content: string, index: number, length: number}


export default async function processIncludes(mdFile: FilePath): Promise<string> {
  if (!mdFile.endsWith('.md')) {
    throw new Error(`Only markdown files are allowed. (${mdFile})`)
  }
  return await includeContent(mdFile)
}

export function processIncludesSync(mdFile: FilePath): string {
  if (!mdFile.endsWith('.md')) {
    throw new Error(`Only markdown files are allowed. (${mdFile})`)
  }
  return includeContentSync(mdFile)
}

async function includeContent(mdFile: FilePath, filesProcessed: FilePath[] = []): Promise<string> {
  const mdContent = await fs.readFile(mdFile, 'utf8')
  const currentDir: FilePath = path.dirname(mdFile)
  const fragments: Fragment[] = []

  for (const match of mdContent.matchAll(INCLUDE_REGEX)) {
    const includePath = match[1].trim()
    validateIncludedFile(includePath)

    const includedFile = path.join(currentDir, includePath)
    if (! await fileExists(includedFile)) {
      throw new Error(`File "${includedFile}" included from ${mdFile} not found.`)
    }
    else if (filesProcessed.includes(includedFile)) {
      throw new Error(`Circular reference between "${includedFile}" and "${mdFile}".`)
    }

    const fragmentContent = await includeContent(includedFile, [...filesProcessed, mdFile])
    fragments.push({content: fragmentContent, index: match.index, length: match[0].length})
  }
  if (fragments.length > 0) {
    return applyFragments(fragments, mdContent)
  }
  return mdContent
}

function includeContentSync(mdFile: FilePath, filesProcessed: FilePath[] = []): string {
  const mdContent = readFileSync(mdFile, 'utf8')
  const currentDir: FilePath = path.dirname(mdFile)
  const fragments: Fragment[] = []

  for (const match of mdContent.matchAll(INCLUDE_REGEX)) {
    const includePath = match[1].trim()
    validateIncludedFile(includePath)

    const includedFile = path.join(currentDir, includePath)
    if (!existsSync(includedFile)) {
      throw new Error(`File "${includedFile}" included from ${mdFile} not found.`)
    }
    else if (filesProcessed.includes(includedFile)) {
      throw new Error(`Circular reference between "${includedFile}" and "${mdFile}".`)
    }

    const fragmentContent = includeContentSync(includedFile, [...filesProcessed, mdFile])
    fragments.push({content: fragmentContent, index: match.index, length: match[0].length})
  }
  if (fragments.length > 0) {
    return applyFragments(fragments, mdContent)
  }
  return mdContent
}

function validateIncludedFile(includePath: string) {
  if (!includePath.endsWith('.md')) {
    throw new Error(`Only markdown files could be included (${includePath})`)
  }
  if (includePath.includes('..')) {
    throw new Error(`File path shouldn't contain '..' elements ${includePath}`)
  }
  if (includePath.includes(':') || includePath.startsWith('/')) {
    throw new Error(`Only relative local paths are allowed. (${includePath})`)
  }
}

function applyFragments(fragments: Fragment[], mdContent: string) {
  let result = mdContent
  for (let i = fragments.length - 1; i >= 0; i--) {
    const {content, index, length} = fragments[i]
    const isEmpty = content === ''
    const [start, end] = [index, index + length]
    const isNewlineAt = (i: number) => result.charAt(i) === '\n'
    const trimAfter = isEmpty && end < result.length && isNewlineAt(end) ? 1 : 0
    const trimBefore = isEmpty && end === result.length && isNewlineAt(start - 1) ? 1 : 0
    const trimMore = isEmpty && start > 0 && end < result.length && isNewlineAt(start - 2) && isNewlineAt(end + 1) ? 1 : 0
    const before = result.slice(0, start - trimBefore - trimMore)
    const after = result.slice(end + trimAfter)
    result = before + trimLastNewline(content) + after
  }
  return result
}

function trimLastNewline(str: string): string {
  return str.endsWith('\n') ? str.substring(0, str.length - 1) : str
}

async function fileExists(filePath: FilePath): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.F_OK)
    return true
  }
  catch (error) {
    return false
  }
}