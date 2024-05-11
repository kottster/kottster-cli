import fs from 'fs-extra';
import mock from 'mock-fs'
import { newProject } from '../../cli/actions/newProject.action'

const writeFileSpy = jest.spyOn(fs, 'writeFile');

describe('CLI integration test', () => {
  const projectDir = `${process.cwd()}/foo`;
  
  beforeEach(() => {
    mock({});
  });
  
  afterEach(() => {
    mock.restore();
  });

  it('kottster new <project-name>', async () => {
    await newProject('foo', { appId: 'bar', skipInstall: true });

    expect(writeFileSpy).toHaveBeenCalledTimes(7);
    expect(writeFileSpy).toHaveBeenCalledWith(`${projectDir}/package.json`, expect.any(String));
    expect(writeFileSpy).toHaveBeenCalledWith(`${projectDir}/kottster-app.json`, JSON.stringify({ appId: 'bar' }, null, 2));
    expect(writeFileSpy).toHaveBeenCalledWith(`${projectDir}/.env`, expect.any(String));
    expect(writeFileSpy).toHaveBeenCalledWith(`${projectDir}/.gitignore`, expect.any(String));
    expect(writeFileSpy).toHaveBeenCalledWith(`${projectDir}/src/main.js`, expect.any(String));
    expect(writeFileSpy).toHaveBeenCalledWith(`${projectDir}/src/dev/app.js`, expect.any(String));
    expect(writeFileSpy).toHaveBeenCalledWith(`${projectDir}/src/prod/app.js`, expect.any(String));
  });
});