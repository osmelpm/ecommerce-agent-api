import * as fs from 'node:fs';
import * as path from 'node:path';

export const loadSeed = (fileName: string) => {
  console.log('dirname', __dirname);
  const filePath = path.resolve(__dirname, `../../../seeds/${fileName}`);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};
