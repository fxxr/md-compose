import {test, expect} from 'vitest'
import processIncludes, {processIncludesSync} from '../src'
import {promises as fs, readFileSync} from 'node:fs'
import * as path from 'node:path'


function testInclude(testCase: string) {
  return async () => {
    const mdFile = path.join(__dirname, `fixtures/${testCase}.md`)
    const result = String(await fs.readFile(path.join(__dirname, `fixtures/${testCase}_result.md`)))
    const processed = await processIncludes(mdFile)
    expect(processed).eq(result)
  }
}

function testIncludeSync(testCase: string) {
  return () => {
    const mdFile = path.join(__dirname, `fixtures/${testCase}.md`)
    const result = String(readFileSync(path.join(__dirname, `fixtures/${testCase}_result.md`)))
    const processed = processIncludesSync(mdFile)
    expect(processed).eq(result)
  }
}

function testIncludeFailure(testCase: string, err: RegExp) {
  return async () => {
    const mdFile = path.join(__dirname, `fixtures/${testCase}.md`)
    await expect(() => processIncludes(mdFile)).rejects.toThrowError(err)
  }
}

test('Basic', testInclude('basic'))
test('Basic Sync', testIncludeSync('basic'))
test('Nested', testInclude('nested'))
test('Nested Sync', testInclude('nested'))
test('Multi', testInclude('multi'))
test('Multi Sync', testIncludeSync('multi'))
test('Deep', testInclude('deep'))
test('Deep Sync', testIncludeSync('deep'))
test('Space in filename', testInclude('filename_with_spaces'))
test('Include empty file', testInclude('include_empty'))
test('Include empty file sequence', testInclude('include_empty_seq'))
test('Circular includes', testIncludeFailure('circular_includes', /Circular reference/))
test('Absolute path', testIncludeFailure('absolute_path', /Only relative local paths are allowed/))
test('Path with colon', testIncludeFailure('path_with_colon', /Only relative local paths are allowed/))
test('Double dot', testIncludeFailure('double_dot', /File path shouldn't contain '\.\.' elements/))
test('Non-md file', testIncludeFailure('non_md_file', /Only markdown files could be included/))
test('Non-existent file', testIncludeFailure('non_existent_file', /File.+not found/))
