import path from 'path';
import fs from 'fs-extra';
import { AppConfig } from '../models/config.model';

interface CreateFilesOptions {
  projectName: string;
  appId: string;
}

interface PackageJsonOptions {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  license?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface KottsterAppJsonOptions {
  appId: string;  
}

interface EnvOptions {
  PORT: string;
}

/**
 * Service for creating files for a new project.
 */
export class FileCreator {
  constructor(
    private readonly APP_ID: string,
    private readonly PROJECT_DIR: string
  ) {}

  private readonly KOTTSTER_APP_VERSION = '1.0.0';
  private readonly DEFAULT_PORT = '3864';

  public async createProject(options: CreateFilesOptions): Promise<void> {
    // Check if project directory already exists
    if (fs.existsSync(this.PROJECT_DIR)) {
      throw new Error(`Project directory already exists: ${this.PROJECT_DIR}`);
    };

    // Create project directory
    await this.createDir();

    // Create root files
    await this.createPackageJson({ name: options.projectName });
    await this.createKottsterAppJson({ appId: options.appId });
    await this.createEnv({ PORT: this.DEFAULT_PORT });
    await this.createGitIgnore();

    // Create src directory
    await this.createDir(`src`);

    // Create src/* files
    await this.createAppJs();
    await this.createMainJs();
  }

  /**
   * Create a directory
   */
  async createDir(dirName?: string): Promise<void> {
    if (!dirName) {
      await fs.ensureDir(this.PROJECT_DIR);
      console.log(`Created: ${this.PROJECT_DIR}`);
    } else {
      const dirPath = path.join(this.PROJECT_DIR, dirName);
      fs.ensureDir(dirPath);
      console.log(`Created: ${dirPath}`);
    }
  }

  /**
   * Create a package.json file
   */
  private async createPackageJson(options: PackageJsonOptions): Promise<void> {
    const packageJsonPath = path.join(this.PROJECT_DIR, 'package.json');

    const packageJson = {
      name: options.name,
      type: 'module',
      version: options.version || '1.0.0',
      description: options.description || '',
      author: options.author || '',
      license: options.license || 'MIT',
      scripts: {
        'start:prod': 'node --experimental-specifier-resolution=node src/main.js',
        'start:dev': 'nodemon --experimental-specifier-resolution=node src/main.js',
      },
      dependencies: options.dependencies || {
        '@kottster/backend': 'file:../@kottster-backend',
        // '@kottster/backend': '^1.0.0',
      },
      devDependencies: options.devDependencies || {
        nodemon: '^3',
      },
    };

    try {
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      console.log(`Created: ${packageJsonPath}`);
    } catch (error) {
      console.error('Error creating package.json file:', error);
    }
  }

  /**
   * Create a kottster-app.json file
   */
  private async createKottsterAppJson(options: KottsterAppJsonOptions): Promise<void> {
    const kottsterAppJsonPath = path.join(this.PROJECT_DIR, 'kottster-app.json');

    const kottsterAppJson: AppConfig = {
      appId: options.appId,
      version: this.KOTTSTER_APP_VERSION,
      dataSource: null,
    };

    try {
      await fs.writeJson(kottsterAppJsonPath, kottsterAppJson, { spaces: 2 });
      console.log(`Created: ${kottsterAppJsonPath}`);
    } catch (error) {
      console.error('Error creating kottster-app.json file:', error);
    }
  }

  /**
   * Create a .env file
   */
  private async createEnv(options: EnvOptions): Promise<void> {
    const envPath = path.join(this.PROJECT_DIR, '.env');

    const env = {
      PORT: options.PORT,
    };

    try {
      await fs.writeFile(envPath, Object.entries(env).map(([key, value]) => `${key}=${value}`).join('\n'));
      console.log(`Created: ${envPath}`);
    } catch (error) {
      console.error('Error creating .env file:', error);
    }
  }

  /**
   * Create a .gitignore file
   */
  private async createGitIgnore(): Promise<void> {
    const gitIgnorePath = path.join(this.PROJECT_DIR, '.gitignore');
    const gitIgnoreContent = `node_modules\nbuild\nnpm-debug.log\n.env\n.DS_Store`;

    try {
      fs.writeFile(gitIgnorePath, gitIgnoreContent);
      console.log(`Created: ${gitIgnorePath}`);
    } catch (error) {
      console.error('Error creating .gitignore file:', error);
    }
  }

  /**
   * Create a src/app.js file
   */
  public async createAppJs(): Promise<void> {
    const mainJsPath = path.join(this.PROJECT_DIR, 'src', 'app.js');
    const mainJsContent = `import { KottsterApp } from "@kottster/backend";\n\nconst app = KottsterApp.create({\n  appId: '${this.APP_ID}',\n  envFilePath: '.env',\n});\n\nexport default app;`;

    try {
      fs.writeFile(mainJsPath, mainJsContent);
      console.log(`Created: ${mainJsPath}`);
    } catch (error) {
      console.error('Error creating src/app.js file:', error);
    }
  }

  /**
   * Create a src/main.js file
   */
  public async createMainJs(): Promise<void> {
    const mainJsPath = path.join(this.PROJECT_DIR, 'src', 'main.js');
    const mainJsContent = `import app from './app';\n\napp.start();`;

    try {
      fs.writeFile(mainJsPath, mainJsContent);
      console.log(`Created: ${mainJsPath}`);
    } catch (error) {
      console.error('Error creating src/main.js file:', error);
    }
  }
}