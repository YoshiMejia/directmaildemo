const firstTemplateFn = (row, template) => {
  const name = row.name || 'no name';
  const age = row.age || '98';
  const country = row.country || 'Content';
  const whatever = row.whatever || 'whatevaaaa';
  const html = template({ name, age, country, whatever });
  return html;
};

const secondTemplateFn = (row, template) => {
  const borrower_first_name = row.borrower_first_name || 'NFN';
  const borrower_last_name = row.borrower_last_name || 'NLN';
  const borrower_address_1 = row.borrower_address_1 || 'no address1';
  const borrower_address_2 = row.borrower_address_2 || 'no address2';
  const borrower_city = row.borrower_city || 'no city';
  const borrower_state = row.borrower_state || 'no state';
  const borrower_postal_code = row.borrower_postal_code || 'no zip';
  const branch_address_1 = row.branch_address_1 || 'no branch add1';
  const branch_address_2 = row.branch_address_2 || 'no branch add2';
  const branch_city = row.branch_city || 'no branch city';
  const branch_state = row.branch_state || 'no branch state';
  const branch_postal_code = row.branch_postal_code || 'no branch zip';
  const branch_phone = row.branch_phone || 'no branch phone';
  const loan_available_credit = row.loan_available_credit || 'no credit';
  const loan_current_due_date = row.loan_current_due_date || 'no loan date';
  const loan_total_amount_due = row.loan_total_amount_due || 'nothing due';
  const branch_manager_name = row.branch_manager_name || 'no manager';
  const current_year = row.current_year || 'never';
  const html = template({
    borrower_first_name,
    borrower_last_name,
    borrower_address_1,
    borrower_address_2,
    borrower_city,
    borrower_state,
    borrower_postal_code,
    branch_address_1,
    branch_address_2,
    branch_city,
    branch_state,
    branch_postal_code,
    branch_phone,
    loan_available_credit,
    loan_current_due_date,
    loan_total_amount_due,
    branch_manager_name,
    current_year,
  });
  return html;
};

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
