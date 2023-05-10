const firstTemplateFn = (row, template) => {
  const name = row.name || 'no name';
  const age = row.age || '98';
  const country = row.country || 'Content';
  const whatever = row.whatever || 'whatevaaaa';
  const html = template({ name, age, country, whatever });
  return html;
};

module.exports = firstTemplateFn;
