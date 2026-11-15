const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const source = html.slice(html.indexOf('const networkText ='),html.indexOf('async function refreshNetwork()'));
function createMap() {
  class Element {
    constructor() {
      this.children = [];
      this.dataset = {};
      this.style = {setProperty() {}};
      this.clientWidth = 1100;
      this.clientHeight = 720;
      const classes = new Set();
      this.classList = {
        add: name => classes.add(name), remove: name => classes.delete(name),
        contains: name => classes.has(name),
      };
    }
    append(child) { this.children.push(child); }
    replaceChildren() { this.children = []; }
    getBoundingClientRect() { return {left:0,top:0}; }
    addEventListener() {}
    setAttribute() {}
    setPointerCapture() {}
    closest() { return this.dataset.networkNode ? this : null; }
  }
  const elements = new Map(), storage = new Map();
  const byId = id => {
    if (!elements.has(id)) elements.set(id,new Element());
    return elements.get(id);
  };
  const body = source + `
    return {renderNetwork, networkText, networkMap, networkCamera, fitNetwork,
            startNetworkGesture, moveNetworkGesture, endNetworkGesture, zoomNetwork,
            nodes: () => networkNodes, links: () => networkLinks};
  `;
  const map = new Function('byId','document','localStorage','ResizeObserver','requestAnimationFrame','lang',body)(
    byId,{activeElement:null,createElement:()=>new Element(),addEventListener(){}},
    {getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
    class { observe() {} },()=>1,{value:'en'},
  );
  return {map, storage, byId};
}
function lamps(count) {
  return Array.from({length:count},(_,i)=>({
    id:String(i),name:'Light '+i,kind:'wifi',ssid:'Home',gateway:'192.168.1.1',seconds:120,rssi:-68,
  }));
}
test('fits 64 lights without overlapping and connects direct peers',()=>{
  const {map} = createMap();
  const rows = lamps(64);
  rows[0].kind = 'ap';
  rows[1].peer = '0';
  map.renderNetwork(rows,map.networkText.en);
  assert.equal(map.nodes().size,65);
  assert.equal(map.links().length,63);
  assert.equal(map.links().filter(link=>link[2]).length,1);
  const nodes = [...map.nodes().values()];
  for (const a of nodes) {
    assert.ok(a.x * map.networkCamera.scale + map.networkCamera.x >= 0);
    assert.ok((a.x+a.width) * map.networkCamera.scale + map.networkCamera.x <= map.networkMap.clientWidth);
    assert.ok(a.y * map.networkCamera.scale + map.networkCamera.y >= 0);
    assert.ok((a.y+a.height) * map.networkCamera.scale + map.networkCamera.y <= map.networkMap.clientHeight);
    for (const b of nodes) {
      if (a === b) continue;
      assert.ok(a.x+a.width<=b.x || b.x+b.width<=a.x || a.y+a.height<=b.y || b.y+b.height<=a.y);
    }
  }
});
test('dragged light keeps its position and link after refresh; the backdrop pans',()=>{
  const {map,storage} = createMap();
  const rows = lamps(64);
  map.renderNetwork(rows,map.networkText.en);
  const node = map.nodes().get('device:0'), oldX = node.x, oldY = node.y;
  const at = (target,x,y) => ({target,clientX:x,clientY:y,button:0,pointerId:1});
  map.startNetworkGesture(at(node.el,0,0));
  map.renderNetwork(rows,map.networkText.en);
  assert.equal(map.nodes().get(node.id),node);
  map.moveNetworkGesture(at(node.el,50,20));
  map.endNetworkGesture(at(node.el,50,20));
  const updated = map.nodes().get(node.id);
  assert.ok(updated.x > oldX && updated.y > oldY);
  assert.deepEqual(JSON.parse(storage.get('twinkly-network-positions-v1')),[[node.id,[updated.x,updated.y]]]);
  assert.ok(map.links().some(([source])=>source===updated));
  const x = map.networkCamera.x;
  map.startNetworkGesture(at(map.networkMap,0,0));
  map.moveNetworkGesture(at(map.networkMap,50,20));
  map.endNetworkGesture(at(map.networkMap,50,20));
  assert.equal(map.networkCamera.x,x+50);
  const worldX = (200-map.networkCamera.x)/map.networkCamera.scale;
  map.zoomNetwork(map.networkCamera.scale*1.3,200,100);
  assert.ok(Math.abs((200-map.networkCamera.x)/map.networkCamera.scale-worldX)<1e-9);
});
