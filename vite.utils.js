import { readdirSync } from 'fs'
import { extname, resolve } from 'path'

export const scanPath = (path) => readdirSync(path)

export const getExt = (filename) => {
  const pattern = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi
  return (filename.match(pattern) || [])[0]
}

export const getObjectEntries = (entries, src, context) => {
  return entries.reduce((acc, entry) => {
    const isFile = Boolean(extname(entry))
    const ext = getExt(entry)

    if (isFile && ext !== '.html') {
      return acc
    }

    const entryObject = {
      ext,
      isFile,
      context,
      src: `${src}/${entry}`,
      name: entry.replace(ext, ''),
    }

    return isFile
      ? [...acc, entryObject]
      : [...acc, ...getObjectEntries(scanPath(entryObject.src), entryObject.src, entryObject.name)]
  }, [])
}

export const configureInputs = (path, context) => {
  const src = `${path}/${context}`
  const entries = scanPath(src)
  const inputs = getObjectEntries(entries, src, context)

  return inputs.reduce((config, input) => {
    return {
      ...config,
      [input.name === 'index' ? input.context : input.name]: resolve(input.src),
    }
  }, {})
}
