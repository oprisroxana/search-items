async function test (req, res, next) {
  console.log('req')
  res.json({data: 'testing the new project'});
}

module.exports = test;