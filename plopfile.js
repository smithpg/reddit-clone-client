const capitalize = (originalString) =>
  originalString.charAt(0).toUpperCase() + originalString.slice(1);

function renderCurrentTime() {
  return Date();
}

const toPascalCase = (string) => {
  return string.split(' ').map(capitalize).join('');
};

const helpers = {
  capitalize,
  renderCurrentTime,
  asReactComponent: toPascalCase,
  asHook: (string) => {
    return `use${toPascalCase(string)}`;
  },
};

module.exports = function (plop) {
  for (let key in helpers) {
    plop.setHelper(key, helpers[key]);
  }

  // component generator
  plop.setGenerator('component', {
    description: 'React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'component name please',
      },
    ],
    actions: [
      {
        type: 'add',
        path:
          'components/{{asReactComponent name}}/{{asReactComponent name}}.tsx',
        templateFile: 'plop-templates/component.hbs',
      },
      {
        type: 'add',
        path:
          'components/{{asReactComponent name}}/{{asReactComponent name}}.stories.js',
        templateFile: 'plop-templates/component.story.hbs',
      },
      {
        type: 'add',
        path:
          'components/{{asReactComponent name}}/{{asReactComponent name}}.test.js',
        templateFile: 'plop-templates/component.test.hbs',
      },
      function writeToLog(answers) {
        // move the current working directory to the plop file path
        // this allows this action to work even when the generator is
        // executed from inside a subdirectory
        process.chdir(plop.getPlopfilePath());

        // custom function can be synchronous or async (by returning a promise)
        const path = require('path');
        const fs = require('fs');

        // you can use plop.renderString to render templates
        let logMsg =
          'Created component {{asReactComponent name}} | {{renderCurrentTime}}\n';
        logMsg = plop.renderString(logMsg, answers);

        const logFileName = 'plop.log.txt';
        const logFilePath = path.join(plop.getDestBasePath(), logFileName);

        // Write or append to log file
        const writeConfig = { flag: 'w' };
        if (fs.existsSync(logFilePath)) {
          writeConfig.flag = 'a';
        }
        fs.writeFileSync(logFilePath, logMsg, writeConfig);
      },
    ],
  });

  // page generator
  plop.setGenerator('page', {
    description: 'Next page',

    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'page name please',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'pages/{{asReactComponent name}}.tsx',
        templateFile: 'plop-templates/component.hbs',
      },
    ],
  });

  // hook generator
  plop.setGenerator('hook', {
    description: 'React hook',

    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Fill in the blank: use____',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'hooks/{{asHook name}}.ts',
        templateFile: 'plop-templates/hook.hbs',
      },
      function addExportToIndexFile(answers) {
        // move the current working directory to the plop file path
        // this allows this action to work even when the generator is
        // executed from inside a subdirectory
        process.chdir(plop.getPlopfilePath());

        const path = require('path');
        const fs = require('fs');

        // #1. Build the new line that will be added to hooks/index.js
        const exportLineTemplate =
          "export { default as {{asHook name}} } from './{{asHook name}}';";
        const exportLine = plop.renderString(exportLineTemplate, answers);

        // #2. Construct the appropriate path...
        const targetFilePathFromProjectRoot = '/hooks/index.js';
        const targetFileAbsolutePath = path.join(
          plop.getDestBasePath(),
          targetFilePathFromProjectRoot
        );

        // #3. Append to hooks/index.js
        const writeConfig = { flag: 'a' };
        if (!fs.existsSync(targetFileAbsolutePath)) {
          throw new Error('Could not find ~/hooks/index.js');
        }
        fs.writeFileSync(targetFileAbsolutePath, exportLine, writeConfig);
      },
    ],
  });
};
