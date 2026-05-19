export interface Range {
  start: Date
  end: Date
} //TODO DEDUPE

export function getPreviousRange(range: Range): Range {
  const diff =
    range.end.getTime() - range.start.getTime()

  return {
    start: new Date(
      range.start.getTime() - diff
    ),
    end: new Date(
      range.end.getTime() - diff
    )
  }
}

export function calcVariation(
  current: number,
  previous: number
) {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }

  return Math.round(
    ((current - previous) / previous) * 100
  )
}