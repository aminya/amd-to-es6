import test from 'ava'
import fs from 'fs'
import shell from 'shelljs'
import path from 'path'

function compare (result, output) {
  return result.replace(/\s+/g, '') === output.replace(/\s+/g, '')
}

test('it should be possible to convert a file through cli', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var args = 'test/fixture/cli/single-file/input.js'
  var output = fs.readFileSync(path.join(__dirname, '../../fixture/cli/single-file/output.js'), 'utf8')
  var result = shell.exec(`node ${bin} ${args}`, { silent: true })
  t.truthy(output === result.stdout)
})

test('it should be possible to convert multiple files within a directory', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var src = 'test/fixture/cli/multiple-files/inputs'
  var glob = '*.js'
  var dest = 'test/fixture/cli/multiple-files/outputs'
  var args = `--src=${src} --glob=${glob} --dest=${dest}`
  shell.exec(`node ${bin} ${args}`, { silent: true })
  var input1 = path.join(__dirname, '../../../', dest, 'input1.js')
  var input2 = path.join(__dirname, '../../../', dest, 'input2.js')
  var output1 = path.join(__dirname, '../../../', dest, 'output1.js')
  var output2 = path.join(__dirname, '../../../', dest, 'output2.js')
  var content1 = fs.readFileSync(input1, 'utf8')
  var content2 = fs.readFileSync(input2, 'utf8')
  var result1 = fs.readFileSync(output1, 'utf8')
  var result2 = fs.readFileSync(output2, 'utf8')
  t.truthy(content1 === result1)
  t.truthy(content2 === result2)
  fs.unlinkSync(input1)
  fs.unlinkSync(input2)
})

test('it should be possible to convert multiple files recursively using the glob option', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var src = 'test/fixture/cli/multiple-files-recursive/inputs'
  var glob = '**/*.js'
  var dest = 'test/fixture/cli/multiple-files-recursive/outputs'
  var args = `--src=${src} --glob=${glob} --dest=${dest}`
  shell.exec(`node ${bin} ${args}`, { silent: true })
  var input1 = path.join(__dirname, '../../../', dest, 'input1.js')
  var input2 = path.join(__dirname, '../../../', dest, 'dir/input2.js')
  var output1 = path.join(__dirname, '../../../', dest, 'output1.js')
  var output2 = path.join(__dirname, '../../../', dest, 'dir/output2.js')
  var content1 = fs.readFileSync(input1, 'utf8')
  var content2 = fs.readFileSync(input2, 'utf8')
  var result1 = fs.readFileSync(output1, 'utf8')
  var result2 = fs.readFileSync(output2, 'utf8')
  t.truthy(content1 === result1)
  t.truthy(content2 === result2)
  fs.unlinkSync(input1)
  fs.unlinkSync(input2)
})

test('it should be possible to convert multiple files recursively using the recursive option', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var src = 'test/fixture/cli/multiple-files-recursive/inputs'
  var dest = 'test/fixture/cli/multiple-files-recursive/outputs'
  var args = `--src=${src} --dest=${dest} --recursive`
  shell.exec(`node ${bin} ${args}`, { silent: true })
  var input1 = path.join(__dirname, '../../../', dest, 'input1.js')
  var input2 = path.join(__dirname, '../../../', dest, 'dir/input2.js')
  var output1 = path.join(__dirname, '../../../', dest, 'output1.js')
  var output2 = path.join(__dirname, '../../../', dest, 'dir/output2.js')
  var content1 = fs.readFileSync(input1, 'utf8')
  var content2 = fs.readFileSync(input2, 'utf8')
  var result1 = fs.readFileSync(output1, 'utf8')
  var result2 = fs.readFileSync(output2, 'utf8')
  t.truthy(content1 === result1)
  t.truthy(content2 === result2)
  fs.unlinkSync(input1)
  fs.unlinkSync(input2)
})

test('should be possible to replace given file with a compiled one', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var content = 'define(function () { return 123; });'
  var src = 'test/fixture/cli/input.js'
  var filepath = path.join(__dirname, '../../../', src)
  fs.writeFileSync(filepath, content)
  shell.exec(`node ${bin} ${src} --replace`, { silent: true })
  var output = fs.readFileSync(filepath, 'utf8')
  t.truthy(output === 'export default 123;')
  fs.unlinkSync(filepath)
})

test('should be possible to replace given files within a directory', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var dir = 'test/fixture/cli/replace-files'
  var dirpath = path.join(__dirname, '../../../', dir)
  fs.mkdirSync(dirpath)
  var content = 'define(function () { return 712; });'
  var src = 'test/fixture/cli/replace-files/input.js'
  var filepath = path.join(__dirname, '../../../', src)
  fs.writeFileSync(filepath, content)
  var result = shell.exec(`node ${bin} --src=${dirpath} --replace`, { silent: true })
  var output = fs.readFileSync(filepath, 'utf8')
  t.truthy(result.code === 0)
  t.truthy(output === 'export default 712;')
  fs.unlinkSync(filepath)
  fs.rmdirSync(dirpath)
})

test("should be possible to convert a single file and change it's suffix", t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var src = 'test/fixture/cli/input-replace-suffix/input.js'
  var filepath = path.join(__dirname, '../../../', src)
  var result = shell.exec(`node ${bin} ${src} --replace --suffix=es6`, { silent: true })
  var destpath = filepath.replace(/\.js$/, '.es6')
  var output = fs.readFileSync(destpath, 'utf8')
  fs.unlinkSync(destpath)
  fs.writeFileSync(filepath, 'define(function () { return 142; });')
  t.truthy(result.code === 0)
  t.truthy(output === 'export default 142;')
})

test('should be possible to convert multiple files and change their suffix', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var dir = 'test/fixture/cli/replace-suffix-files'
  var dirpath = path.join(__dirname, '../../../', dir)
  var src = 'test/fixture/cli/replace-suffix-files/input.js'
  var filepath = path.join(__dirname, '../../../', src)
  var result = shell.exec(`node ${bin} --src=${dirpath} --replace --suffix=es6`, { silent: true })
  var destpath = filepath.replace(/\.js$/, '.es6')
  var output = fs.readFileSync(destpath, 'utf8')
  fs.writeFileSync(filepath, 'define(function () { return 617; });')
  t.truthy(result.code === 0)
  t.truthy(output === 'export default 617;')
  fs.unlinkSync(destpath)
})

test('should be possible to beautify the output', t => {
  function replaceNewlines (str) {
    return str.replace(/(\W)/g, '')
  }
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var args = 'test/fixture/cli/beautify-file/input.js'
  var output = fs.readFileSync(path.join(__dirname, '../../fixture/cli/beautify-file/output.js'), 'utf8')
  var result = shell.exec(`node ${bin} --beautify ${args}`, { silent: true })
  t.truthy(replaceNewlines(output) === replaceNewlines(result.stdout))
})

test('should be possible to import side effects with names', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var args = 'test/fixture/cli/named-side-effects/input.js'
  var output = fs.readFileSync(path.join(__dirname, '../../fixture/cli/named-side-effects/output.js'), 'utf8')
  var result = shell.exec(`node ${bin} --side ${args}`, { silent: true })
  t.truthy(compare(output, result.stdout))
})

test('should be possible to import side effects with assigned names', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var args = 'test/fixture/cli/named-assigned-side-effects/input.js'
  var output = fs.readFileSync(path.join(__dirname, '../../fixture/cli/named-assigned-side-effects/output.js'), 'utf8')
  var result = shell.exec(`node ${bin} --side --assigned ${args}`, { silent: true })
  t.truthy(compare(output, result.stdout))
})

test('should be possible to generate code with double quotes', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var args = 'test/fixture/cli/double-quotes/input.js'
  var output = fs.readFileSync(path.join(__dirname, '../../fixture/cli/double-quotes/output.js'), 'utf8')
  var result = shell.exec(`node ${bin} --quotes=double ${args}`, { silent: true })
  t.truthy(compare(output, result.stdout))
})

test('it should throw an error if dest is not provided', t => {
  var bin = path.join(__dirname, '../../../bin/cli.js')
  var result = shell.exec(`node ${bin} --src=hello`, { silent: true })
  t.truthy(result.code === 1)
})
