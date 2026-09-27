import { describe, it, expect } from 'vitest'
import { parseIssueRanges } from '@/lib/parsers/issueRange'

describe('parseIssueRanges', () => {
  it('should parse a simple range', () => {
    const result = parseIssueRanges('Batman #488-496')
    expect(result).toHaveLength(1)
    expect(result[0].seriesName).toBe('Batman')
    expect(result[0].numbers).toEqual(['488', '489', '490', '491', '492', '493', '494', '495', '496'])
  })

  it('should parse multiple ranges', () => {
    const result = parseIssueRanges('Batman #488-496\nDetective Comics #659-662')
    expect(result).toHaveLength(2)
    expect(result[0].seriesName).toBe('Batman')
    expect(result[1].seriesName).toBe('Detective Comics')
  })

  it('should parse single numbers', () => {
    const result = parseIssueRanges('Batman #488, #489, #490')
    expect(result).toHaveLength(1)
    expect(result[0].numbers).toEqual(['488', '489', '490'])
  })

  it('should parse mixed ranges and single numbers', () => {
    const result = parseIssueRanges('Batman #488-490, #495')
    expect(result).toHaveLength(1)
    expect(result[0].numbers).toEqual(['488', '489', '490', '495'])
  })

  it('should handle ranges without #', () => {
    const result = parseIssueRanges('Batman 488-496')
    expect(result).toHaveLength(1)
    expect(result[0].seriesName).toBe('Batman')
    expect(result[0].numbers).toHaveLength(9)
  })

  it('should handle em dash', () => {
    const result = parseIssueRanges('Batman #488–496')
    expect(result).toHaveLength(1)
    expect(result[0].numbers).toEqual(['488', '489', '490', '491', '492', '493', '494', '495', '496'])
  })

  it('should return single issue for text without numbers', () => {
    const result = parseIssueRanges('invalid text')
    expect(result).toHaveLength(1)
    expect(result[0].seriesName).toBe('invalid text')
    expect(result[0].numbers).toEqual(['1'])
  })

  it('should handle empty input', () => {
    const result = parseIssueRanges('')
    expect(result).toHaveLength(0)
  })

  it('should create separate series for semicolon-separated names', () => {
    const result = parseIssueRanges('Batman Special; Batman: Legends; Batman: Ghosts')
    expect(result).toHaveLength(3)
    expect(result[0].seriesName).toBe('Batman Special')
    expect(result[0].numbers).toEqual(['1'])
    expect(result[1].seriesName).toBe('Batman: Legends')
    expect(result[1].numbers).toEqual(['1'])
    expect(result[2].seriesName).toBe('Batman: Ghosts')
    expect(result[2].numbers).toEqual(['1'])
  })
})
