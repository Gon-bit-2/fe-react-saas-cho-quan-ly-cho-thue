const fs = require('fs');
const d = JSON.parse(fs.readFileSync('C:/Users/vanth/.gemini/antigravity-ide/brain/cb213aca-902c-4bd6-99a0-1b8df2b6514e/.system_generated/steps/7/output.txt', 'utf8'));
d.screens.filter(s => s.title && s.title.includes('W20')).forEach(s => console.log(s.title + ' : ' + s.name));
