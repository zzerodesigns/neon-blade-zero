# Changelog: v48.8.6 to v48.8.7

### Procedural Theme-Specific Skyboxes

The rendering pipeline has been upgraded with a procedural skybox sphere that centers dynamically on the camera to establish continuous background depth. The skybox shader calculates custom atmospheric gradients and celestial structures in real time based on the active theme. 

The light theme renders drifting dawn clouds over rolling mountain silhouettes, while the dark theme generates deep space nebulas with teal and amber gas clouds, an orbiting ringed moon, and starry constellations. The neon theme features a retro-futuristic synthwave sunset with a striped sun, and the Halloween theme generates graveyard tree silhouettes, drifting green ectoplasmic vapors, a glowing harvest moon, and spooky eyes that blink out of phase.

### Triplanar Floor and Wall Shaders

To eliminate texture stretching, mirroring, and seams on non-standard geometry, a unified procedural shader has been implemented for the floor and walls. The shader calculates fragment coordinates dynamically in world space to draw seamless, high-contrast surface patterns. 

The light theme renders an icy blue tundra with cracked lines and localized snow patches, while the dark theme draws a carbon-fiber metallic weave with glowing orange seams. The neon theme projects expanding grid-aligned cyan wave pulses across the arena, and the Halloween theme maps orange magma floor cracks and falling autumn leaves across the walls using a cellular noise pattern.

### Local-Dimension Decoration Shaders

Standard platforms, columns, and obstacles in the dark theme have been transitioned to a specialized local-dimension shader. Instead of reading standard UV coordinates, this shader reads the absolute physical dimensions of each mesh to render sharp, constant-width edge glows and circuit paths. 

This mathematical scaling ensures that the thickness of edge highlights remains identical on all objects regardless of size, preventing the visual stretching that occurs on irregular geometry. These circuit paths are programmed to pulse in sync with the wave frequencies of the floor.

### High-Performance Billboarded Snow

The snow weather particles in the light theme have been refactored from physical planes to high-performance billboarded sprites. The particles are rendered as soft glowing spheres that dynamically face the camera in all viewing angles, eliminating structural clipping against flat geometry. The snow particles utilize trigonometric functions to sway and flutter naturally as they descend, transitioning smoothly into a rotating ground layer before fading out.