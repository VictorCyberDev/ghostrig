import {defineConfig} from 'vite';
import path from 'node:path';
export default defineConfig({server:{fs:{allow:[path.resolve(process.cwd(),'../../')]}},build:{target:'es2022'}});
