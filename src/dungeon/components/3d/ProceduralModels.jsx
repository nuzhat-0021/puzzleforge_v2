import React, { useMemo } from 'react';
import * as THREE from 'three';

export function ProceduralModel({ modelType, colorTint = '#FFFFFF' }) {
  const primaryColor = useMemo(() => new THREE.Color(colorTint), [colorTint]);

  switch (modelType) {
    case 'bed_double':
      return (
        <group>
          {/* Wood Frame */}
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.3, 1.8]} />
            <meshStandardMaterial color="#6E4720" roughness={0.7} />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, 0.65, -0.85]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.9, 0.15]} />
            <meshStandardMaterial color="#543415" roughness={0.6} />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, 0.4, 0.05]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.3, 1.6]} />
            <meshStandardMaterial color={primaryColor} roughness={0.9} />
          </mesh>
          {/* Pillows */}
          <mesh position={[-0.45, 0.6, -0.6]} castShadow receiveShadow>
            <boxGeometry args={[0.7, 0.15, 0.4]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
          </mesh>
          <mesh position={[0.45, 0.6, -0.6]} castShadow receiveShadow>
            <boxGeometry args={[0.7, 0.15, 0.4]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
          </mesh>
          {/* Folded Blanket / Throw */}
          <mesh position={[0, 0.56, 0.4]} castShadow receiveShadow>
            <boxGeometry args={[1.91, 0.04, 0.8]} />
            <meshStandardMaterial color="#D97706" roughness={0.9} />
          </mesh>
        </group>
      );

    case 'armchair':
      return (
        <group>
          {/* Cushion Seat */}
          <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.25, 0.9]} />
            <meshStandardMaterial color={primaryColor} roughness={0.8} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.75, -0.35]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.65, 0.2]} />
            <meshStandardMaterial color={primaryColor} roughness={0.8} />
          </mesh>
          {/* Armrests */}
          <mesh position={[-0.4, 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.35, 0.9]} />
            <meshStandardMaterial color={primaryColor} roughness={0.8} />
          </mesh>
          <mesh position={[0.4, 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.35, 0.9]} />
            <meshStandardMaterial color={primaryColor} roughness={0.8} />
          </mesh>
          {/* Wooden Legs */}
          {[-0.35, 0.35].map((x) =>
            [-0.35, 0.35].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.12, z]} castShadow>
                <cylinderGeometry args={[0.04, 0.03, 0.25, 8]} />
                <meshStandardMaterial color="#4A2E12" roughness={0.6} />
              </mesh>
            ))
          )}
        </group>
      );

    case 'sofa':
      return (
        <group>
          {/* Main Base */}
          <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.25, 0.85]} />
            <meshStandardMaterial color={primaryColor} roughness={0.85} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.7, -0.32]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.6, 0.2]} />
            <meshStandardMaterial color={primaryColor} roughness={0.85} />
          </mesh>
          {/* Armrests */}
          <mesh position={[-0.9, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.35, 0.85]} />
            <meshStandardMaterial color={primaryColor} roughness={0.85} />
          </mesh>
          <mesh position={[0.9, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.35, 0.85]} />
            <meshStandardMaterial color={primaryColor} roughness={0.85} />
          </mesh>
        </group>
      );

    case 'desk':
      return (
        <group>
          {/* Tabletop */}
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.08, 0.8]} />
            <meshStandardMaterial color={primaryColor} roughness={0.6} />
          </mesh>
          {/* Legs */}
          {[-0.7, 0.7].map((x) =>
            [-0.3, 0.3].map((z) => (
              <mesh key={`leg-${x}-${z}`} position={[x, 0.36, z]} castShadow>
                <boxGeometry args={[0.08, 0.72, 0.08]} />
                <meshStandardMaterial color="#3D2314" roughness={0.7} />
              </mesh>
            ))
          )}
          {/* Drawer Storage Box */}
          <mesh position={[0.45, 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.45, 0.32, 0.75]} />
            <meshStandardMaterial color="#5C3A21" roughness={0.7} />
          </mesh>
        </group>
      );

    case 'coffee_table':
      return (
        <group>
          <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.06, 32]} />
            <meshStandardMaterial color={primaryColor} roughness={0.5} />
          </mesh>
          {/* 3 Legs */}
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.35, 0.16, Math.sin(angle) * 0.35]}
              rotation={[0.1, angle, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.03, 0.02, 0.32, 8]} />
              <meshStandardMaterial color="#2B1810" />
            </mesh>
          ))}
        </group>
      );

    case 'bookshelf':
      return (
        <group>
          {/* Main Cabinet Frame */}
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.0, 2.0, 0.4]} />
            <meshStandardMaterial color={primaryColor} roughness={0.7} />
          </mesh>
          {/* Shelves */}
          {[0.4, 0.9, 1.4].map((y, i) => (
            <group key={i}>
              <mesh position={[0, y, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.92, 0.04, 0.38]} />
                <meshStandardMaterial color="#4A2E12" />
              </mesh>
              {/* Random Decorative Books */}
              {[-0.3, -0.1, 0.15].map((bx, bi) => (
                <mesh key={bi} position={[bx, y + 0.18, 0]} castShadow>
                  <boxGeometry args={[0.08, 0.3, 0.22]} />
                  <meshStandardMaterial
                    color={bi % 2 === 0 ? '#F43F5E' : '#3B82F6'}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );

    case 'plant_monstera':
      return (
        <group>
          {/* Ceramic Pot */}
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.25, 0.2, 0.5, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Plant Stems & Big Leaves */}
          {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
            <group key={i} rotation={[0.3, angle, 0]} position={[0, 0.4, 0]}>
              <mesh position={[0, 0.3, 0]} rotation={[0.4, 0, 0]} castShadow>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshStandardMaterial color={primaryColor} roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      );

    case 'plant_bonsai':
      return (
        <group>
          {/* Pot */}
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.4, 0.15, 0.3]} />
            <meshStandardMaterial color="#27272A" roughness={0.4} />
          </mesh>
          {/* Curved Trunk */}
          <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.3, 8]} />
            <meshStandardMaterial color="#5C3A21" />
          </mesh>
          {/* Foliage Clusters */}
          <mesh position={[0.1, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color={primaryColor} roughness={0.5} />
          </mesh>
        </group>
      );

    case 'laptop':
      return (
        <group>
          {/* Base Keyboard */}
          <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.36, 0.015, 0.26]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 0.14, -0.12]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.36, 0.24, 0.01]} />
            <meshStandardMaterial color={primaryColor} roughness={0.2} />
          </mesh>
        </group>
      );

    case 'mug':
      return (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.16, 16]} />
            <meshStandardMaterial color={primaryColor} roughness={0.3} />
          </mesh>
          {/* Handle */}
          <mesh position={[0.09, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.05, 0.015, 8, 16]} />
            <meshStandardMaterial color={primaryColor} />
          </mesh>
        </group>
      );

    case 'floor_lamp':
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.04, 32]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} />
          </mesh>
          {/* Pole */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.7, 16]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} />
          </mesh>
          {/* Lampshade */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <coneGeometry args={[0.28, 0.35, 32, 1, true]} />
            <meshStandardMaterial color={primaryColor} side={THREE.DoubleSide} />
          </mesh>
          {/* Point Light Glow */}
          <pointLight position={[0, 1.5, 0]} color="#FBBF24" intensity={2.0} distance={4} />
        </group>
      );

    case 'rug_round':
      return (
        <mesh position={[0, 0.005, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.0, 32]} />
          <meshStandardMaterial color={primaryColor} roughness={0.95} />
        </mesh>
      );

    case 'rug_rect':
      return (
        <mesh position={[0, 0.005, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.0, 1.4]} />
          <meshStandardMaterial color={primaryColor} roughness={0.95} />
        </mesh>
      );

    case 'wall_painting':
      return (
        <group>
          {/* Wooden Frame */}
          <mesh position={[0, 0, 0.02]} castShadow receiveShadow>
            <boxGeometry args={[1.1, 0.8, 0.04]} />
            <meshStandardMaterial color="#3D2314" roughness={0.7} />
          </mesh>
          {/* Canvas */}
          <mesh position={[0, 0, 0.041]} receiveShadow>
            <planeGeometry args={[1.0, 0.7]} />
            <meshStandardMaterial color={primaryColor} roughness={0.4} />
          </mesh>
        </group>
      );

    case 'wall_shelf':
      return (
        <group>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.05, 0.3]} />
            <meshStandardMaterial color={primaryColor} roughness={0.7} />
          </mesh>
          {/* Metal Wall Brackets */}
          {[-0.4, 0.4].map((x) => (
            <mesh key={x} position={[x, -0.1, -0.1]} castShadow>
              <boxGeometry args={[0.04, 0.2, 0.1]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} />
            </mesh>
          ))}
        </group>
      );

    default:
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={primaryColor} />
        </mesh>
      );
  }
}
