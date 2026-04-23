import { useEffect, useState } from 'react'

const DASHBOARD_ROOT_PATH = '/dashboard'

function normalizePathname(pathname) {
  if (!pathname) {
    return '/'
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }

  return pathname
}

function getFallbackSection(navItems) {
  return navItems[0]?.id || ''
}

function buildPathLookup(navItems) {
  return new Map(
    navItems.map((item) => [item.id, normalizePathname(item.path || `${DASHBOARD_ROOT_PATH}/${item.id}`)]),
  )
}

function getSectionFromPath(pathname, navItems, fallbackSection) {
  const normalizedPath = normalizePathname(pathname)

  if (normalizedPath === '/' || normalizedPath === DASHBOARD_ROOT_PATH) {
    return fallbackSection
  }

  const matchedItem = navItems.find(
    (item) => normalizePathname(item.path || `${DASHBOARD_ROOT_PATH}/${item.id}`) === normalizedPath,
  )

  return matchedItem?.id || fallbackSection
}

function syncBrowserPath(sectionId, pathLookup, replace = false) {
  if (typeof window === 'undefined' || !sectionId) {
    return
  }

  const targetPath = pathLookup.get(sectionId)
  if (!targetPath) {
    return
  }

  const currentPath = normalizePathname(window.location.pathname)
  if (currentPath === targetPath) {
    return
  }

  const method = replace ? 'replaceState' : 'pushState'
  window.history[method]({}, '', targetPath)
}

function useSectionRouting(navItems) {
  const fallbackSection = getFallbackSection(navItems)
  const pathLookup = buildPathLookup(navItems)
  const routeSignature = navItems.map((item) => `${item.id}:${item.path || ''}`).join('|')

  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === 'undefined') {
      return fallbackSection
    }

    return getSectionFromPath(window.location.pathname, navItems, fallbackSection)
  })

  function selectSection(sectionId) {
    if (!pathLookup.has(sectionId)) {
      return
    }

    setActiveSection(sectionId)
    syncBrowserPath(sectionId, pathLookup)
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    function handlePopState() {
      setActiveSection(getSectionFromPath(window.location.pathname, navItems, fallbackSection))
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [fallbackSection, navItems, routeSignature])

  const resolvedActiveSection = pathLookup.has(activeSection)
    ? activeSection
    : getSectionFromPath(
        typeof window === 'undefined' ? '' : window.location.pathname,
        navItems,
        fallbackSection,
      )

  const currentSection = pathLookup.has(resolvedActiveSection)
    ? resolvedActiveSection
    : fallbackSection

  useEffect(() => {
    if (!currentSection) {
      return
    }

    syncBrowserPath(currentSection, pathLookup, true)
  }, [currentSection, pathLookup, routeSignature])

  return {
    activeSection: currentSection,
    selectSection,
  }
}

export default useSectionRouting
