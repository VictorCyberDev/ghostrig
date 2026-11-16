import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'tests',timeout:30000,retries:0,fullyParallel:false,
 use:{baseURL:'http://127.0.0.1:4173',...devices['Desktop Chrome'],headless:true},
 webServer:{command:'npm run dev -- --host 127.0.0.1 --port 4173',port:4173,reuseExistingServer:!process.env.CI,timeout:60000},
 reporter:[['list'],['html',{open:'never'}]]
});
