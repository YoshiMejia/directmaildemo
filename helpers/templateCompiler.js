const firstTemplateFn = require('./compiler_functions/firstTemplateFn');
const secondTemplateFn = require('./compiler_functions/secondTemplateFn');

const templateCompiler = (selectedTemplate, row, template) => {
  switch (selectedTemplate) {
    case 'template1':
      return firstTemplateFn(row, template);
    case 'template2':
      return secondTemplateFn(row, template);
    default:
      console.log('no template selected');
  }
};

module.exports = templateCompiler;
