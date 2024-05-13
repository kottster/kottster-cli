import { Command } from 'commander'
import dotenv from 'dotenv';
import { newProject } from './actions/newProject.action'
import { startProject } from './actions/startProject.action'

// Load environment variables from .env file
dotenv.config();

export const program = new Command()

// Command to start the project
program
  .command('start')
  .description('Start a Kottster server')
  .action(startProject);

// Command to create a new project
program
  .command('new <project-name>')
  .description('Create a new project')
  .requiredOption('-id, --appId <appId>', 'The ID of the app')
  .requiredOption('-sk, --secretKey <secretKey>', 'The secret key of the app')
  .option('--skip-install', 'Skip package installation')
  .action(newProject)
