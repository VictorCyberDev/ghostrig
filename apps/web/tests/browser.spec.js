import {test,expect} from '@playwright/test';

test('host-only provenance visible and replay data can be inspected',async({page})=>{
 await page.goto('/');
 await expect(page.getByText('HOST MODEL TEST',{exact:false}).first()).toBeVisible();
 await expect(page.getByText('NOT QNX',{exact:false}).first()).toBeVisible();
 await expect(page.getByText('Autonomous navigation lab')).toBeVisible();
 await expect(page.getByRole('button',{name:'Inspect outcome'})).toBeVisible();
 await page.getByRole('button',{name:'Inspect outcome'}).click();
 await expect(page.getByText('FAIL — COLLISION')).toBeVisible();
 await expect(page.getByText('Collision',{exact:false}).first()).toBeVisible();
 await page.getByRole('button',{name:/Guarded logic/}).click();
 await expect(page.getByText('PASS — NO COLLISION')).toBeVisible();
});

test('accessible textual fallback is functional',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'2D text view'}).click();
 await expect(page.getByText('2D accessible experiment view')).toBeVisible();
 await expect(page.getByText('Robot position:',{exact:false})).toBeVisible();
 await page.getByRole('slider',{name:'Simulation timeline'}).fill('20');
 await expect(page.getByText('Sensor age:',{exact:false})).toBeVisible();
});

test('capture scene evidence; render screenshot cannot prove photorealism',async({page})=>{
 await page.goto('/');
 await expect(page.locator('canvas')).toBeVisible();
 await page.screenshot({path:'test-results/warehouse-desktop.png',fullPage:true,animations:'disabled'});
});
