import * as THREE from 'three'
import type { ModelPosition } from '@/types/game'

/**
 * Build a Three.js object from a model definition
 */
export function buildObj(def: ModelPosition): THREE.Object3D | null {
  let geometry: THREE.BufferGeometry | undefined
  const scale = def.scale || [1, 1, 1]

  // Check for non-uniform scaling
  const isNonUniform = scale[0] !== scale[1] || scale[1] !== scale[2]

  switch (def.type) {
    case 'box':
      geometry = new THREE.BoxGeometry(scale[0], scale[1], scale[2])
      break
    case 'sphere':
      // Use scale[0] * 0.5 as radius (scale represents diameter)
      // For non-uniform scaling, use rawScale flag to use scale[0] directly as radius
      if (def.rawScale) {
        geometry = new THREE.SphereGeometry(scale[0], 32, 32)
      } else {
        geometry = new THREE.SphereGeometry(scale[0] * 0.5, 32, 32)
      }
      break
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(
        scale[0] * 0.5,
        scale[2] ? scale[2] * 0.5 : scale[0] * 0.5,
        scale[1],
        32
      )
      break
    case 'cone':
      // Use scale[0] as radius and scale[1] as height
      geometry = new THREE.ConeGeometry(scale[0], scale[1], 32)
      break
    case 'torus':
      geometry = new THREE.TorusGeometry(scale[0] * 0.5, scale[1] * 0.15, 16, 100)
      break
    case 'torusknot':
      geometry = new THREE.TorusKnotGeometry(scale[0] * 0.4, scale[1] * 0.1, 100, 16)
      break
    case 'dodecahedron':
      geometry = new THREE.DodecahedronGeometry(scale[0] * 0.5)
      break
    case 'icosahedron':
      geometry = new THREE.IcosahedronGeometry(scale[0] * 0.5)
      break
    case 'octahedron':
      geometry = new THREE.OctahedronGeometry(scale[0] * 0.5)
      break
    case 'tetrahedron':
      geometry = new THREE.TetrahedronGeometry(scale[0] * 0.5)
      break
    case 'ring':
      geometry = new THREE.RingGeometry(scale[0] * 0.3, scale[0] * 0.5, 32)
      break
    case 'plane':
      geometry = new THREE.PlaneGeometry(scale[0], scale[1])
      break
    case 'group': {
      const group = new THREE.Group()
      if (def.children) {
        def.children.forEach(childDef => {
          const child = buildObj(childDef)
          if (child) group.add(child)
        })
      }

      const groupPart = def.part || null

      // Handle wing groups with pivot points
      if (groupPart && groupPart.startsWith('wing_') && def.position) {
        const wingPivot = new THREE.Group()
        if (groupPart === 'wing_l') {
          wingPivot.position.set(def.position[0] + 0.3, def.position[1], def.position[2])
          group.position.set(-0.3, 0, 0)
        } else {
          wingPivot.position.set(def.position[0] - 0.3, def.position[1], def.position[2])
          group.position.set(0.3, 0, 0)
        }
        if (def.rotation) group.rotation.set(def.rotation[0], def.rotation[1], def.rotation[2])
        wingPivot.add(group)
        wingPivot.userData = { part: groupPart }
        return wingPivot
      }

      if (def.position) group.position.set(def.position[0], def.position[1], def.position[2])
      if (def.rotation) group.rotation.set(def.rotation[0], def.rotation[1], def.rotation[2])
      if (def.scale && def.type === 'group') group.scale.set(scale[0], scale[1], scale[2])
      group.userData = { part: groupPart, ...(def.animate || {}) }
      return group
    }
    default:
      geometry = new THREE.BoxGeometry(1, 1, 1)
  }

  const part = def.part || null
  const needsPivot = part && (
    part.startsWith('leg_') ||
    part.startsWith('arm_') ||
    part === 'tail' ||
    part.startsWith('wing_')
  )

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.color || '#ffffff'),
    emissive: new THREE.Color(def.emissive || '#000000'),
    emissiveIntensity: def.emissive ? 0.6 : 0,
    metalness: def.metalness ?? 0.3,
    roughness: def.roughness ?? 0.4,
    wireframe: def.wireframe || false,
    transparent: def.opacity !== undefined,
    opacity: def.opacity ?? 1,
    side: def.doubleSide ? THREE.DoubleSide : THREE.FrontSide
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true

  // Handle pivot points for animated parts
  if (needsPivot && def.position) {
    const pivot = new THREE.Group()

    if (part && part.startsWith('arm_')) {
      pivot.position.set(def.position[0], def.position[1] + scale[1] * 0.5, def.position[2])
      mesh.position.set(0, -scale[1] * 0.5, 0)
      if (def.rotation && def.rotation[2]) pivot.rotation.z = def.rotation[2]
    } else if (part && part.startsWith('leg_')) {
      pivot.position.set(def.position[0], def.position[1] + scale[1] * 0.5, def.position[2])
      mesh.position.set(0, -scale[1] * 0.5, 0)
      if (def.rotation) mesh.rotation.set(def.rotation[0], def.rotation[1], def.rotation[2])
    } else if (part === 'wing_l') {
      pivot.position.set(def.position[0] + scale[0] * 0.5, def.position[1], def.position[2])
      mesh.position.set(-scale[0] * 0.5, 0, 0)
      if (def.rotation) mesh.rotation.set(def.rotation[0], def.rotation[1], def.rotation[2])
    } else if (part === 'wing_r') {
      pivot.position.set(def.position[0] - scale[0] * 0.5, def.position[1], def.position[2])
      mesh.position.set(scale[0] * 0.5, 0, 0)
      if (def.rotation) mesh.rotation.set(def.rotation[0], def.rotation[1], def.rotation[2])
    } else if (part === 'tail') {
      pivot.position.set(def.position[0], def.position[1], def.position[2] + scale[1] * 0.3)
      mesh.position.set(0, 0, -scale[1] * 0.3)
      if (def.rotation) mesh.rotation.set(def.rotation[0], def.rotation[1], def.rotation[2])
    }

    // Apply non-uniform scaling to spheres inside pivot (only for rawScale mode)
    if (def.type === 'sphere' && def.rawScale && isNonUniform) {
      mesh.scale.set(1, scale[1] / scale[0], scale[2] / scale[0])
    }

    pivot.add(mesh)
    pivot.userData = {
      part,
      baseY: def.position ? def.position[1] : 0,
      baseRotationZ: def.rotation ? def.rotation[2] : 0
    }
    return pivot
  }

  if (def.position) mesh.position.set(def.position[0], def.position[1], def.position[2])
  if (def.rotation) mesh.rotation.set(def.rotation[0], def.rotation[1], def.rotation[2])

  // Apply non-uniform scaling to spheres (only for rawScale mode)
  if (def.type === 'sphere' && def.rawScale && isNonUniform) {
    mesh.scale.set(1, scale[1] / scale[0], scale[2] / scale[0])
  }

  mesh.userData = {
    ...(def.animate || {}),
    part,
    baseY: def.position ? def.position[1] : 0
  }

  return mesh
}

/**
 * Adjust object position so it sits on the ground
 */
export function adjustGround(obj: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(obj)
  if (box.min.y < -0.05) {
    obj.position.y -= box.min.y
  }
}

/**
 * Remove floating parts below legs
 */
export function removeFloatingParts(root: THREE.Object3D): void {
  let lowestY = Infinity
  let hasLeg = false

  root.traverse(child => {
    if (child.userData?.part?.startsWith('leg_')) {
      hasLeg = true
      const worldPos = new THREE.Vector3()
      child.getWorldPosition(worldPos)
      lowestY = Math.min(lowestY, worldPos.y - 0.5)
    }
  })

  if (!hasLeg) return

  const toRemove: THREE.Mesh[] = []

  root.traverse(child => {
    if (!(child instanceof THREE.Mesh) || child.userData?.part || child.parent?.userData?.part) {
      return
    }

    const worldPos = new THREE.Vector3()
    child.getWorldPosition(worldPos)

    if (worldPos.y < lowestY + 0.3 && child.geometry) {
      child.geometry.computeBoundingBox()
      const bbox = child.geometry.boundingBox
      if (!bbox) return

      const size = new THREE.Vector3()
      bbox.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z)

      if (maxDim < 0.4 || (size.y < 0.15 && (size.x > 0.3 || size.z > 0.3))) {
        toRemove.push(child)
      }
    }
  })

  toRemove.forEach(obj => {
    if (obj.parent) {
      obj.parent.remove(obj)
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose())
        } else {
          obj.material.dispose()
        }
      }
    }
  })
}
