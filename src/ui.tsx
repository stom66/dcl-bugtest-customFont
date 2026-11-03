import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'

import { FontAwesome } from './components/fontAwesome'
import { FONT_AWESOME_ICONS, resolveFontAwesomeIcon } from './fonts'


const BATCH_SIZE   = 50
const COLUMN_COUNT = 5
const PER_COLUMN   = Math.ceil(BATCH_SIZE / COLUMN_COUNT)
const COLUMN_GAP   = 12
const ROW_HEIGHT   = 56
const LABEL_WIDTH  = 220

const TILE  = Color4.create(0.15, 0.17, 0.22, 1)
const MUTED = Color4.create(0.7, 0.75, 0.8, 1)
const INK   = Color4.White()

/**
 * Solid-routed icons whose codepoint is not in duck-font-awesome-solid.ttf.
 * They are always tofu, so they are left out to keep the atlas test clean.
 */
const MISSING_FROM_TTF = new Set([
	'alarm-clock', 'bus-side', 'hexagon', 'mobile-vibrate', 'non-binary', 'octagon',
	'pentagon', 'septagon', 'single-quote-left', 'single-quote-right', 'spiral',
])


type SampleIcon = {
	name   : string
	unicode: string
}

type SampleColumnProps = {
	key   : string
	icons : readonly SampleIcon[]
	isLast: boolean
}


// MARK: shuffle
function shuffle<T>(items: readonly T[]): T[] {
	const copy = items.slice()
	for (let index = copy.length - 1; index > 0; index--) {
		const swapIndex = Math.floor(Math.random() * (index + 1))
		const current   = copy[index]
		copy[index]     = copy[swapIndex]
		copy[swapIndex] = current
	}
	return copy
}


// MARK: buildSolidPool
/**
 * Every Private Use Area icon that renders from the solid TTF, shuffled once
 * per scene load. Batches are consecutive slices, so no icon repeats.
 */
function buildSolidPool(): SampleIcon[] {
	const pool: SampleIcon[] = []
	for (const name of Object.keys(FONT_AWESOME_ICONS)) {
		const entry = FONT_AWESOME_ICONS[name]
		// Basic Latin in this font is digits and letters, which the converter
		// pre-fills into the atlas anyway. Only test runtime-added glyphs.
		if (parseInt(entry.unicode, 16) < 0xE000) {
			continue
		}
		if (MISSING_FROM_TTF.has(name)) {
			continue
		}
		if (resolveFontAwesomeIcon(name)?.style !== 'solid') {
			continue
		}
		pool.push({ name, unicode: entry.unicode })
	}
	return shuffle(pool)
}


const SOLID_POOL  = buildSolidPool()
const BATCH_COUNT = Math.ceil(SOLID_POOL.length / BATCH_SIZE)


// MARK: getBatch
function getBatch(batchIndex: number): SampleIcon[] {
	const start = batchIndex * BATCH_SIZE
	return SOLID_POOL.slice(start, start + BATCH_SIZE)
}


// MARK: toColumns
function toColumns(icons: readonly SampleIcon[]): SampleIcon[][] {
	const columns: SampleIcon[][] = []
	for (let column = 0; column < COLUMN_COUNT; column++) {
		const start = column * PER_COLUMN
		columns.push(icons.slice(start, start + PER_COLUMN))
	}
	return columns
}


// MARK: SampleColumn
function SampleColumn(props: SampleColumnProps) {
	const icons  = props.icons
	const isLast = props.isLast

	return (
		<UiEntity
			uiTransform={{
				width        : '19%',
				height       : '100%',
				display      : 'flex',
				flexDirection: 'column',
				flexShrink   : 1,
				alignItems   : 'flex-start',
				margin       : { right: isLast ? 0 : COLUMN_GAP },
			}}
		>
			{icons.map((icon) => (
				<UiEntity
					key={icon.name}
					uiTransform={{
						width        : '100%',
						height       : ROW_HEIGHT,
						display      : 'flex',
						flexDirection: 'row',
						alignItems   : 'center',
						flexShrink   : 0,
					}}
				>
					<UiEntity
						uiTransform={{
							width         : 40,
							height        : 40,
							flexShrink    : 0,
							margin        : { right: 10 },
							display       : 'flex',
							alignItems    : 'center',
							justifyContent: 'center',
						}}
						uiBackground={{ color: TILE }}
					>
						<FontAwesome icon={icon.name} fontSize={26} />
					</UiEntity>
					<Label
						value={`${icon.name}  ${icon.unicode}`}
						fontSize={14}
						color={INK}
						textAlign="middle-left"
						textWrap="nowrap"
						uiTransform={{
							width   : LABEL_WIDTH,
							height  : 40,
							overflow: 'hidden',
						}}
					/>
				</UiEntity>
			))}
		</UiEntity>
	)
}


// MARK: setupUi
/** Mount the font debug UI (virtual 1920×1080). */
export function setupUi() {
	ReactEcsRenderer.setUiRenderer(uiMenu, { virtualWidth: 1920, virtualHeight: 1080 })
}


// MARK: uiMenu
/**
 * Atlas-capacity probe: 50 solid icons per batch, never repeating. Step
 * through batches on one fresh load and note where tofu starts. Go back to
 * batch 1 afterwards: icons already in the atlas should still render.
 */
export const uiMenu = () => {
	const [batchIndex, setBatchIndex] = ReactEcs.useState<number>(0)
	const [furthest, setFurthest]     = ReactEcs.useState<number>(0)
	const icons                       = getBatch(batchIndex)
	const columns                     = toColumns(icons)
	const firstShown                  = batchIndex * BATCH_SIZE + 1
	const lastShown                   = batchIndex * BATCH_SIZE + icons.length
	const requested                   = Math.min(SOLID_POOL.length, (furthest + 1) * BATCH_SIZE)

	return (
		<UiEntity
			uiTransform={{
				positionType : 'absolute',
				position     : { top: 0, right: 0 },
				width        : '75%',
				height       : '100%',
				display      : 'flex',
				flexDirection: 'column',
				alignItems   : 'flex-start',
				padding      : { top: 32, right: 24, bottom: 32, left: 24 },
			}}
			uiBackground={{ color: Color4.create(0.08, 0.09, 0.12, 0.92) }}
		>
			<UiEntity
				uiTransform={{
					width         : '100%',
					height        : 48,
					display       : 'flex',
					flexDirection : 'row',
					alignItems    : 'center',
					justifyContent: 'flex-start',
					margin        : { bottom: 8 },
				}}
			>
				<Label
					value={`Atlas probe — batch ${batchIndex + 1} of ${BATCH_COUNT}`}
					fontSize={28}
					color={INK}
					textAlign="middle-left"
					uiTransform={{ width: 520, height: 40, margin: { right: 16 } }}
				/>
				<Button
					value="Previous 50"
					variant="secondary"
					fontSize={18}
					textAlign="middle-center"
					disabled={batchIndex === 0}
					onMouseDown={() => {
						setBatchIndex(Math.max(0, batchIndex - 1))
					}}
					uiTransform={{ width: 200, height: 44, margin: { right: 12 } }}
				/>
				<Button
					value="Load next 50"
					variant="primary"
					fontSize={18}
					textAlign="middle-center"
					disabled={batchIndex >= BATCH_COUNT - 1}
					onMouseDown={() => {
						const next = Math.min(BATCH_COUNT - 1, batchIndex + 1)
						setBatchIndex(next)
						setFurthest(Math.max(furthest, next))
					}}
					uiTransform={{ width: 200, height: 44 }}
				/>
			</UiEntity>
			<Label
				value={`Showing solid icons ${firstShown}–${lastShown} of ${SOLID_POOL.length}. Unique solid icons requested since scene load: ${requested}. Use npm run start:bundles.`}
				fontSize={15}
				color={MUTED}
				textAlign="middle-left"
				uiTransform={{ width: '100%', height: 28, margin: { bottom: 12 } }}
			/>
			<UiEntity
				uiTransform={{
					width         : '100%',
					height        : PER_COLUMN * ROW_HEIGHT,
					display       : 'flex',
					flexDirection : 'row',
					alignItems    : 'flex-start',
					justifyContent: 'flex-start',
				}}
			>
				{columns.map((column, columnIndex) => (
					<SampleColumn
						key={`column-${columnIndex}`}
						icons={column}
						isLast={columnIndex === COLUMN_COUNT - 1}
					/>
				))}
			</UiEntity>
		</UiEntity>
	)
}
