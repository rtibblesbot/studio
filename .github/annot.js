const r = require('../r.json');
let n = 0;
for (const f of r.testResults) for (const t of f.assertionResults) if (t.status === 'failed') {
  const m = (t.fullName + ' :: ' + t.failureMessages.join(' ')).replace(/\u001b\[[0-9;]*m/g, '').replace(/[\r\n]+/g, ' | ').slice(0, 1500);
  console.log(`::error title=${f.name.split('/').pop()}::${m}`);
  n++;
}
for (const f of r.testResults) if (f.status === 'failed' && !f.assertionResults.some(t => t.status === 'failed'))
  console.log(`::error title=SUITE ${f.name.split('/').pop()}::${(f.message||'').replace(/\u001b\[[0-9;]*m/g,'').replace(/[\r\n]+/g,' | ').slice(0,1500)}`);
console.log('failed', n);
