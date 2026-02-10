import { useEffect, useState } from "react"

const useViewportWidthRem = () => {
  const getWidth = () => {
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    )
    return window.innerWidth / rootFontSize
  }

  const [widthRem, setWidthRem] = useState<number>(getWidth())

  useEffect(() => {
    const handleResize = () => setWidthRem(getWidth())
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return widthRem
}

export default useViewportWidthRem
