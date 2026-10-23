#!/usr/bin/env python3
"""Optional development tool: rebuild the OFL heading font subset (fontTools)."""
from pathlib import Path
from fontTools import subset

root = Path(__file__).resolve().parents[1]
text = ''.join(file.read_text(encoding='utf-8') for file in [root / 'index.html', *sorted((root / 'src').glob('*.js'))])
options = subset.Options()
options.flavor = 'woff'
font = subset.load_font(str(root / 'assets/fonts/MaShanZheng-Regular.ttf'), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=''.join(sorted(set(text))))
subsetter.subset(font)
output = root / 'assets/fonts/MaShanZheng-Game.woff'
subset.save_font(font, str(output), options)
print(f'Subset font: {output.stat().st_size:,} bytes; source OFL retained')
