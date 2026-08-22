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

function createOsmImageryViewModel() {
  return new Cesium.ProviderViewModel({
    name: 'OpenStreetMap',
    tooltip: 'OpenStreetMap 影像',
    iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
    creationFunction() {
      return new Cesium.UrlTemplateImageryProvider({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        credit: '© OpenStreetMap contributors',
        maximumLevel: 19,
      })
    },
  })
}

function createEllipsoidTerrainViewModel() {
  return new Cesium.ProviderViewModel({
    name: 'WGS84 椭球',
    tooltip: '无地形起伏（椭球面）',
    iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/Ellipsoid.png'),
    creationFunction() {
      return new Cesium.EllipsoidTerrainProvider()
    },
  })
}

export default function Cesium3D({ trajectoryPoints, rocketType, launchSite }) {
  const panelRef = useRef(null)
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return undefined

    const hasIonToken = Boolean(import.meta.env.VITE_CESIUM_ION_TOKEN)
    const osmImagery = createOsmImageryViewModel()
    const ellipsoidTerrain = createEllipsoidTerrainViewModel()
    const imageryProviderViewModels = hasIonToken
      ? [...Cesium.createDefaultImageryProviderViewModels(), osmImagery]
      : [osmImagery]
    const terrainProviderViewModels = hasIonToken
      ? Cesium.createDefaultTerrainProviderViewModels()
      : [ellipsoidTerrain]

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      fullscreenButton: true,
      fullscreenElement: panelRef.current ?? containerRef.current,
      infoBox: false,
      selectionIndicator: false,
      imageryProviderViewModels,
      selectedImageryProviderViewModel: hasIonToken
        ? imageryProviderViewModels[0]
        : osmImagery,
      terrainProviderViewModels,
      selectedTerrainProviderViewModel: hasIonToken
        ? terrainProviderViewModels.find((m) => /terrain/i.test(m.name)) ??
          terrainProviderViewModels[0]
        : ellipsoidTerrain,
      useBrowserRecommendedResolution: false,
    })

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
    <div className="view-panel" ref={panelRef}>
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
    jq: { lon: 100.3, lat: 40.9, alt: 1000 },
    jqs: { lon: 100.3, lat: 40.9, alt: 1000 },
    wc: { lon: 110.95, lat: 19.61, alt: 0 },
    SLC40: { lon: -80.604, lat: 28.608, alt: 0 },
    Vandenberg: { lon: -120.611, lat: 34.632, alt: 0 },
    Baikonur: { lon: 63.342, lat: 45.964, alt: 100 },
    Plesetsk: { lon: 40.357, lat: 62.928, alt: 200 },
    Kourou: { lon: -52.768, lat: 5.239, alt: 0 },
    Zhongzidao: { lon: 131.079, lat: 30.398, alt: 0 },
  }
  return sites[site] ?? sites.ty
}
