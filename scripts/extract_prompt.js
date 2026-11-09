const fs = require('fs');
const readline = require('readline');

async function getStep2012() {
  const fileStream = fs.createReadStream('C:\\Users\\dhars\\.gemini\\antigravity\\brain\\50548ce6-a4fc-41bc-9612-22fe30e06881\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream });

  for await (const line of rl) {
    if (line.includes('"step_index":2012') || line.includes('"step_index": 2012')) {
      const obj = JSON.parse(line);
      fs.writeFileSync('C:\\Users\\dhars\\OneDrive\\Desktop\\Projects\\AUDITMIND\\docs\\original_user_prompt.txt', obj.content);
      console.log('Saved prompt, length:', obj.content.length);
      break;
    }
  }
}
getStep2012();
