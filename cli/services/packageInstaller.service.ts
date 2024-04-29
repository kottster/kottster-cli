import { exec } from 'child_process';
import { promisify } from 'util';

type PackageManager = 'npm' | 'yarn';

/**
 * Service to installing packages for a new project.
*/
class PackageInstaller {
  constructor(
    private readonly PACKAGE_MANAGER: PackageManager, 
    private readonly PROJECT_DIR: string
  ) {}

  /**
   * Install the given packages.
   */
  async installPackages(): Promise<void> {
    const command = this.getInstallCommand();

    try {
      console.log('Installing packages...');
      const execAsync = promisify(exec);
      await execAsync(command, { cwd: this.PROJECT_DIR });
      console.log('Packages installed successfully.');
    } catch (error) {
      console.error('Error installing packages:', error);
    }
  }

  private getInstallCommand(): string {
    switch (this.PACKAGE_MANAGER) {
      case 'npm':
        return 'npm install';
      case 'yarn':
        return 'yarn install';
      default:
        throw new Error('Unsupported package manager');    }
  }
}

export default PackageInstaller;
