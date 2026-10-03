// A small puff alphabet: no font files, images or additional animation loops.
const glyphs: Record<string, string[]> = {
  A: ['01110', '11011', '11011', '11111', '11011', '11011', '11011'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '01010'],
  S: ['01111', '11000', '11000', '01110', '00011', '00011', '11110'],
  Z: ['11111', '00011', '00110', '01100', '11000', '11000', '11111'],
  U: ['11011', '11011', '11011', '11011', '11011', '11011', '01110'],
  R: ['11110', '11011', '11011', '11110', '11100', '11010', '11011'],
  E: ['11111', '11000', '11000', '11110', '11000', '11000', '11111'],
  G: ['01111', '11000', '11000', '11011', '11011', '11011', '01110'],
  O: ['01110', '11011', '11011', '11011', '11011', '11011', '01110'],
  L: ['11000', '11000', '11000', '11000', '11000', '11000', '11111'],
  C: ['01111', '11000', '11000', '11000', '11000', '11000', '01111'],
  D: ['11110', '11011', '11011', '11011', '11011', '11011', '11110'],
}

// Decorative sky props, not claims of cloud-platform experience.
export function CloudTechnology({ name, index }: { name: string; index: number }) {
  const lines = name.toUpperCase().split(' ')
  const columns = Math.max(...lines.map(line => line.length * 6 - 1))
  const puffs = lines.flatMap((line, lineIndex) => [...line].flatMap((letter, letterIndex) =>
    glyphs[letter].flatMap((row, y) => [...row].flatMap((cell, x) => cell === '1' ? [{
      x: 14 + ((columns - (line.length * 6 - 1)) / 2 + letterIndex * 6 + x) * 10,
      y: 14 + (lineIndex * 9 + y) * 10,
    }] : []))))
  return <div className={`sky-cloud sky-cloud-word sky-cloud-word-${index}`} aria-hidden="true" data-cloud-word={name}>
    <svg viewBox={`0 0 ${columns * 10 + 18} ${lines.length * 90}`} aria-hidden="true" focusable="false">
      <g fill="#9dcfe3" opacity=".8">
        {puffs.map(({ x, y }, i) => <circle key={i} cx={x} cy={y + 4} r={7.2} />)}
      </g>
      <g fill="#eefaff">
        {puffs.map(({ x, y }, i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 7.4 : 6.5} />)}
      </g>
      <g fill="#fff" opacity=".75">
        {puffs.filter((_, i) => i % 3 === 0).map(({ x, y }, i) => <circle key={i} cx={x - 1.5} cy={y - 2} r={3.2} />)}
      </g>
    </svg>
  </div>
}
