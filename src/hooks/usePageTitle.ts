import { useEffect } from 'react'

/** Вкладка браузера должна называться по экрану, а не всегда «FRAME». */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
