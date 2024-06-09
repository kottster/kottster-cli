import { execSync } from 'child_process'

type PackageManager = 'npm' | 'yarn'

/**
 * Service to installing packages for a new project.
*/
class PackageInstaller {
  constructor (
    private readonly PACKAGE_MANAGER: PackageManager,
    private readonly PROJECT_DIR: string
  ) {}

  /**
   * Install the given packages.
   */
  installPackages (): void {
    const command = this.getInstallCommand()

    try {
      console.log('Installing packages...')
      execSync(command, { cwd: this.PROJECT_DIR, stdio: 'ignore' });
      console.log('Packages installed successfully.')
    } catch (error) {
      console.error('Error installing packages:', error)
    }
  }

  private getInstallCommand (): string {
    switch (this.PACKAGE_MANAGER) {
      case 'npm':
        return 'npm install'
      case 'yarn':
        return 'yarn install'
      default:
        throw new Error('Unsupported package manager')
    }
  }
}

export default PackageInstaller
