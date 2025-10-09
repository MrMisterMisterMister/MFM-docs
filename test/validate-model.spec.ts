import { test, expect } from 'vitest'
import { execSync } from 'child_process'
import { join } from 'path'

test('model should be valid', async () => {
  // Use the LikeC4 CLI to validate the model
  try {
    const result = execSync('npx likec4 validate src/likec4', {
      encoding: 'utf8',
      cwd: process.cwd()
    })
    
    // If no error was thrown, validation passed
    expect(result).toBeDefined()
  } catch (error) {
    // If there's an error, the test should fail with the validation output
    throw new Error(`Model validation failed: ${error instanceof Error ? error.message : String(error)}`)
  }
})

test('model files exist', () => {
  const fs = require('fs')
  const path = require('path')
  
  // Check that the model file exists
  const modelPath = path.join(process.cwd(), 'src/likec4/model.c4')
  expect(fs.existsSync(modelPath)).toBe(true)
  
  // Check that the config file exists
  const configPath = path.join(process.cwd(), 'likec4.config.ts')
  expect(fs.existsSync(configPath)).toBe(true)
})