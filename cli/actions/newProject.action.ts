import path from 'path'
import chalk from 'chalk'
import { FileCreator } from '../services/fileCreator.service'
import PackageInstaller from '../services/packageInstaller.service'

interface Options { 
  appId: string;
  secretKey: string;
  database: string;
  skipInstall?: boolean;
}

/**
 * Create a new project with the given name.
 * @param projectName The name of the project to create.
 * @param options The command options containing the app ID.
 */
export async function newProject (projectName: string, options: Options): Promise<void> {
  const appId = options.appId?.trim()
  const secretKey = options.secretKey?.trim()
  const database = options.database?.trim()
  const projectDir = projectName === '.' ? process.cwd() : path.join(process.cwd(), projectName);

  try {
    // Create project files
    const fileCreator = new FileCreator(appId, projectDir)
    fileCreator.createProject({
      projectName,
      appId,
      secretKey,
      database,
    })

    if (options.skipInstall) {
      // Skip package installation
      console.log(chalk.yellow('Skipping package installation'))
    } else {
      // Install packages
      const packageInstaller = new PackageInstaller('npm', projectDir)
      packageInstaller.installPackages()
    }

    // Show success message
    console.log('\n')
    console.log(`🚀 Project ${chalk.green(projectName)} created!`)
    console.log('👉 Start the project with these commands:\n')
    console.log(chalk.grey(`   cd ${projectName}`))
    console.log(chalk.grey('   npm start'))
    console.log('\n')
  } catch (error) {
    console.error(chalk.red('Error creating project:', error))
  }
}
