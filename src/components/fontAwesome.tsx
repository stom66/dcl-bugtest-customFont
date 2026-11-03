import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { resolveFontAwesomeIcon } from '../fonts'


export type FontAwesomeProps = {
	/** Icon name — kebab-case (`dice-d20`), camelCase (`diceD20`), or alias (`close` → `xmark`). */
	icon: string
	/** Pixel size for the glyph box and `uiText.fontSize`. Defaults to 32. */
	fontSize?: number
	/** Glyph tint. Defaults to white. */
	fontColor?: Color4
}


// MARK: FontAwesome
/**
 * Font Awesome Free glyph via scene TTF (`fontSrc`). Bare `UiEntity` — only
 * `icon`, `fontSize`, and `fontColor`. Unity Desktop needs asset bundles
 * (`npm run start:bundles`) or PUA glyphs show as tofu.
 */
export function FontAwesome({
	icon,
	fontSize = 32,
	fontColor = Color4.White(),
}: FontAwesomeProps) {
	const resolved = resolveFontAwesomeIcon(icon)

	if (!resolved) {
		console.error(`FontAwesome: unknown icon "${icon}"`)
	}

	return (
		<UiEntity
			uiTransform={{
				width     : fontSize,
				height    : fontSize,
				flexShrink: 0,
			}}
			uiText={{
				value    : resolved?.glyph ?? '',
				fontSize,
				font     : 'sans-serif',
				fontSrc  : resolved?.fontSrc,
				color    : fontColor,
				textAlign: 'middle-center',
			}}
		/>
	)
}
