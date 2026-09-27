interface ParsedRange {
  seriesName: string
  numbers: string[]
}

export function parseIssueRanges(text: string): ParsedRange[] {
  const results: ParsedRange[] = []
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  for (const line of lines) {
    const semicolonParts = line.split(';').map(p => p.trim()).filter(Boolean)
    
    if (semicolonParts.length > 1) {
      // Each semicolon-separated name becomes its own series with issue #1
      for (const name of semicolonParts) {
        results.push({ seriesName: name, numbers: ['1'] })
      }
    } else {
      const numbersStart = line.search(/#?\d/)
      
      if (numbersStart > 0) {
        const seriesName = line.substring(0, numbersStart).replace(/#+$/, '').trim()
        const numbersPart = line.substring(numbersStart).replace(/^#/, '')
        
        const numbers = parseNumbers(numbersPart)
        
        if (numbers.length > 0 && seriesName.length > 0) {
          results.push({ seriesName, numbers })
        }
      } else if (line.length > 0) {
        results.push({ seriesName: line, numbers: ['1'] })
      }
    }
  }
  
  return results
}

function parseNumbers(text: string): string[] {
  const numbers: string[] = []
  
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
    .map(r => {
      if (r.numbers.length === 1 && r.numbers[0] === '1') {
        return r.seriesName
      }
      return `${r.seriesName}: #${r.numbers[0]}${r.numbers.length > 1 ? `-#${r.numbers[r.numbers.length - 1]}` : ''} (${r.numbers.length} números)`
    })
    .join('\n')
}
