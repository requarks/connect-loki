const colors = require('colors')

expect.extend({
  /**
   * Expect ESLint results to have no errors
   * @param {*} received ESLint results
   * @param {*} argument Arguments
   * @returns {object} Matcher result
   */
  toESLint (received, argument) {
    if (received && received.errorCount > 0) {
      const errorMsgBuf = []
      for (let i = 0; i < received.results.length; i++) {
        const result = received.results[i]
        if (result.errorCount <= 0) {
          continue
        }

        for (let x = 0; x < result.messages.length; x++) {
          const m = result.messages[x]
          errorMsgBuf.push(colors.grey(`└── ${result.filePath}\t${m.line}:${m.column}\t${m.message}`))
        }
      }
      if (errorMsgBuf.length > 0) {
        return {
          message: () => (errorMsgBuf.join('\n')),
          pass: false
        }
      }
    }
    return {
      pass: true
    }
  }
})

describe('Code Linting', () => {
  it('should pass ESLint validation', () => {
    const ESLint = require('eslint').ESLint
    const cli = new ESLint()
    const report = cli.lintFiles(['**/*.js'])
    expect(report).toESLint()
  })
})
