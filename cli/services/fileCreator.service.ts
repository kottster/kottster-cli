import path from 'path'
import fs from 'fs'
import { AppConfig } from '../models/config.model'
import { AUTOGENERATED_FILE_HEADER } from '../constants/fileHeaders'

enum Stage {
  development = 'development',
  production = 'production'
}

interface CreateProjectOptions {
  projectName: string
  appId: string
  secretKey: string
}

interface PackageJsonOptions {
  name: string
  version?: string
  description?: string
  author?: string
  license?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

type EnvOptions = {
  key: string;
  comment?: string;
  value: string;
}[];

/**
 * Service for creating files for a new project.
 */
export class FileCreator {
  constructor (
    private readonly APP_ID: string,
    private readonly PROJECT_DIR: string
  ) { }

  public createProject (options: CreateProjectOptions): void {
    // Check if project directory already exists
    if (fs.existsSync(this.PROJECT_DIR)) {
      throw new Error(`Project directory already exists: ${this.PROJECT_DIR}`)
    };

    // Create project directory
    this.createDir()

    // Create root files
    this.createPackageJson({ name: options.projectName })
    this.createEnv([
      {
        key: 'APP_ID',
        comment: 'The ID of the Kottster app',
        value: options.appId,
      },
      {
        key: 'PORT',
        comment: 'Port to run the server on',
        value: '5480',
      },
      {
        key: 'SECRET_KEY',
        comment: 'Private key for obtaining a JWT secret during server startup',
        value: options.secretKey,
      },
    ])
    this.createGitIgnore()
    this.createDir('src')
    this.createMainJs()
    this.createAppJs()
    this.createAdaptersJs()

    // Create files for each stage
    Object.values(Stage).forEach((stage) => {
      // Create src/__generated__/<stage> directory
      this.createDir(`src/__generated__/${stage}`)

      // Create src/__generated__/index.js file
      this.createAutoImportsFile()
    })
  }

  /**
   * Create a package.json file
   */
  private createPackageJson (options: PackageJsonOptions) {
    const packageJsonPath = path.join(this.PROJECT_DIR, 'package.json')

    const packageJson = {
      name: options.name,
      type: 'module',
      version: options.version || '1.0.0',
      description: options.description || '',
      author: options.author || '',
      license: options.license || 'MIT',
      scripts: {
        start: 'kottster start src/main.js'
      },
      dependencies: (options.dependencies != null) || {
        '@kottster/cli': 'file:../@kottster-cli',
        '@kottster/backend': 'file:../@kottster-backend',
        'dotenv': '^1',
      },
      devDependencies: (options.devDependencies != null) || {}
    }
    const packageJsonContent = JSON.stringify(packageJson, null, 2)

    this.writeFile(packageJsonPath, packageJsonContent)
  }

  /**
   * Create a .env file
   */
  private createEnv (options: EnvOptions): void {
    const envPath = path.join(this.PROJECT_DIR, '.env')
    const envContent = options.map(({ key, comment, value }) => {
      return `${comment ? `# ${comment}\n` : ''}${key}=${value}`
    }).join('\n\n') + '\n';

    this.writeFile(envPath, envContent)
  }

  /**
   * Create a .gitignore file
   */
  private createGitIgnore (): void {
    const gitIgnorePath = path.join(this.PROJECT_DIR, '.gitignore')
    const gitIgnoreContent = ['node_modules', 'nbuild', 'npm-debug.log', '.DS_Store'].join('\n')

    this.writeFile(gitIgnorePath, gitIgnoreContent)
  }

  /**
   * Create a src/app.js file
   * @description This file creates the Kottster app for the specified stage
   */
  public createAppJs (): void {
    const appJsPath = path.join(this.PROJECT_DIR, 'src', 'app.js')

    let appJsContent = ''

    // Add imports
    appJsContent += 'import dotenv from \'dotenv\';\n'
    appJsContent += 'import { createApp, getEnvOrThrow } from \'@kottster/backend\';\n\n'

    // Load env vars from .env file
    appJsContent += `dotenv.config({ path: '.env' });\n\n`

    // Create app and export it
    appJsContent += `export const app = createApp({\n  appId: getEnvOrThrow('APP_ID'),\n  secretKey: getEnvOrThrow('SECRET_KEY')\n});\n\n`

    this.writeFile(appJsPath, appJsContent)
  }

  /**
   * Create a src/adapters.js file
   * @description This file is used to create adapters for the app
   */
  public createAdaptersJs (): void {
    const adapterJsPath = path.join(this.PROJECT_DIR, 'src', 'adapters.js')
    const adapterJsContent = 'export default {};\n\n'

    this.writeFile(adapterJsPath, adapterJsContent)
  }

  /**
   * Create a src/main.js file
   * @description This file is the entry point for the application
   */
  public createMainJs (): void {
    const mainJsPath = path.join(this.PROJECT_DIR, 'src', 'main.js')
    let mainJsContent = '';

    // Add imports
    mainJsContent += 'import \'./__generated__\';\n'
    mainJsContent += 'import { app } from \'./app\';\n'
    mainJsContent += 'import adapters from \'./adapters\';\n\n'

    // Set adapters for the app
    mainJsContent += 'app.setAdapters(adapters);\n\n'

    // Create express server and run it
    mainJsContent += 'app.start(5480);\n\n'

    this.writeFile(mainJsPath, mainJsContent)
  }

  /**
   * Create a src/__generated__/index.js file
   * @description This file is used to auto-import all generated files
   */
  public createAutoImportsFile (): void {
    const indexJsPath = path.join(this.PROJECT_DIR, 'src/__generated__', 'index.js')
    const indexJsContent = AUTOGENERATED_FILE_HEADER + 'export {};\n\n'

    this.writeFile(indexJsPath, indexJsContent)
  }

  /**
   * Create a directory
   */
  private createDir (dirName?: string): void {
    // Skip if directory already exists
    if (dirName && fs.existsSync(path.join(this.PROJECT_DIR, dirName))) {
      return;
    }
    
    try {
      if (!dirName) {
        fs.mkdirSync(this.PROJECT_DIR, { recursive: true })
      } else {
        const dirPath = path.join(this.PROJECT_DIR, dirName)
        fs.mkdirSync(dirPath, { recursive: true })
      }
    } catch (error) {
      console.error(`Error creating ${dirName} directory:`, error)
    }
  }

  /**
   * Write content to a file
   */
  private writeFile (filePath: string, content: string): void {
    try {
      fs.writeFileSync(filePath, content)
    } catch (error) {
      console.error(`Error creating ${filePath} file:`, error)
    }
  }
}
