const {test,expect}=require('@playwright/test');
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 test('studio navigation and layout '+viewport.width,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('http://127.0.0.1:8765/index.html');
  await expect(page).toHaveTitle('Christmas Control Center');
  await expect(page.locator('h1')).toHaveAttribute('aria-label','Christmas Control Center');
  await expect(page.locator('#control-page')).toBeVisible();
  await expect(page.locator('#tests-page')).toBeHidden();
  for(const id of ['settings','network','tests','control']){
   await page.locator('#nav-'+id).click();
   await expect(page.locator('#'+id+'-page')).toBeVisible();
   await expect(page.locator('#nav-'+id)).toHaveAttribute('aria-current','page');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  }
  await page.locator('#nav-settings').click();
  for(const lang of ['en','es','de','nl']) await page.locator('#language').selectOption(lang);
  await page.locator('#nav-control').click();
  await page.screenshot({path:'test-results/studio-'+viewport.width+'.png',fullPage:true,animations:'disabled'});
 });
}

test('spatial test shows the specific Join conflict', async ({page})=>{
 const id='native:wall-uid';
 const error='Join offset is missing for Muur 3. Refresh discovery and check the group mapping in Twinkly.';
 await page.route('**/status', route=>route.fulfill({json:{
  display_groups:{[id]:{name:'Muur2026',members:[],mode:'join',missing_master:id}}, devices:[]
 }}));
 await page.route('**/physical-test', async route=>{
  expect(route.request().postDataJSON()).toEqual({group:id,test:'rainbow'});
  await route.fulfill({status:409,json:{error}});
 });
 await page.goto('http://127.0.0.1:8765/index.html#testcontrole');
 const rainbow=page.locator('#tests-content article').filter({hasText:'Regenboog'});
 await rainbow.getByRole('button').click();
 await expect(page.locator('#message')).toHaveText('HTTP 409 · '+error);
});
