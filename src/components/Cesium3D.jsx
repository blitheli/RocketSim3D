import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { ROCKET_TYPES } from '../data/rockets'

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN ?? ''

/** 按物理像素渲染（非 CSS 像素），避免高 DPI / 系统缩放下文字与线条发糊 */
function applySharpRendering(viewer) {
  viewer.useBrowserRecommendedResolution = false
  viewer.resolutionScale = 1
  if (viewer.scene.postProcessStages?.fxaa) {
    viewer.scene.postProcessStages.fxaa.enabled = false
  }
  viewer.resize()
}

export default function Cesium3D({ trajectoryPoints, rocketType, launchSite }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return undefined

    const hasIonToken = Boolean(import.meta.env.VITE_CESIUM_ION_TOKEN)
    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      imageryProvider: false,
      terrain: hasIonToken ? Cesium.Terrain.fromWorldTerrain() : undefined,
      useBrowserRecommendedResolution: false,
    })

    if (!hasIonToken) {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          credit: '© OpenStreetMap contributors',
        }),
      )
    }

    viewer.scene.globe.depthTestAgainstTerrain = true
    applySharpRendering(viewer)
    viewerRef.current = viewer

    const resizeObserver = new ResizeObserver(() => {
      if (!viewer.isDestroyed()) applySharpRendering(viewer)
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      viewer.destroy()
      viewerRef.current = null
    }
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return undefined

    viewer.entities.removeAll()

    const launchPos = getLaunchPosition(launchSite)
    viewer.entities.add({
      name: '发射点',
      position: Cesium.Cartesian3.fromDegrees(
        launchPos.lon,
        launchPos.lat,
        launchPos.alt,
      ),
      point: {
        pixelSize: 10,
        color: Cesium.Color.ORANGE,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
      },
      label: {
        text: `发射点 ${launchSite ?? ''}`,
        font: '14px sans-serif',
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        outlineColor: Cesium.Color.BLACK,
        pixelOffset: new Cesium.Cartesian2(0, -18),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })

    if (trajectoryPoints?.length > 1) {
      const positions = trajectoryPoints.map((p) =>
        Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.alt),
      )

      viewer.entities.add({
        name: '弹道轨迹',
        polyline: {
          positions,
          width: 6,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.15,
            color: Cesium.Color.fromCssColorString('#C71585'),
          }),
        },
      })

      const last = trajectoryPoints[trajectoryPoints.length - 1]
      viewer.entities.add({
        name: '入轨点',
        position: Cesium.Cartesian3.fromDegrees(last.lon, last.lat, last.alt),
        point: {
          pixelSize: 8,
          color: Cesium.Color.LIME,
        },
      })

      viewer.zoomTo(viewer.entities)
    } else {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          launchPos.lon,
          launchPos.lat,
          2500000,
        ),
        duration: 0.5,
      })
    }
  }, [trajectoryPoints, rocketType, launchSite])

  return (
    <div className="view-panel">
      <div className="cesium-overlay">
        Cesium 三维弹道 | {ROCKET_TYPES[rocketType]?.label ?? rocketType}
        {trajectoryPoints?.length ? ` | ${trajectoryPoints.length} 轨迹点` : ' | 等待计算结果'}
      </div>
      <div className="cesium-wrap" ref={containerRef} />
    </div>
  )
}

function getLaunchPosition(site) {
  const sites = {
    ty: { lon: 112.6, lat: 38.8, alt: 1500 },
    xc: { lon: 102.0, lat: 28.2, alt: 1800 },
    jqs: { lon: 100.3, lat: 40.9, alt: 1000 },
  }
  return sites[site] ?? sites.ty
}
