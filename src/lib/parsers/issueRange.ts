interface ParsedRange {
  seriesName: string
  numbers: string[]
}

export function parseIssueRanges(text: string): ParsedRange[] {
  const results: ParsedRange[] = []
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  for (const line of lines) {
    // Find where numbers start (first digit or #digit)
    const numbersStart = line.search(/#?\d/)
    
    if (numbersStart > 0) {
      const seriesName = line.substring(0, numbersStart).replace(/#+$/, '').trim()
      const numbersPart = line.substring(numbersStart).replace(/^#/, '')
      
      const numbers = parseNumbers(numbersPart)
      
      if (numbers.length > 0 && seriesName.length > 0) {
        results.push({ seriesName, numbers })
      }
    }
  }
  
  return results
}

function parseNumbers(text: string): string[] {
  const numbers: string[] = []
  
  // Split by commas, semicolons, or spaces followed by #
  const parts = text.split(/[,;]+|(?:\s*#\s*)/).map(p => p.trim()).filter(Boolean)
  
  for (const part of parts) {
    const cleaned = part.replace(/^#/, '').trim()
    
    const rangeMatch = cleaned.match(/(\d+)\s*[-–]\s*(\d+)/)
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1])
      const end = parseInt(rangeMatch[2])
      for (let i = start; i <= end; i++) {
        numbers.push(i.toString())
      }
    } else {
      const singleMatch = cleaned.match(/^(\d+)$/)
      if (singleMatch) {
        numbers.push(singleMatch[1])
      }
    }
  }
  
  return numbers
}

export function formatParsedRanges(ranges: ParsedRange[]): string {
  return ranges
    .map(r => `${r.seriesName}: #${r.numbers[0]}${r.numbers.length > 1 ? `-#${r.numbers[r.numbers.length - 1]}` : ''} (${r.numbers.length} números)`)
    .join('\n')
}
