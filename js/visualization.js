// Three.js Content Block Visualization
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Initialize the scene
let scene, camera, renderer, controls;
let contentBlocks = [];
let combinedBlock;
let userCube;
let isAnimating = false;
let animationFrameId;

// Colors
const blockColors = [
  0x3498db, // Blue
  0x2ecc71, // Green
  0xe74c3c, // Red
  0xf39c12, // Orange
  0x9b59b6, // Purple
  0x1abc9c, // Teal
  0xd35400, // Dark Orange
  0x2980b9, // Dark Blue
];

// Initialize the visualization
function init() {
  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f7fa);

  // Create the camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 15);
  
  // Create the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById('visualization-container').appendChild(renderer.domElement);
  
  // Add orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);
  
  // Create content blocks
  createContentBlocks();
  
  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  document.getElementById('combine-button').addEventListener('click', startAnimation);

  // Start the render loop
  animate();
}

// Create the initial content blocks
function createContentBlocks() {
  // Remove any existing blocks
  contentBlocks.forEach(block => scene.remove(block));
  contentBlocks = [];
  
  if (combinedBlock) {
    scene.remove(combinedBlock);
    combinedBlock = undefined;
  }
  
  if (userCube) {
    scene.remove(userCube);
    userCube = undefined;
  }
  
  // Create 8 random content blocks
  for (let i = 0; i < 8; i++) {
    const size = Math.random() * 0.5 + 0.5; // Random size between 0.5 and 1
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({
      color: blockColors[i % blockColors.length],
      transparent: true,
      opacity: 0.8,
    });
    
    const block = new THREE.Mesh(geometry, material);
    
    // Position the blocks in a circle
    const angle = (i / 8) * Math.PI * 2;
    const radius = 6;
    block.position.x = Math.cos(angle) * radius;
    block.position.z = Math.sin(angle) * radius;
    block.position.y = size / 2 + Math.random();
    
    // Rotate the blocks randomly
    block.rotation.y = Math.random() * Math.PI;
    
    // Add to the scene and our array
    scene.add(block);
    contentBlocks.push(block);
  }
}

// Combine the content blocks animation
function startAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  
  // Disable the button during animation
  document.getElementById('combine-button').disabled = true;
  
  // Create the central combined block
  const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
  const material = new THREE.MeshPhongMaterial({
    color: 0x0057ff,
    transparent: true,
    opacity: 0,
  });
  
  combinedBlock = new THREE.Mesh(geometry, material);
  combinedBlock.position.set(0, 1.25, 0);
  scene.add(combinedBlock);
  
  // Animate the blocks moving to the center
  let progress = 0;
  const animateBlocks = () => {
    progress += 0.01;
    
    if (progress < 1) {
      // Move blocks toward center and fade them out
      contentBlocks.forEach((block, index) => {
        const originalPos = new THREE.Vector3(
          Math.cos((index / 8) * Math.PI * 2) * 6,
          block.position.y,
          Math.sin((index / 8) * Math.PI * 2) * 6
        );
        
        block.position.lerp(new THREE.Vector3(0, 1.25, 0), progress);
        block.scale.lerp(new THREE.Vector3(0.1, 0.1, 0.1), progress);
        
        if (block.material.opacity > 0.1) {
          block.material.opacity -= 0.01;
        }
      });
      
      // Fade in the combined block
      if (combinedBlock.material.opacity < 0.9) {
        combinedBlock.material.opacity += 0.01;
      }
      
      animationFrameId = requestAnimationFrame(animateBlocks);
    } else {
      // Remove individual blocks once they've been "absorbed"
      contentBlocks.forEach(block => scene.remove(block));
      contentBlocks = [];
      
      // Pulse the combined block
      setTimeout(pulseAndCreateUser, 500);
    }
  };
  
  animateBlocks();
}

// Pulse the combined block and create the user
function pulseAndCreateUser() {
  let pulseProgress = 0;
  
  const pulse = () => {
    pulseProgress += 0.05;
    
    const scale = 1 + Math.sin(pulseProgress * Math.PI) * 0.2;
    combinedBlock.scale.set(scale, scale, scale);
    
    if (pulseProgress < 1) {
      animationFrameId = requestAnimationFrame(pulse);
    } else {
      // Create the user cube after pulsing
      createUserAndConnectToContent();
    }
  };
  
  pulse();
}

// Create the user cube and connect it to the content
function createUserAndConnectToContent() {
  // Create user cube
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 0xf1c40f, // Yellow color for the user
    transparent: true,
    opacity: 0,
  });
  
  userCube = new THREE.Mesh(geometry, material);
  userCube.position.set(-6, 1, -3);
  scene.add(userCube);
  
  // Fade in the user cube
  let fadeIn = 0;
  const fadeInUser = () => {
    fadeIn += 0.02;
    
    if (fadeIn < 1) {
      userCube.material.opacity = fadeIn;
      animationFrameId = requestAnimationFrame(fadeInUser);
    } else {
      // Create connection line between user and content
      createConnection();
    }
  };
  
  fadeInUser();
}

// Create a connection line between the user and content
function createConnection() {
  // Create connection line material
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0057ff,
    transparent: true,
    opacity: 0,
  });
  
  // Create the points for the line
  const points = [];
  points.push(new THREE.Vector3(userCube.position.x, userCube.position.y, userCube.position.z));
  points.push(new THREE.Vector3(combinedBlock.position.x, combinedBlock.position.y, combinedBlock.position.z));
  
  // Create the line geometry
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);
  
  // Animate the connection line
  let connectProgress = 0;
  const animateConnection = () => {
    connectProgress += 0.02;
    
    if (connectProgress < 1) {
      line.material.opacity = connectProgress;
      animationFrameId = requestAnimationFrame(animateConnection);
    } else {
      // Flash the content block to simulate "finding" what they're after
      flashContentBlock(line);
    }
  };
  
  animateConnection();
}

// Flash the content block to simulate "finding" what they need
function flashContentBlock(connectionLine) {
  let flashCount = 0;
  
  const flash = () => {
    flashCount += 0.05;
    
    // Flash the color between blue and bright white
    if (Math.floor(flashCount * 4) % 2 === 0) {
      combinedBlock.material.color.set(0xffffff);
    } else {
      combinedBlock.material.color.set(0x0057ff);
    }
    
    if (flashCount < 2) {
      animationFrameId = requestAnimationFrame(flash);
    } else {
      // Reset the color when done
      combinedBlock.material.color.set(0x0057ff);
      
      // Re-enable the button and reset animation flag
      document.getElementById('combine-button').disabled = false;
      isAnimating = false;
      
      // Wait a bit, then reset everything
      setTimeout(() => {
        scene.remove(connectionLine);
        resetVisualization();
      }, 2000);
    }
  };
  
  flash();
}

// Reset the visualization
function resetVisualization() {
  // Fade out the combined block and user
  let fadeOut = 1;
  const fadeOutObjects = () => {
    fadeOut -= 0.02;
    
    if (fadeOut > 0) {
      if (combinedBlock) combinedBlock.material.opacity = fadeOut;
      if (userCube) userCube.material.opacity = fadeOut;
      animationFrameId = requestAnimationFrame(fadeOutObjects);
    } else {
      // Remove objects and create new content blocks
      if (combinedBlock) scene.remove(combinedBlock);
      if (userCube) scene.remove(userCube);
      combinedBlock = undefined;
      userCube = undefined;
      
      createContentBlocks();
    }
  };
  
  fadeOutObjects();
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate the blocks slowly
  contentBlocks.forEach(block => {
    block.rotation.y += 0.005;
  });
  
  if (combinedBlock) {
    combinedBlock.rotation.y += 0.01;
  }
  
  controls.update();
  renderer.render(scene, camera);
}

// Initialize when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Wait a moment for the Three.js modules to load
  setTimeout(init, 100);
});
