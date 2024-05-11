import { Command } from 'commander'
import { newProject } from './actions/newProject.action'

export const program = new Command()

// Command to create a new project
program
  .command('new <project-name>')
  .description('Create a new project')
  .requiredOption('-id, --appId <appId>', 'The ID of the app')
  .option('--skip-install', 'Skip package installation')
  .action(newProject)
