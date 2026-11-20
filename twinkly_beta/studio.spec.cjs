const {test,expect}=require('@playwright/test');
if (process.env.TWINKLY_TEST_CHROME) {
 test.use({launchOptions:{executablePath:process.env.TWINKLY_TEST_CHROME}});
}
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 test('studio navigation and layout '+viewport.width,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await expect(page).toHaveTitle('Christmas Control Center');
  await expect(page.locator('h1')).toHaveAttribute('aria-label','Christmas Control Center');
  await expect(page.locator('#lighting-panel')).toBeVisible();
  expect(await page.locator('.workspace-nav a').evaluateAll(links => links.map(link => link.id))).toEqual([
   'nav-home','nav-house','nav-control','nav-hue','nav-govee','nav-tests','nav-network','nav-settings',
  ]);
  await expect(page.getByRole('link',{name:'Twinkly',exact:true}).locator('img')).toHaveAttribute('src','twinkly-nav-logo.svg');
  await expect(page.getByRole('link',{name:'Philips Hue',exact:true}).locator('img')).toHaveAttribute('src','hue-app-icon.webp');
  await expect(page.locator('#nav-hue')).toHaveText('');
  await expect(page.locator('#nav-hue img')).toHaveCSS('filter','url("#hue-white-knockout")');
  expect(await page.locator('#nav-control, #nav-hue, #nav-govee').evaluateAll(links =>
   new Set(links.map(link => link.getBoundingClientRect().height)).size,
  )).toBe(1);
  await expect.poll(() => page.locator('.workspace-nav img').evaluateAll(images =>
   images.filter(image => image.complete && image.naturalWidth > 0).length,
  )).toBe(3);
  await expect(page.locator('#tests-page')).toBeHidden();
  for(const id of ['settings','network','tests','control','house']){
   await page.locator('#nav-'+id).click();
   await expect(page.locator('#'+id+'-page')).toBeVisible();
   await expect(page.locator('#nav-'+id)).toHaveAttribute('aria-current','page');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  }
  const guide = page.locator('.house-guide');
  await expect(guide.getByText('Maak één foto per muur.', {exact:true})).toBeVisible();
  await expect(guide.getByText(/Elke muur bewaart zijn eigen foto en lampplaatsingen/)).toBeVisible();
  await guide.locator('summary').click();
  await expect(guide.locator('ol')).toBeHidden();
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
 await page.goto('http://127.0.0.1:8765/index.html#testcontrole',{waitUntil:'domcontentloaded'});
 const rainbow=page.locator('#tests-content article').filter({hasText:'Regenboog'});
 await rainbow.getByRole('button').click();
 await expect(page.locator('#message')).toHaveText('HTTP 409 · '+error);
});

test('Security Center maps all Hue lights to their own bridge beside Twinkly', async ({page}) => {
 await page.route('**/network', route => route.fulfill({json:{
  devices:[{id:'tree',name:'Tree',ip:'192.168.1.10',kind:'unknown'}], groups:{},
 }}));
 await page.route('**/providers/hue/inventory', route => route.fulfill({json:{devices:[
  {id:'unavailable',address:'192.168.1.21',status:'unavailable',lights:[]},
  {id:'living',address:'192.168.1.22',status:'online',lights:[{id:'one',name:'Hue window'},{id:'two',name:'Hue table',status:'unavailable'}]},
  {id:'hall',address:'192.168.1.23',status:'online',lights:[{id:'one',name:'Hue hall'}]},
 ]}}));
 await page.goto('http://127.0.0.1:8765/index.html#netwerk',{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'Security Center'})).toBeVisible();
 await expect(page.locator('#network-world article')).toHaveCount(7);
 await expect(page.locator('#network-world').getByText('Hue window')).toBeVisible();
 const offlineHue = page.locator('#network-world article').filter({hasText:'Hue table'});
 await expect(offlineHue).toContainText('Offline');
 await expect(page.locator('#network-world').getByText('Hue hall')).toBeVisible();
 const links = await page.evaluate(() => networkLinks.map(([source,target]) => [
  JSON.parse(source.id.slice('device:'.length)), JSON.parse(target.id.slice('device:'.length)),
 ]));
 expect(links).toEqual([
  [['hue','living'],['hue','living','one']], [['hue','living'],['hue','living','two']],
  [['hue','hall'],['hue','hall','one']],
 ]);
 expect(await page.evaluate(() => [...networkNodes.values()].every(node => Number.isFinite(node.y)))).toBe(true);
});

test('Home combines providers and keeps pairing in Settings', async ({page}) => {
 const light = (id, provider, name, rgb, status='online') => ({
  id, provider, name, status, capabilities:{power:provider!=='govee', brightness:rgb, rgb},
  state:{on:true, brightness:rgb?65:null, color:rgb?[255,120,30]:null},
 });
 const groups = {};
 const scenes = {};
 let music={group:null,live:false};
 let groupControl;
 let pairing;
 let temperature;
 await page.route('**/lighting', route => route.fulfill({json:{
  lights:[light('t','twinkly','Tree',true),{...light('h','hue','Living room',false),
   capabilities:{power:true,temperature:true}, temperature_mirek:{min:153,max:500}, state:{on:true,mirek:370}},{...light('g','govee','Strip',false,'unknown'),capabilities:{power:true}}],
  connections:{hue:[{id:'bridge',address:'192.168.1.2',status:'online'}],govee:[]}, groups, scenes, music,
 }}));
 await page.route('**/lighting/groups', route => {
  const {name,members}=route.request().postDataJSON();
  groups.mixed={name,members};
  return route.fulfill({json:{id:'mixed'}});
 });
 await page.route('**/lighting/control', route => {
  const command=route.request().postDataJSON();
  if (command.action==='temperature') {
   temperature=command;
   return route.fulfill({json:{results:{h:'accepted'}}});
  }
  groupControl=command;
  return route.fulfill({json:{results:{t:'accepted',h:'skipped',g:'unconfirmed'}}});
 });
 await page.route('**/lighting/music', route => {
  const {group,stop,level}=route.request().postDataJSON();
  if (level) {
   music.level=level;
   return route.fulfill({json:{...music,results:{h:'accepted'}}});
  }
  music={group:stop?null:group,live:!stop,timings:{hue:{frame_age_ms:40,command_ms:90,failed:0}}};
  return route.fulfill({json:{...music,eligible:['t','h'],skipped:['g']}});
 });
 await page.route('**/lighting/scenes', route => {
  const scene=route.request().postDataJSON();
  expect(scene).toEqual({name:'Kerstavond',group:'mixed',on:true,brightness:45});
  scenes.christmas=scene;
  return route.fulfill({json:{id:'christmas'}});
 });
 await page.route('**/lighting/scenes/christmas/apply', route => route.fulfill({json:{results:{
  t:{power:'accepted',brightness:'accepted'}, h:{power:'accepted',brightness:'skipped'},
 }}}));
 let goveeTest={result:null};
 await page.route('**/lighting/govee-test', route => {
  if (route.request().method()==='POST') {
   const {test,id}=route.request().postDataJSON();
   expect(id).toBe('g');
   goveeTest={result:test==='stop'?'restored':'running'};
  }
  return route.fulfill({json:goveeTest});
 });
 let hueTest={result:null};
 await page.route('**/lighting/hue-test', route => {
  if (route.request().method()==='POST') {
   const {test,id}=route.request().postDataJSON();
   expect(id).toBe('h');
   hueTest={result:test==='stop'?'restore_unverified':'running'};
  }
  return route.fulfill({json:hueTest});
 });
 const fingerprint = 'ab'.repeat(32);
 await page.route('**/providers/hue/certificate', route => {
  expect(route.request().postDataJSON()).toEqual({address:'192.168.1.2'});
  return route.fulfill({json:{certificate_sha256:fingerprint,verified:false}});
 });
 await page.route('**/providers/hue/connect', route => {
  pairing=route.request().postDataJSON();
  return route.fulfill({json:{ok:true}});
 });
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 const home=page.locator('#lighting-panel');
 await expect(home.locator('article')).toHaveCount(3);
 await expect.poll(() => home.locator('.lighting-brand-mark img').evaluateAll(images =>
  images.filter(image => image.complete && image.naturalWidth > 0).length,
 )).toBe(3);
 await expect(home.locator('[data-provider=hue] input[type=color]')).toHaveCount(0);
 const white = home.getByRole('slider',{name:'Wittemperatuur'});
 await expect(white).toHaveValue('370');
 await expect(white).toHaveAttribute('aria-valuetext','2703 K');
 await white.fill('400');
 await expect.poll(() => temperature).toEqual({id:'h',action:'temperature',value:400});
 await expect(home.locator('[data-provider=govee]')).toContainText('onbevestigd');
 await expect(home.locator('[data-provider=govee] button')).toHaveCount(2);
 await expect(page.getByText('Certificaat ophalen')).toHaveCount(0);
 await home.getByLabel('Groepsnaam').fill('Together');
 await home.getByLabel('Tree · Twinkly').check();
 await home.getByLabel('Living room · Philips Hue').check();
 await home.getByLabel('Strip · Govee').check();
 await home.getByRole('button',{name:'Opslaan'}).click();
 const group=home.locator('article').filter({hasText:'Together'});
 await group.getByRole('button',{name:'Aan',exact:true}).click();
 await expect(page.locator('#lighting-feedback')).toContainText('Onbevestigd · 1');
 expect(groupControl).toEqual({group:'mixed',action:'power',value:true});
 await group.getByRole('button',{name:'Muziek starten'}).click();
 await expect(group.getByText('LedFX actief')).toBeVisible();
 await expect(group.getByText(/Frameleeftijd: 40 ms.*Opdrachtduur: 90 ms/)).toBeVisible();
 const master = group.getByRole('slider',{name:'Masterfader muziek'});
 await master.fill('45');
 await expect.poll(() => music.level).toBe(45);
 await group.getByRole('button',{name:'Muziek stoppen'}).click();
 await expect(group.getByRole('button',{name:'Muziek starten'})).toBeVisible();
 const sceneForm=home.locator('.lighting-scene-form');
 await sceneForm.getByLabel('Scènenaam').fill('Kerstavond');
 await sceneForm.getByLabel('Helderheid').fill('45');
 await sceneForm.getByRole('button',{name:'Opslaan'}).click();
 await home.locator('article').filter({hasText:'Kerstavond'}).getByRole('button',{name:'Afspelen'}).click();
 await expect(page.locator('#lighting-feedback')).toContainText('Living room · Aan Gelukt, Helderheid Overgeslagen');
 await page.locator('#nav-hue').click();
 await expect(home.locator('article')).toHaveCount(1);
 await expect(home.getByText('Living room')).toBeVisible();
 await expect(home.getByRole('slider',{name:'Wittemperatuur'})).toBeVisible();
 await expect(home.locator('.lighting-brand-mark img')).toHaveAttribute('src','hue-app-icon.webp');
 await expect(home.getByText('Tree')).toHaveCount(0);
 await page.locator('#nav-tests').click();
 const hueTests=page.locator('#tests-page .provider-test-hue');
 await hueTests.getByLabel('Kies een Hue-lamp').selectOption('h');
 await expect(hueTests.getByRole('button',{name:'RGB-test'})).toBeDisabled();
 await hueTests.getByRole('button',{name:'Warm/koel wit'}).click();
 await expect(hueTests.getByRole('status')).toHaveText('Hue-test loopt');
 await hueTests.getByRole('button',{name:'Hue-test stoppen'}).click();
 await expect(hueTests.getByRole('status')).toHaveText('De bridge heeft het herstel van de vorige stand nog niet bevestigd.');
 const goveeTests=page.locator('#tests-page .provider-test-govee');
 await goveeTests.getByLabel('Kies een Govee-lamp').selectOption('g');
 await expect(goveeTests.getByRole('button',{name:'RGB-test'})).toBeDisabled();
 await goveeTests.getByRole('button',{name:'Identificeren'}).click();
 await expect(goveeTests.getByRole('status')).toHaveText('Govee-test loopt');
 await goveeTests.getByRole('button',{name:'Govee-test stoppen'}).click();
 await expect(goveeTests.getByRole('status')).toHaveText('Vorige stand hersteld');
 await page.locator('#nav-govee').click();
 await expect(home.getByText('Strip')).toBeVisible();
 await page.locator('#nav-control').click();
 await expect(page.locator('#twinkly-lighting').getByText('Tree')).toBeVisible();
 await page.locator('#nav-settings').click();
 const settings=page.locator('#lighting-settings');
 await expect(settings.getByText('bridge · 192.168.1.2 · Verbonden')).toBeVisible();
 await settings.getByRole('button',{name:'Opnieuw koppelen',exact:true}).click();
 await expect(settings.getByLabel('LAN-adres').first()).toHaveValue('192.168.1.2');
 const certificate=settings.getByRole('button',{name:'Certificaat ophalen'});
 await Promise.all([
  page.waitForEvent('dialog').then(dialog => dialog.dismiss()),
  certificate.click(),
 ]);
 await expect(settings.getByLabel('SHA256-vingerafdruk')).toHaveValue('');
 await Promise.all([
  page.waitForEvent('dialog').then(async dialog => {
   expect(dialog.message()).toContain(fingerprint);
   await dialog.accept();
  }),
  certificate.click(),
 ]);
 await expect(settings.getByLabel('SHA256-vingerafdruk')).toHaveValue(fingerprint);
 await settings.locator('form').getByRole('button',{name:'Opnieuw koppelen'}).click();
 await expect.poll(() => pairing).toEqual({id:'bridge',address:'192.168.1.2',certificate_sha256:fingerprint});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});

test('the footer opens the matching release and the Matter roadmap on mobile', async ({page}) => {
 const fs = require('node:fs');
 const path = require('node:path');
 const config = fs.readFileSync(path.join(__dirname, 'config.yaml'), 'utf8');
 const version = /^version:\s*["']?([^\s"']+)/m.exec(config)[1];
 await page.setViewportSize({width: 390, height: 844});
 await page.goto('http://127.0.0.1:8765/index.html', {waitUntil: 'domcontentloaded'});
 const footer = page.locator('#project-footer');
 const project = page.locator('#project-page');
 const header = page.locator('.workspace-header');
 await footer.getByRole('link', {name: 'Versie ' + version, exact: true}).click();
 await expect(project.getByRole('heading', {name: 'Changelog'})).toBeVisible();
 await expect(header.locator('.christmas-mark svg')).toBeVisible();
 await expect(header.getByRole('link', {name: 'Philips Hue'})).toBeVisible();
 await expect(project.locator('details').first()).toHaveAttribute('id', 'release-' + version);
 await expect(project.locator('details').first()).toHaveJSProperty('open', true);
 const search = page.getByRole('searchbox', {name: 'Zoek op versie of wijziging'});
 await search.fill('LED Order');
 await expect(project.locator('details:visible')).not.toHaveCount(0);
 await expect(project.locator('details').first()).toBeHidden();
 await search.fill('xyz-missing-release');
 await expect(project.getByRole('status')).toHaveText('Geen versies gevonden.');
 await footer.getByRole('link', {name: 'Roadmap'}).click();
 await expect(page.getByRole('heading', {name: 'Roadmap', exact: true})).toBeVisible();
 const roadmap3 = page.locator('.roadmap-version').filter({has: page.getByRole('heading', {name: /^3\.0/})});
 await expect(roadmap3.getByText('Matter-lampen.', {exact: true})).toBeVisible();
 await expect(roadmap3.getByText('Matter-stopcontacten.', {exact: true})).toBeVisible();
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
 await expect(header.getByRole('link', {name: 'Home', exact: true})).toBeVisible();
 await header.getByRole('link', {name: 'Home', exact: true}).click();
 await expect(project).toBeHidden();
 await expect(page.locator('#lighting-panel')).toBeVisible();
 await expect(footer.getByRole('link', {name: 'Versie ' + version, exact: true})).toBeVisible();
});

test('Hue rooms and zones retain their own controls and Bridge scenes', async ({page}) => {
 const requests = [];
 let cover = null;
 let imageUnavailable = false;
 await page.route('**/providers/hue/scene-image/hue-a/scene-one*', route => {
  if (route.request().method() === 'POST') {
   cover = route.request().postDataJSON().image;
   return route.fulfill({json:{ok:true}});
  }
  if (imageUnavailable) return route.fulfill({status:404});
  return route.fulfill({body:Buffer.from(cover,'base64'),contentType:'image/jpeg'});
 });
 await page.route('**/lighting', route => route.fulfill({json:{lights:[], groups:{}, scenes:{}, bridges:{}}}));
 await page.route('**/providers/hue/collections', route => route.fulfill({json:{bridges:[
  {id:'hue-a', address:'192.168.1.2', status:'online', collections:[
   {kind:'room', name:'Woonkamer', grouped_light:'room-control', on:false, brightness:44,
    scenes:[{id:'scene-one', name:'Avondlicht', has_image:!!cover, palette:[[255,0,0],[255,100,0]]}]},
   {kind:'zone', name:'Kersthoek', grouped_light:'zone-control', on:true, brightness:null, scenes:[]},
  ]},
  {id:'hue-b', address:'192.168.1.3', status:'unavailable', collections:[]},
 ]}}));
 await page.route('**/providers/hue/collections/control', route => {
  requests.push(route.request().postDataJSON());
  return route.fulfill({json:{ok:true}});
 });
 await page.setViewportSize({width:390, height:844});
 await page.goto('http://127.0.0.1:8765/index.html#hue',{waitUntil:'domcontentloaded'});
 const pane = page.locator('#hue-collections');
 const room = pane.locator('article').filter({hasText:'Woonkamer'});
 const zone = pane.locator('article').filter({hasText:'Kersthoek'});
 await expect(zone.getByRole('button',{name:'Aan',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(zone.getByRole('slider')).toHaveCount(0);
 await expect(room.getByRole('slider')).toHaveValue('44');
 await expect(pane.getByText('Niet bereikbaar')).toBeVisible();
 await room.getByRole('button',{name:'Aan',exact:true}).click();
 await expect.poll(() => requests.length).toBe(1);
 await zone.getByRole('button',{name:'Uit',exact:true}).click();
 await expect.poll(() => requests.length).toBe(2);
 await room.getByRole('button',{name:'Avondlicht',exact:true}).click();
 await expect.poll(() => requests).toEqual([
  {bridge:'hue-a', id:'room-control', action:'power', value:true},
  {bridge:'hue-a', id:'zone-control', action:'power', value:false},
  {bridge:'hue-a', id:'scene-one', action:'recall'},
 ]);
 const png = await page.evaluate(() => document.createElement('canvas').toDataURL().split(',')[1]);
 await room.getByLabel('Afbeelding kiezen · Avondlicht').setInputFiles({
  name:'avondlicht.png', mimeType:'image/png', buffer:Buffer.from(png,'base64'),
 });
 const preview = room.locator('.hue-scene-cover');
 const image = preview.locator('img');
 await expect(image).toBeVisible();
 await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
 imageUnavailable = true;
 const missingImage = page.waitForResponse(response =>
  response.url().includes('/scene-image/hue-a/scene-one') && response.status() === 404);
 await page.reload({waitUntil:'domcontentloaded'});
 await missingImage;
 await expect(image).toHaveCount(0);
 await expect(preview).toHaveCSS('background-image', /rgb\(255, 100, 0\)/);
 await room.getByRole('button',{name:'Afbeelding verwijderen · Avondlicht'}).click();
 await expect(image).toHaveCount(0);
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
});


function mockProjects(state) {
 return route => {
  if (route.request().method() === 'POST') {
   const {action, ...body} = route.request().postDataJSON();
   if (action === 'layout') {
    state.layout.revision += 1;
    if ('photo' in body) state.layout.photo_version = body.photo ? 'photo-1' : null;
    state.layout.points = body.points;
   } else if (action === 'save') {
    state.shows.push({...body, id:'show-1', revision:'first'});
   } else if (action === 'play') {
    state.playback = {state:'playing', id:body.id, step:1, total:2};
   } else if (action === 'stop') {
    state.playback.state = 'stopped';
   }
  }
  return route.fulfill({json:state});
 };
}

const newProjects = () => ({shows:[], layout:{revision:0, points:[], photo_version:null}, playback:{state:'idle'}});


test('Mijn Huis saves lamp moves and sizes across browser sessions', async ({browser}) => {
 const state = newProjects();
 const light = {id:'["twinkly","lamp"]', provider:'twinkly', name:'Twinkly Strings', product_code:'TWS500SPP1', status:'online', capabilities:{}, state:{}};
 const setup = async () => {
  const context = await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/lighting', route => route.fulfill({json:{lights:[light], groups:{}, scenes:{}, connections:{}}}));
  await context.route('**/lighting/projects', mockProjects(state));
  await context.route('**/lighting/projects/photo?*', route => route.fulfill({
   contentType:'image/svg+xml', body:'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#445"/></svg>',
  }));
  await context.route('**/product-photo/*', route => route.fulfill({
   contentType:'image/svg+xml', body:'<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><circle cx="40" cy="40" r="20" fill="gold"/></svg>',
  }));
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8765/index.html#home');
  await page.getByRole('link',{name:'Mijn Huis'}).click();
  return {context, page};
 };
 const {context, page} = await setup();
 const house = page.locator('#house-page');
 await expect(house.getByRole('heading',{name:'Mijn Huis'})).toBeVisible();
 await expect(page.locator('#lighting-tools')).toBeHidden();
 const photo = await page.evaluate(() => document.createElement('canvas').toDataURL('image/png').split(',')[1]);
 await house.getByLabel('Kies een foto').setInputFiles({
  name:'kamer.png', mimeType:'image/png', buffer:Buffer.from(photo,'base64'),
 });
 await house.locator('.house-lamp-choice').filter({hasText:'Twinkly Strings'}).click();
 await expect(house.locator('.house-lamp-choice img')).toHaveAttribute('src',/product-photo\//);
 await house.getByRole('button',{name:'Plaats in het midden'}).click();
 const marker = house.locator('.house-marker-lamp');
 const stage = house.locator('.lighting-spatial-stage');
 await expect(marker).toHaveAccessibleName('Twinkly Strings · Locatie 50%, 50%');
 const photoBounds = await stage.boundingBox();
 const lampBounds = await marker.boundingBox();
 await page.mouse.move(lampBounds.x + lampBounds.width / 2, lampBounds.y + lampBounds.height / 2);
 await page.mouse.down();
 await page.mouse.move(lampBounds.x + lampBounds.width / 2 - photoBounds.width * .15,
  lampBounds.y + lampBounds.height / 2 + photoBounds.height * .1, {steps:6});
 await page.mouse.up();
 await expect(marker).toHaveAccessibleName('Twinkly Strings · Locatie 35%, 60%');
 const handle = house.getByRole('button',{name:'Grootte · Twinkly Strings'});
 const handleBounds = await handle.boundingBox();
 await page.mouse.move(handleBounds.x + handleBounds.width / 2, handleBounds.y + handleBounds.height / 2);
 await page.mouse.down();
 await page.mouse.move(handleBounds.x + handleBounds.width / 2 + photoBounds.width * .05,
  handleBounds.y + handleBounds.height / 2, {steps:6});
 await page.mouse.up();
 await expect.poll(() => Math.round(state.layout.points[0][1][2])).toBe(22);
 await expect(house.getByRole('slider',{name:'Grootte'})).toHaveValue('22');
 await context.close();
 const second = await setup();
 await expect(second.page.locator('.house-marker-lamp')).toHaveAccessibleName('Twinkly Strings · Locatie 35%, 60%');
 const width = await second.page.locator('.house-marker').evaluate(marker => parseFloat(marker.style.width));
 expect(width).toBeCloseTo(22, 0);
 await second.context.close();
});

test('a saved mixed show keeps playing after leaving Home and stops from a second browser', async ({browser}) => {
 const state = newProjects();
 const setup = async () => {
  const context = await browser.newContext();
  await context.route('**/lighting', route => route.fulfill({json:{
   lights:[], groups:{room:{name:'Kamer',members:[]}},
   scenes:{warm:{name:'Warm',group:'room',on:true},cool:{name:'Koel',group:'room',on:true}}, connections:{},
  }}));
  await context.route('**/lighting/projects', mockProjects(state));
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8765/index.html#home');
  return {context, page};
 };
 const {context, page} = await setup();
 const builder = page.locator('#lighting-tools section').filter({hasText:'Showbouwer'});
 await builder.getByLabel('Shownaam').fill('Kerstshow');
 await builder.getByRole('button',{name:'Stap toevoegen'}).click();
 await builder.getByRole('button',{name:'Stap toevoegen'}).click();
 const steps = builder.locator('.lighting-show-step');
 await steps.nth(1).getByLabel('Scène').selectOption('cool');
 await steps.nth(1).getByRole('button',{name:'Omhoog'}).click();
 await builder.getByRole('button',{name:'Opslaan'}).click();
 await builder.getByRole('button',{name:'Afspelen'}).click();
 await expect(builder.getByRole('status')).toHaveText('Stap 1 / 2');
 expect(state.shows[0].steps.map(step => step.scene)).toEqual(['cool','warm']);
 await page.locator('#nav-settings').click();
 await context.close();
 const second = await setup();
 const remoteBuilder = second.page.locator('#lighting-tools section').filter({hasText:'Showbouwer'});
 await expect(remoteBuilder.getByRole('status')).toHaveText('Stap 1 / 2');
 await remoteBuilder.getByRole('button',{name:'Stoppen'}).click();
 await expect(remoteBuilder.getByRole('status')).toHaveText('Show gestopt');
 await expect(remoteBuilder.getByRole('button',{name:'Afspelen'})).toBeEnabled();
 await second.context.close();
});

test('Mijn Huis previews the sweep order and displays the last command result', async ({page}) => {
 const ids = ['["twinkly","left"]','["hue","bridge","right"]','["govee","off","off"]'];
 const lights = ids.map((id,index) => ({id,name:['Links','Rechts','Uit'][index],
  provider:['twinkly','hue','govee'][index],status:'online',capabilities:{rgb:true},state:{on:index < 2}}));
 const layout = {revision:'layout',photo_version:'photo',points:ids.map((id,index)=>[id,[15+index*30,60]])};
 await page.route('**/lighting', route => route.fulfill({json:{lights, groups:{}, scenes:{}, connections:{}}}));
 await page.route('**/lighting/projects/photo?*', route => route.fulfill({contentType:'image/svg+xml',
  body:'<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240"></svg>'}));
 let playback = {state:'idle'};
 let started = false;
 let useGradient = false;
 await page.route('**/lighting/projects', route => {
  if (route.request().method() === 'POST') {
   expect(route.request().postDataJSON()).toEqual({action:'spatial',revision:'layout',direction:'left',
    color:[255,189,99],delay:550,...(useGradient ? {end_color:[75,144,255]} : {})});
   started = true;
   playback = {state:'complete',kind:'spatial',effect:useGradient?'gradient':'sweep',last:{step:2,milliseconds:24,results:{[ids[0]]:{color:'accepted'}}}};
  }
  return route.fulfill({json:{layout,shows:[],playback}});
 });
 await page.goto('http://127.0.0.1:8765/index.html#mijn-huis');
 const effect = page.locator('.house-effects');
 await expect(effect.getByText('Lampen die meedoen · 2 / 3')).toBeVisible();
 await effect.getByRole('checkbox',{name:'Volgorde tonen'}).check();
 const markers = page.locator('.house-marker');
 await expect(markers.nth(0)).toHaveAttribute('data-order','1');
 await effect.getByLabel('Richting').selectOption('left');
 await expect(markers.nth(0)).toHaveAttribute('data-order','2');
 await expect(markers.nth(1)).toHaveAttribute('data-order','1');
 expect(started).toBe(false);
 await effect.getByRole('button',{name:'Afspelen'}).click();
 await expect(effect.getByText('Kleurveeg klaar')).toBeVisible();
 await effect.getByText('Laatste uitgevoerde stap 2 · Opdrachttijd in de app 24 ms').click();
 await expect(effect.getByText('Links · Geaccepteerd')).toBeVisible();
 useGradient = true;
 await effect.getByLabel('Effect', {exact:true}).selectOption('gradient');
 await expect(effect.getByLabel('Eindkleur')).toBeVisible();
 await expect.poll(() => markers.nth(0).evaluate(marker => marker.style.getPropertyValue('--gradient-preview').replaceAll(' ', ''))).toBe('rgb(75,144,255)');
 await effect.getByRole('button',{name:'Afspelen'}).click();
 await expect(effect.getByText('Kleurverloop klaar')).toBeVisible();
});

test('Mijn Huis adds walls and switches to the matching photo', async ({page}) => {
 const first = {revision:'first',photo_version:'photo-one',points:[]};
 const second = {revision:'second',photo_version:null,points:[]};
 const walls = [{id:'default',name:''}];
 await page.route('**/lighting', route => route.fulfill({json:{lights:[],groups:{},scenes:{},connections:{}}}));
 await page.route('**/lighting/projects/photo?*', route => route.fulfill({contentType:'image/svg+xml',
  body:'<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240"></svg>'}));
 await page.route(/\/lighting\/projects(?:\?[^/]*)?$/, route => {
  let wall = new URL(route.request().url()).searchParams.get('wall') ?? 'default';
  if (route.request().method() === 'POST') {
   expect(route.request().postDataJSON()).toEqual({action:'add_wall',name:'Woonkamer'});
   walls.push({id:'second',name:'Woonkamer'});
   wall = 'second';
  }
  return route.fulfill({json:{wall_id:wall,walls,shows:[],layout:wall === 'default' ? first : second,
   playback:{state:'idle'}}});
 });
 await page.goto('http://127.0.0.1:8765/index.html#mijn-huis');
 const picker = page.getByRole('combobox',{name:'Muur',exact:true});
 const photo = page.locator('.house-room-photo');
 await expect(photo).toBeVisible();
 await page.getByRole('textbox',{name:'Naam muur'}).fill('Woonkamer');
 await page.getByRole('button',{name:'Muur toevoegen'}).click();
 await expect(picker).toHaveValue('second');
 await expect(photo).toHaveCount(0);
 await picker.selectOption('default');
 await expect(photo).toHaveAttribute('src','lighting/projects/photo?v=photo-one');
 await picker.selectOption('second');
 await expect(photo).toHaveCount(0);
});
