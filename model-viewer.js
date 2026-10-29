import * as THREE from 'three';
import {OrbitControls} from './vendor__three__addons__controls__OrbitControls.js';
import {GLTFLoader} from './vendor__three__addons__loaders__GLTFLoader.js';
import {RoomEnvironment} from './vendor__three__addons__environments__RoomEnvironment.js';
export function mountViewer(host,url){
 let disposed=false,renderer,model,environment,raf,controls,observer;
 const status=host.querySelector('.model-status'),stage=host.querySelector('.model-canvas');
 function disposeObject(root){root?.traverse(o=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(!m)continue;for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose()}})}
 function cleanup(){disposed=true;cancelAnimationFrame(raf);observer?.disconnect();controls?.dispose();disposeObject(model);environment?.dispose();renderer?.dispose();renderer?.domElement.remove()}
 try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;stage.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#f0f4f7');
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(35,1,.01,100);camera.position.set(2.8,2,3.3);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=true;controls.minDistance=.6;controls.maxDistance=12;
 scene.add(new THREE.HemisphereLight(0xffffff,0x9ba7b8,2));const key=new THREE.DirectionalLight(0xffffff,2.5);key.position.set(3,5,4);scene.add(key);const fill=new THREE.DirectionalLight(0xc6ddff,1.3);fill.position.set(-3,2,-2);scene.add(fill);
 let resetPosition=new THREE.Vector3(2.8,2,3.3);
 const reset=()=>{camera.position.copy(resetPosition);controls.target.set(0,0,0);controls.update();controls.saveState()};host.querySelector('[data-model-reset]').onclick=reset;
 host.querySelector('[data-model-spin]').onclick=e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));e.currentTarget.textContent=controls.autoRotate?'停止旋转':'自动旋转'};
 const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};observer=new ResizeObserver(resize);observer.observe(stage);resize();
 function animate(){if(disposed)return;controls.update();renderer.render(scene,camera);raf=requestAnimationFrame(animate)}animate();
 new GLTFLoader().load(url,gltf=>{if(disposed){disposeObject(gltf.scene);return}model=gltf.scene;model.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),max=Math.max(size.x,size.y,size.z);if(!Number.isFinite(max)||max<=0){status.textContent='模型没有可显示的几何体。';disposeObject(model);return}const scale=2.4/max;model.scale.multiplyScalar(scale);model.position.sub(center.multiplyScalar(scale));scene.add(model);const radius=new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere()).radius;const distance=radius/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))*1.12;resetPosition=new THREE.Vector3(.65,.55,1).normalize().multiplyScalar(distance);controls.minDistance=Math.max(.25,radius*.5);controls.maxDistance=distance*4;reset();status.hidden=true;host.querySelector('.model-tools').hidden=false},progress=>{if(disposed)return;status.textContent=progress.total?'正在加载模型 '+Math.min(99,Math.round(progress.loaded/progress.total*100))+'%':'正在加载模型…'},()=>{if(!disposed)status.textContent='模型暂时未能加载，请点击“重新加载”重试。'});
 }catch(e){status.textContent='当前浏览器无法启动三维显示。下方为对应案例图片，请尝试启用浏览器硬件加速后重新加载。';const poster=document.createElement('img');poster.src=host.dataset.poster;poster.alt='三维显示不可用时的案例图片';poster.style.cssText='width:100%;height:100%;object-fit:contain;padding:60px 30px 100px';stage.appendChild(poster);status.style.cssText='top:auto;bottom:15px;left:5%;width:90%;transform:none';} 
 return cleanup;
}
